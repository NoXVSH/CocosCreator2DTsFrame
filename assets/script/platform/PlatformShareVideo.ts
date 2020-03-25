import PlatformManager from "./PlatformManager";
import {ShareVideoInfoType, ShareVideoResultType, ShareVideoType} from "./enum/PlatformEnum";
import PlatformShareInfo, {PlatformShareInfoStruct} from "./PlatformShareInfo";
import GameConfig from "../config/GameConfig";
import TimeUtils from "../core/utils/TimeUtils";
import ModuleManager from "../core/module/ModuleManager";
import { ModuleName } from "../core/module/ModuleName";
import { EventType } from "../core/event/EventType";

const SAVE_DATA_KEY = "shareVideoData";
const SHARE_SKIP_NUM = "share_skip_num";
const SHARE_MAX_NUM = "share_max_num";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlatformShareVideo {

    private static _instance: PlatformShareVideo;

    static get Instance(): PlatformShareVideo {
        if (this._instance == null) {
            this._instance = new PlatformShareVideo();
        }

        return this._instance;
    }

    constructor() {
        let localData = cc.sys.localStorage.getItem(SAVE_DATA_KEY);
        !localData && cc.sys.localStorage.setItem(SAVE_DATA_KEY, JSON.stringify({}));
    }

    showShareOrVideo(type: ShareVideoInfoType, callFunc: (resultType: ShareVideoResultType) => void) {
        let info: PlatformShareInfoStruct = PlatformShareInfo.Instance.getInfoByName(type);
        let switchType = this.getSwitchType(type);

        log("showShareOrVideo type: ", switchType);
        if (switchType === ShareVideoType.VIDEO) {
            PlatformManager.Instance.videoShow(info, callFunc)
        } 
        else if(switchType == ShareVideoType.SHARE) {
            PlatformManager.Instance.share(info, () => {
                this.addShareSuccessNum(info.configKey);
                callFunc(ShareVideoResultType.SHARE_SUCCEED);
            });
        }
        else {
            callFunc(ShareVideoResultType.SHARE_SUCCEED);
        }
    }

    /**
     * 获取开关类型
     * @param {ShareVideoInfoType} type
     * @returns {ShareVideoType}
     */
    getSwitchType(type: ShareVideoInfoType): ShareVideoType {
        let configKey = PlatformShareInfo.Instance.getInfoByName(type).configKey;
        const keyType = configKey + "_type", keyNum = configKey + "_num", shareDate = "share_date", key_Switch = configKey + "_switch";

        if (GameConfig.Instance.getConfigData(key_Switch) === 0) return ShareVideoType.None;
        if (GameConfig.Instance.getConfigData(keyType) === ShareVideoType.VIDEO) return ShareVideoType.VIDEO;

        let localData = JSON.parse(cc.sys.localStorage.getItem(SAVE_DATA_KEY));
        let nowDate = TimeUtils.Instance.secToYMD(ModuleManager.Instance.dispatchGet(ModuleName.Time, EventType.GetNowTimesStamp));

        if(localData[keyNum] == null) {
            localData[keyNum] = 0;
            cc.sys.localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(localData));
        }

        // 检测日期是否更新，重置次数
        if (nowDate !== localData[shareDate]) {
            localData[shareDate] = nowDate;
            localData[SHARE_SKIP_NUM] = 0;
            localData[SHARE_MAX_NUM] = 0;

            for (let i in localData) {
                let arr = i.split(`_`);
                arr[arr.length - 1] === "num" && (localData[i] = 0)
            }

            cc.sys.localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(localData));
        }

        if (localData[SHARE_SKIP_NUM] >= GameConfig.Instance.getConfigData([SHARE_SKIP_NUM])
            || localData[SHARE_MAX_NUM] >= GameConfig.Instance.getConfigData([SHARE_MAX_NUM]))
            return ShareVideoType.VIDEO;

        if (localData[keyNum] < GameConfig.Instance.getConfigData(keyNum))
            return ShareVideoType.SHARE;

        return ShareVideoType.VIDEO;
    }

    /**
     * 累加一次分享成功次数
     * @param configKey ShareVideoConst.Switch.TYPE
     */
    private addShareSuccessNum(configKey: string) {
        let localData = JSON.parse(cc.sys.localStorage.getItem(SAVE_DATA_KEY));
        localData[SHARE_MAX_NUM]++;
        localData[configKey + "_num"]++;

        cc.sys.localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(localData));
    }

    /**
     * 累加一次分享跳过次数
     */
    private addShareSkipNum() {
        let localData = JSON.parse(cc.sys.localStorage.getItem(SAVE_DATA_KEY));
        localData[SHARE_SKIP_NUM]++;

        cc.sys.localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(localData));
    }
}
