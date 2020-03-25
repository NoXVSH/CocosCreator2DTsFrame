import {EventType} from "../event/EventType";
import UserInfo from "../../config/UserInfo";
import EventManager from "../event/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MemoryControl extends cc.Component {

    @property(cc.Label)
    cacheLabel: cc.Label = null;

    private isShowDebug: boolean;

    onLoad() {
        this.addEvent();
        this.isShowDebug = this.cacheLabel.node.active = false;
    }

    addEvent() {
        EventManager.Instance.on(EventType.LoginSuccess, this.onLoginSuccess, this);
        EventManager.Instance.on(EventType.GMDebugInfo, this.onGMShowDebugInfo, this);
    }

    onLoginSuccess() {
        this.isShowDebug = this.cacheLabel.node.active = UserInfo.Instance.getIsGM() || CC_PREVIEW;
    }

    onGMShowDebugInfo() {
        this.isShowDebug = this.cacheLabel.node.active = !this.isShowDebug;
    }

    update(dt) {
        if (this.isShowDebug) {
            let engineLoadr : any = cc.loader;
            this.cacheLabel.string =  "加载数量: " + engineLoadr.getResCount();
        }
    }
}
