import BaseView from "./BaseView";
import EventManager from "../event/EventManager";
import { EventType } from "../event/EventType";
import ModuleManager from "../module/ModuleManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivityView extends BaseView {
    isAniming: boolean;

    showAnimation() {
        let content = this.node.getChildByName("content");
        if(content) {
            content.scale = 0;
            let scale1 = cc.scaleTo(0.2, 1.1).easing(cc.easeQuadraticActionOut());
            let scale2 = cc.scaleTo(0.1, 1).easing(cc.easeQuadraticActionIn());
            let action = cc.sequence(scale1, scale2, cc.callFunc(() => {
                EventManager.Instance.emit(EventType.HideGlobalBlock, "ActivityViewOpenAnim" + this.node.name);
                this.isAniming = false;
            }, this));

            EventManager.Instance.emit(EventType.ShowGlobalBlock, "ActivityViewOpenAnim" + this.node.name);
            this.isAniming = true;
            content.runAction(action);
        }
    }

    onDisable() {
        if(this.isAniming) { //如果在播放动画时候被强行关闭 要释放下全局遮挡
            EventManager.Instance.emit(EventType.HideGlobalBlock, "ActivityViewOpenAnim" + this.node.name);
        }

        this.disableInit();
        this.removeEvent();
    }


}
