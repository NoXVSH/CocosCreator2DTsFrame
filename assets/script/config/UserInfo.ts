import PlatformManager from "../platform/PlatformManager";
import EventManager from "../core/event/EventManager";
import { EventType } from "../core/event/EventType";
import { HttpManager } from "../core/net/HttpManager";
import Util from "../core/utils/Util";
import BaseConfig from "../core/config/BaseConfig";
import MyGlobal from "./MyGlobal";

export enum UserInfoPropertyKey {
    userid = "userid",
}

export enum UserInfoJsonKey {
    gold = "gold",
    energy = "energy",
    energyRecoverTime = "energyRecoverTime",

    watchVideoCount = "watchVideoCount",
    
    isGM = "isGM",

    dailyTaskDate = "dailyTaskDate",

    dataVersion = "dataVersion",
}

const SAVE_KEY_PREFIX = "userdata-";
const MapTypeDataName = [ //键值对数据名注册

];

/*
功能：定义玩家存储数据的数据结构，实现内存-本地，内存-服务器数据转换
*/
let property = {
    userid: 0,
    imgindex: 0,
    score: 0,
    maxscore: 0,
    userjson: {
        gold: 100, //初始金币
        energy: 0,
        energyRecoverTime: 0,

        watchVideoCount: 0,
        
        dailyTaskDate: "2019-01-01",

        isGM: false,

        dataVersion: "",
    },
    //////////////////////
    reftime: 0, // 分数刷新时间
    phone_brand: "",//手机品牌
    phone_model: "",//手机型号
    wx_version: "",//微信版本号
    platform: "ios",//"android",
    name: "", //平台用户名称
    imgpath: "", //平台用户头像
};

export default class UserInfo {
    private static _instance: UserInfo;

    static get Instance(): UserInfo {
        if (this._instance == null) {
            this._instance = new UserInfo();
        }

        return this._instance;
    }

    init(): void {
        this.addEvent();
    }

    addEvent() {
        EventManager.Instance.once(EventType.LoginSuccess, () => {
            setInterval(() => {
                log("每分钟自动上传UserInfo");
                this.SaveData();
            }, 60000);
        }, this);

        EventManager.Instance.on(EventType.GameOnHide, this.SaveData, this);
    }

    setDataFromLocal() {
        let localdata = cc.sys.localStorage.getItem('userdata');
        let getResult = {success : true};

        if (localdata) {
            let localData = JSON.parse(localdata);
            log("UserInfo.Instance.init()成功, 本地数据如下：");
            log(localData);
            for (let key in localData) {
                if (Util.Instance.isObj(localData[key])) { //目前只有userjson 字段才是对象   
                    this.initUserJson(property[key], getResult);
                } else {
                    property[key] = localData[key];
                }
            }
        }
        else getResult.success = false;

        return getResult;
    }

    //读取服务器数据到内存
    setDataFromServer(datas): void {
        for (let key in datas) {
            if (Util.Instance.isObj(property[key]) && typeof datas[key] === "string") {
                let localData = JSON.parse(datas[key]);
                if (this.isMapData(key)) property[key] = datas[key];
                else this.deepCopy(property[key], localData);

            } else {
                property[key] = datas[key];
            }
        }
    }

    initUserJson(targetObj, getResult) {
        let userJsonDataStr = null;
        let userJsonData = null;

        for (const key in targetObj) {
            userJsonDataStr = cc.sys.localStorage.getItem(SAVE_KEY_PREFIX + key);
            if (!userJsonDataStr) { //一旦存在数据读取失败,立即中断
                getResult.success = false;
                return;
            }
            userJsonData = JSON.parse(userJsonDataStr);
            log(key, userJsonData);

            if (Util.Instance.isObj(targetObj[key]) && Util.Instance.isObj(userJsonData)) {
                if (this.isMapData(key)) targetObj[key] = userJsonData;
                else this.deepCopy(targetObj[key], userJsonData);
            }
            else {
                targetObj[key] = userJsonData;
            }
        }
    }

    /**
     * 深层复制
     * @param targetObj 目标对象
     * @param copyObj 复制对象
     */
    deepCopy(targetObj, copyObj) {
        for (let key in targetObj) {
            if (Util.Instance.isObj(targetObj[key]) && Util.Instance.isObj(copyObj[key])) {
                if (this.isMapData(key)) targetObj[key] = copyObj[key];
                else this.deepCopy(targetObj[key], copyObj[key]);
            } else if (copyObj[key] !== undefined) {
                targetObj[key] = copyObj[key];
            }
        }
    }

    SaveData(noUpload: boolean = false, noSaveUserJson: boolean = false): void {
        //本地保存
        log("上传到服务器的数据：", property);

        let userdata = {}; //外围数据, 不包括userjson
        for (const key in property) {
            if (Util.Instance.isObj(property[key])) {
                userdata[key] = {};

                if (!noSaveUserJson) {
                    let userJson = property[key];
                    for (const name in userJson) {
                        let data = userJson[name];
                        cc.sys.localStorage.setItem(SAVE_KEY_PREFIX + name, JSON.stringify(data));
                    }
                }

            } else {
                userdata[key] = property[key];
            }
        }
        cc.sys.localStorage.setItem('userdata', JSON.stringify(userdata));
        //上传服务器
        if (!noUpload) {
            this.Upload();
        }
    }

