const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMask extends cc.Component {
    onLoad() {
        this.addEvent();
    }

    addEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.clickMask, this);
        // this.node.on("click", this.clickMask, this);
    }

    clickMask() {
        this.node.parent.emit("clickClose");
    }

}
