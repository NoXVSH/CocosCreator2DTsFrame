import WxApi from "./wx/WxApi";
import GameApi from "./game/GameApi";
import BasePlatformApi from "./base/BasePlatformApi";
import PlaformUtils from "./PlaformUtils";
import LocalGameApi from "./game/LocalGameApi";

export default class PlatformManager {
    private static _proxy: BasePlatformApi;

    static get Instance(): BasePlatformApi {
        if (this._proxy == null) {
            errorlog("获取平台api失败, 请检查plaformmanager是否初始化");
            return;
        }

        return this._proxy;
    }

    static init() {
        let platformName = PlaformUtils.getPlatformName();

        switch (platformName) {
            case "weixin":
                this._proxy = new WxApi();
                break;
            default:
                // this._proxy = new GameApi();
                this._proxy = new LocalGameApi();
                break;
        }

        this._proxy.init();
    }
 


}

window.regVar("PlatformManager", PlatformManager);
