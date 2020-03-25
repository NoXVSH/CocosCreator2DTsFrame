import BaseView from "./BaseView";
import EventManager from "../event/EventManager";
import { EventType } from "../event/EventType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivityView extends BaseView {

    showAnimation() {
        let content = this.node.getChildByName("content");
        if(content) {
            content.scale = 0;
            let scale1 = cc.scaleTo(0.2, 1.1).easing(cc.easeQuadraticActionOut());
            let scale2 = cc.scaleTo(0.1, 1).easing(cc.easeQuadraticActionIn());
            let action = cc.sequence(scale1, scale2, cc.callFunc(() => {
                EventManager.Instance.emit(EventType.HideGlobalBlock);
            }, this));

            EventManager.Instance.emit(EventType.ShowGlobalBlock);
            content.runAction(action);
        }
    }
}
