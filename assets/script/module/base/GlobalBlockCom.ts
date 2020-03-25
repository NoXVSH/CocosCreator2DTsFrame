import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GlobalBlockCom extends cc.Component {
    blockNode: cc.Node;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.blockNode = cc.find("Canvas/block");
        this.addEvent();
    }

    addEvent() {
        EventManager.Instance.on(EventType.ShowGlobalBlock, this.show, this);
        EventManager.Instance.on(EventType.HideGlobalBlock, this.hide, this);
    }

    show() {
        this.blockNode.active = true;
        log("屏蔽所有触摸输入");
    }

    hide() {
        this.blockNode.active = false;
        log("取消屏蔽所有触摸输入");
    }


}
