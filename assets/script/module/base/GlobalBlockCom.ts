import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GlobalBlockCom extends cc.Component {
    blockNode: cc.Node;

    private keyMap: { [key: string]: boolean } = {};

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.blockNode = cc.find("Canvas/block");
        this.addEvent();
    }

    addEvent() {
        EventManager.Instance.on(EventType.ShowGlobalBlock, this.show, this);
        EventManager.Instance.on(EventType.HideGlobalBlock, this.hide, this);
    }

    show(key) {
        if(key == null) key = "Default";
        if (this.keyMap[key]) {
            warnlog(`全局遮挡---${key}已经打开`);
            return;
        }

        this.keyMap[key] = true;

        this.blockNode.active = true;
        log("屏蔽所有触摸输入", key);
    }

    hide(key = "Default") {
        if(key == null) key = "Default";
        if (!this.keyMap[key]) {
            warnlog(`全局遮挡---${key}未打开, 但确调用了隐藏`);
            return;
        }

        delete this.keyMap[key];

        let len = Object.keys(this.keyMap).length;

        if (len == 0) {
            this.blockNode.active = false;
            log("取消屏蔽所有触摸输入", key);
        }

    }


}
