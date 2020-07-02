import PlatformManager from "./platform/PlatformManager";
import UIManager from "./core/ui/UIManager";
import ModuleManager from "./core/module/ModuleManager";
import { HttpManager } from "./core/net/HttpManager";
import EventManager from "./core/event/EventManager";
import { EventType } from "./core/event/EventType";
import MyGlobal from "./config/MyGlobal";
import GameConfig from "./config/GameConfig";
import UserInfo from "./config/UserInfo";
import BaseConfig from "./core/config/BaseConfig";
import GamePreload from "./module/loading/GamePreload";
import ResClearManager from "./core/loader/ResClearManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AppStart extends cc.Component {

    @property(cc.Node)
    rankNode: cc.Node = null;

    private wxSubContextView: cc.Node = null;

    onLoad(): void {
        this.adapativeWXSubView();
        if (cc.dynamicAtlasManager) cc.dynamicAtlasManager.enabled = true;
     
        PlatformManager.init();

        MyGlobal.Instance.init();
        BaseConfig.Instance.init();

        UIManager.Instance.init();
        ModuleManager.Instance.init();
        HttpManager.Instance.init();

        UserInfo.Instance.init();

        this.addEvent();
        EventManager.Instance.emit(EventType.AppStart);

    }

    addEvent() {
        EventManager.Instance.on(EventType.MemoryDanger, this.memoryDanger, this);
    }

    start(): void {
        this.login();
        this.resPreload();
    }

    login() {
        PlatformManager.Instance.login((ret, curTimeStamp) => {
            GameConfig.Instance.queryData(() => {});
            EventManager.Instance.emit(EventType.LoginSuccess, {curTimeStamp : curTimeStamp, ret : ret});

            if (PlatformManager.Instance.getPlatformName() === "weixin" && !BaseConfig.Instance.getIsTest()) {//微信平台下防止第一次渲染排行榜出现大图
                PlatformManager.Instance.RenderCanvas(this.rankNode, { view: 'all', width: 1, height: 1 }, true);
            }
        });
    }

    adapativeWXSubView(): void {
        this.wxSubContextView = cc.find("Canvas/wxSubContextView");
        this.wxSubContextView.width = cc.winSize.width;
        this.wxSubContextView.height = cc.winSize.height;

        if (this.wxSubContextView.height > 1440) this.wxSubContextView.y -= 40;
    }

    //进行预加载
    resPreload(): void {
        GamePreload.gamePreload();
    }

    memoryDanger() {
        ResClearManager.Instance.clearRes(true, true);
    }

}

