import {ShareVideoInfoType} from "./enum/PlatformEnum";
import EventManager from "../core/event/EventManager";
import { EventType } from "../core/event/EventType";
import PlatformManager from "./PlatformManager";
import ConfigManager from "../core/config/ConfigManager";

export interface PlatformShareInfoStruct {
    name : string;
    configKey: string; // Gameconfig.ts 中配置的分享key前缀 例如 default_type 取"default"
    shareStartPointId : string;
    shareSuccessPointId : string;
    videoStartPointId : string;
    videoSuccessPointId : string;
    sharePicId? : string;
}

export default class PlatformShareInfo {
    private static _instance : PlatformShareInfo;

    static get Instance() : PlatformShareInfo {
        if(this._instance == null) {
            this._instance = new PlatformShareInfo();
        }

        return this._instance;
    }

    private infos : {[key : string] : PlatformShareInfoStruct} = null;

    init() {
        this.addEvent();
    }

    addEvent() {
        EventManager.Instance.on(EventType.ConfigLoadComplete, this.configLoadComplete, this);
    }

    configLoadComplete() {
        // let platformName = PlatformManager.Instance.getPlatformName();

        // switch (platformName) {
        //     case "weixin":
        //         this.infos = ConfigManager.Instance["wxsharevideoconfig"];
        //         break;
        //     default:
        //         this.infos = ConfigManager.Instance["defaultsharevideoconfig"];
        //         break;
        // }

        this.infos = ConfigManager.Instance["wxsharevideoconfig"]; //只有微信平台才打点, 直接读取微信版本分享信息配置
    }

    getInfoByName(name : ShareVideoInfoType) : PlatformShareInfoStruct {
        return this.infos[name] || this.infos[ShareVideoInfoType.Default];
    }
}

window.regVar("PlatformShareInfo", PlatformShareInfo);
