import ModuleManager from "../../../core/module/ModuleManager";
import BaseView from "../../../core/ui/BaseView";
import EventManager from "../../../core/event/EventManager";
import { EventType } from "../../../core/event/EventType";
import { ModuleName } from "../../../core/module/ModuleName";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SmallLoadingView extends BaseView {

    @property(cc.Node)
    loadTip: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Node)
    loadNode: cc.Node = null;

    getEvents() {
        return [
            [ModuleManager.Instance.getManager(ModuleName.Loading), "setSmallLoadingType", this.setView, this],
            [this.node, "closeWithAnim", this.closeWithAnim, this],
        ];
    }

    setView(e) : void {
        this.node.opacity = 255;
        let type = e;

        this.bgNode.active = type == 3;

        if(type == 3) this.loadNode.y = -130;
        else this.loadNode.y = 0;
    }

    closeWithAnim(cb) {
        EventManager.Instance.emit(EventType.ShowGlobalBlock, "SmallLoadingView");

        this.node.runAction(
            cc.sequence(
                cc.fadeOut(0.5),
                cc.callFunc(() =>{
                    cb && cb();
                    EventManager.Instance.emit(EventType.HideGlobalBlock, "SmallLoadingView");
                }, this)
            )
        );
    }
}
