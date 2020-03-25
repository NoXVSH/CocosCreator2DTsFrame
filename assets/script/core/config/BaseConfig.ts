import PlatformManager from "../../platform/PlatformManager";
import MyGlobal from "../../config/MyGlobal";

interface ServerConfigStruct {
    url : string;
    testUrl : string;
    resUrl : string;
}

interface BaseConfigStruct {
    serverUrl : string;
    resUrl : string;
    isTest : boolean;
    logLevel : cc.debug.DebugMode;
}

let ResUrl = "https://wx-dream.sihai-inc.com/idiomTown/";

let DevelopServerConfig : ServerConfigStruct = {
    url : 'https://wxsg-clb-forall.sihai-inc.com/idiomTown/',
    testUrl : `https://wxsg-clb-forall-test.sihai-inc.com/idiomTown_test/`,
    resUrl : ResUrl
}

let WxServerConfig : ServerConfigStruct = {
    url : 'https://wxsg-clb-forall.sihai-inc.com/idiomTown/',
    testUrl : `https://wxsg-clb-forall-test.sihai-inc.com/idiomTown_test/`,
    resUrl : ResUrl
}

export default class BaseConfig {
    private static _instance : BaseConfig;

    static get Instance() : BaseConfig {
        if(this._instance == null) {
            this._instance = new BaseConfig();
        }

        return this._instance;
    };

    private isTest : boolean = false;
    public config : BaseConfigStruct = {} as BaseConfigStruct;

    init() : void {
        // cc.game.setFrameRate(45);
        // wx && wx.setPreferredFramesPerSecond(45);

        let platformName = PlatformManager.Instance.getPlatformName();
        let serverConfig : ServerConfigStruct = null;

        switch (platformName) {
            case "weixin":
                serverConfig = WxServerConfig;
                break;
            default:
                serverConfig = DevelopServerConfig;
                break;
        }

        this.config.isTest = this.isTest;
        this.config.resUrl = serverConfig.resUrl;
        if(this.isTest) {
            this.config.serverUrl = serverConfig.testUrl;
            this.config.logLevel = cc.debug.DebugMode.INFO;
            cc.debug.setDisplayStats(true);
            errorlog(`请注意, 当前为测试环境, 接的是测试服务器!!!`);
        }
        else {
            this.config.serverUrl = serverConfig.url;
            this.config.logLevel = MyGlobal.Instance.isShowAllLog() ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR;
            cc.debug.setDisplayStats(false);
            warnlog("当前为正式环境");
        }

        !CC_DEBUG && (<any>cc).debug._resetDebugSetting(this.config.logLevel); 
    }

    getServerUrl() {
        return this.config.serverUrl;
    }

    getResUrl() {
        return this.config.resUrl;
    }

    getIsTest() {
        return this.isTest;
    }

}