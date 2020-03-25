
import PlatformManager from "../platform/PlatformManager";
import { HttpManager } from "../core/net/HttpManager";
import EventManager from "../core/event/EventManager";
import { EventType } from "../core/event/EventType";
import UserInfo, { UserInfoJsonKey } from "./UserInfo";

// 本地数据配置
let localInfo = {
    isSound: true,  //是否开启音效
    isVibrate: true, //是否开启震动
    mulDrawRate : 1, //抽奖的倍率
    drawCount : 0, //抽奖次数
    showAllLog : false,
    showGmBtn : false,
};

export enum LocalInfoKey {
    showGmBtn = "showGmBtn",
}

export default class MyGlobal {
    private static _instance : MyGlobal;

    static get Instance() : MyGlobal {
        if(this._instance == null) {
            this._instance = new MyGlobal();
        }

        return this._instance;
    }

    public name : string = "MyGlobal";
    public Version : string = "1.1.2";
    public gameId : number = 190;
    public isLogin : boolean = false;
    public loginTime : number = 0;
    public isNewVersion : boolean = false;
    public isNewUser : boolean = false;
    public isClearPlayData : boolean = false;

    private clickTime : number = null; //记录按钮点击时间 防止同时点击按钮

    // 读取本地数据到内存
    init() : void {
        let data1 = cc.sys.localStorage.getItem("localInfo");
        if (data1) {
            let data2 = JSON.parse(data1);
            for (let K in data2) {
                localInfo[K] = data2[K];
            }
        }

        this.addEvent();
    }

    addEvent() {
        EventManager.Instance.once(EventType.LoginSuccess, this.loginSuccess, this);
    }

    loginSuccess(data) { 
        let curTimeStamp = data.curTimeStamp;
        let ret = data.ret;

        this.isLogin = true;
        this.setLoginTime(curTimeStamp);
        MyGlobal.Instance.isNewUser = ret && ret.data.isNew;

        //检测是否为新版本
        let dataVersion = UserInfo.Instance.getUserjson(UserInfoJsonKey.dataVersion);

        if(!this.isNewUser && dataVersion != this.Version) {
            this.isNewVersion = true;
            warnlog("旧版本->新版本", dataVersion, this.Version);
        }
      
        UserInfo.Instance.setUserjson(UserInfoJsonKey.dataVersion, this.Version, true);
        UserInfo.Instance.Upload();
    }

    getLocalInfo(key : LocalInfoKey) {
        return localInfo[key];
    }

    setLocalInfo(key : LocalInfoKey, value : any) {
        if(localInfo[key] == null) return;
        localInfo[key] = value;
        this.SaveLocalData();

        log(`Save LocalData ---- ${key} ----- ${value}`);
    }

    // 保存数据到本地
    SaveLocalData() : void {
        cc.sys.localStorage.setItem("localInfo", JSON.stringify(localInfo));
    }

    toggleSound() : void { //震动开关 暂时跟着 声音开关走
        localInfo.isSound = !localInfo.isSound;
        localInfo.isVibrate = !localInfo.isVibrate;
        EventManager.Instance.emit(EventType.AudioSettingChange);
        this.SaveLocalData();
    }

    getHaveSound() : boolean {
        return localInfo.isSound;
    }

    getHaveVibrate() : boolean {
        return localInfo.isVibrate;
    }

    point(code : string | number, type ? : number) : void {
        if (code && PlatformManager.Instance.isDaDian()) {
            type = type === undefined ? 1 : type;
            this.__point(code, type);
        }
    }

    pointWithOnce(code : string | number, type ? : number) { //单次打点
        if(code && PlatformManager.Instance.isDaDian()) {
            let isPoint = this.getLocalNumData(`PointOnce${code}`);
            type = type === undefined ? 1 : type;

            if(!isPoint) {
                this.__point(code, type);
                this.setLocalNumData(`PointOnce${code}`, 1);
            }   
        }
    }

    __point(code : string | number, type  : number, cb? : Function) {
        HttpManager.Instance.request(`https://wxgameapi.sihai-inc.com/appshare/push?game_id=${this.gameId}&share_id=${code}&share_type=${type}`, ret => {
            console.log(`打点：share_id=${code}`, ret);
            if (ret.code === 200) {
                cb && cb();
            }   
        });
    }

    getToDayData(str : string) : number {
        let date = new Date().toLocaleDateString();
        let data = cc.sys.localStorage.getItem(str + date);
        return parseInt(data) || 0;
    }

    setToDayData(str : string, data : any) : void {
        let date = new Date().toLocaleDateString();
        cc.sys.localStorage.setItem(str + date, data);
    }

    getLocalNumData(str : string) : number {
        let data = cc.sys.localStorage.getItem(str);
        return parseInt(data) || 0;
    }

    setLocalNumData(str : string, data : any) : void {
        cc.sys.localStorage.setItem(str, data);
    }

    setLoginTime(value) {
        this.loginTime = value;
    }

    getLoginTime() {
        return this.loginTime;
    }

    isShowAllLog() {
        return localInfo.showAllLog;
    }

    setShowAllLog(value : boolean) {
        localInfo.showAllLog = value;
        this.SaveLocalData();
        
        let logLevel = value ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR;
        !CC_DEBUG && (<any>cc).debug._resetDebugSetting(logLevel); 
    }

    canClickBtn() {
        if(this.clickTime != null && (Date.now() - this.clickTime) < 100) return false;
        return true;
    }

    setClickTime(value) {
        this.clickTime = value;
    }
    

}

window.regVar("MyGlobal", MyGlobal);