    Upload(): void {
        if (!this.UserIdInvalid()) {//UserId有效才上传
            //必须包含 userid字段
            //需要上传数据库的字段
            // let upnames = ["userid","imgindex","score","maxscore","userjson"];
            let upnames = ["userid", "maxscore", "userjson", "phone_brand", "phone_model", "wx_version"];
            let datas = {};

            for (let k in upnames) {
                if (typeof property[upnames[k]] === "object") {
                    datas[upnames[k]] = JSON.stringify(property[upnames[k]]);
                }
                else {
                    datas[upnames[k]] = property[upnames[k]];
                }
            }
            HttpManager.Instance.get('upload', datas, ret => {
                if (ret.errcode === 0) {
                    cc.sys.localStorage.setItem('datasync', 'ok');
                }
                else {
                    cc.sys.localStorage.setItem('datasync', 'xxx');
                }
            });

            this.UpToWx();
        }
    }

    UpLoadPlatformNameAndHeadIcon(): void {
        let data = {} as any;
        data.userid = this.GetUserId();
        data.name = this.getPlatformUserName();
        data.imgpath = this.getPlatformUserIconUrl();

        HttpManager.Instance.get('upload', data, ret => {
        });
    }

    UpToWx(): void {
        if(BaseConfig.Instance.getIsTest()){
            return;
        }
        
        //需要上传微信的字段
        let updata = {
            userid: property.userid,
            time: new Date().toLocaleDateString().split('/').join('-')  //服务器上传成功返回的时间
        };
        log("上传平台子域数据", updata);
        let kvlist = [];
        for (let k in updata) {
            let d = {} as any;
            d.key = '' + k;
            d.value = '' + updata[k];
            kvlist.push(d);
        }
        PlatformManager.Instance.SaveToPlatform(kvlist, function () {
            cc.sys.localStorage.setItem('datasync', 'xxx');
        })
    }

    GetUserId(): number {
        return property.userid;
    }

    SetUserId(id: number): void {
        property.userid = id;
    }

    UserIdInvalid(): boolean {
        return typeof property.userid !== "number" || property.userid === 0;
    }

    SetPhoneBrand(str: string): void {
        property.phone_brand = str;
    }

    SetPhoneModel(str: string): void {
        property.phone_model = str;
    }

    SetWXVersion(str: string): void {
        property.wx_version = str;
    }

    SetPlatform(str: string): void {
        property.platform = str;
    }

    GetPlatform(): string {
        return property.platform === "ios" ? "ios" : "android";
    }

    setIsGM(bool: boolean, isSave: boolean = true): void {
        property.userjson.isGM = bool;
        EventManager.Instance.emit(EventType.GMChange);
        isSave && this.__saveUserJsonByKey("isGM");
    }

    getIsGM() {
        return property.userjson.isGM;
    }

    setPlatformUserName(value: string, isSave: boolean = true): void {
        property.name = value;
        isSave && this.SaveData(true, true);
    }

    setPlatformUserIconUrl(value: string, isSave: boolean = true): void {
        property.imgpath = value;
        isSave && this.SaveData(true, true);
    }

    getPlatformUserName(): string {
        return property.name;
    }

    getPlatformUserIconUrl(): string {
        return property.imgpath;
    }

    getWatchVideoCount(): number {
        return property.userjson.watchVideoCount;
    }

    setWatchVideoCount(value: number, isSave: boolean = true): void {
        property.userjson.watchVideoCount = value;
        EventManager.Instance.emit(EventType.WatchVideoCountChange, value);
        isSave && this.__saveUserJsonByKey("watchVideoCount");
    }

    getProperty(key: UserInfoPropertyKey) {
        return property[key];
    }

    setProperty(key: UserInfoPropertyKey, val: any, isNowSave = true) {
        property[key] = val;
        (isNowSave || CC_PREVIEW) && this.SaveData(true, true);
    }

    getUserjson(key: UserInfoJsonKey): any {
        return property.userjson[key];
    }

    setUserjson(key: UserInfoJsonKey, val: any, isNowSave = false) {
        (<any>property.userjson[key]) = val;
        (isNowSave || CC_PREVIEW) && this.__saveUserJsonByKey(key);
    }

    private __saveUserJsonByKey(key) {
        let data = property.userjson[key];
        cc.sys.localStorage.setItem(SAVE_KEY_PREFIX + key, JSON.stringify(data));

        log(`保存${key}成功`, data);
    }

    //方便控制台调试输出
    __getProperty() {
        return property;
    }

    private isMapData(dataName): boolean {
        return MapTypeDataName.indexOf(dataName) != -1;
    }

    __clear() {
        EventManager.Instance.off(EventType.GameOnHide, this.SaveData, this); //避免强关游戏 触发onhide回调
        cc.sys.localStorage.clear();
        this.__clearServerUserJsonData();
        PlatformManager.Instance.exitMiniProgram(); //直接强关游戏
    }

    __directGetUseJsonStroageData(key : UserInfoJsonKey) {
        let value = cc.sys.localStorage.getItem(SAVE_KEY_PREFIX + key);
        return value ? JSON.parse(value) : null;
    }

    __clearServerUserJsonData() {
        let data = {} as any;
        data.userid = this.GetUserId();
        data.userjson = JSON.stringify({dataVersion : MyGlobal.Instance.Version});;

        HttpManager.Instance.get('upload', data, ret => {
        });
    }


}


window.regVar("UserInfo", UserInfo);
