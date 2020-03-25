
import PlatformManager from "../../platform/PlatformManager";
import { EventType } from "../../core/event/EventType";
import ModuleBase from "../../core/module/ModuleBase";
import EventManager from "../../core/event/EventManager";
import UIManager from "../../core/ui/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BannerManager extends ModuleBase {

    init() : void {
        super.init();
    };

    addEvent() : void {
        super.addEvent();

        EventManager.Instance.on(EventType.UIChange, this.uiChange, this);
    };

    uiChange() : void {
        let uiInfo = UIManager.Instance.getForwardUIInfo();

        if (uiInfo != null && uiInfo.showBanner && uiInfo.node != null && uiInfo.node.active) {
            warnlog(`${uiInfo.name}界面显示banner`);
            PlatformManager.Instance.bannerShow();
        }
        else {
            PlatformManager.Instance.bannerHide();
        }
    }
}
