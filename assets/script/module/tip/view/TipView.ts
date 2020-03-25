import ModuleManager from "../../../core/module/ModuleManager";
import BaseView from "../../../core/ui/BaseView";
import { ModuleName } from "../../../core/module/ModuleName";
import { UINameEnum } from "../../../core/ui/UINameEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TipView extends BaseView {

    @property(cc.Label)
    tipTxt: cc.Label = null;

    @property(cc.Node)
    tipNode: cc.Node = null;

    getEvents() {
        return [
            [this.manager, "setTip", this.setTip, this],
        ];
    }

    setTip(e) : void {
        let str = e.str;
        let y = e.y;
        let time = 1.2;
        if(e.time != null) time = e.time;

        this.tipTxt.string = str;
        this.tipNode.stopAllActions();
        this.tipNode.y = y === undefined ? 0 : y;
        this.tipNode.opacity = 0;
    	this.tipNode.runAction(cc.sequence(
            cc.fadeTo(0, 255),
            cc.delayTime(time),

            cc.spawn(
                cc.moveBy(0.4, cc.v2(0, 100)),
                cc.fadeOut(0.4),
            ),

            cc.callFunc(() => {
                ModuleManager.Instance.closeUI(ModuleName.Tip, UINameEnum.Tip);
            }, this)
    	))
    }
}
