import BaseView from "../../../core/ui/BaseView";
import ModuleManager from "../../../core/module/ModuleManager";
import { ModuleName } from "../../../core/module/ModuleName";
import { UINameEnum } from "../../../core/ui/UINameEnum";
import ActivityView from "../../../core/ui/ActivityView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MessageBoxView extends ActivityView {

    @property(cc.Label)
    descTxt: cc.Label = null;

    @property(cc.Node)
    confirmBtn : cc.Node = null;
 
    @property(cc.Node)
    cancelBtn : cc.Node = null;
    successCb: any;
    cancelCb: any;

    getEvents() {
        return [
            [this.confirmBtn, "click", this.confirmBtnClick, this],
            [this.cancelBtn, "click", this.cancelBtnClick, this],
        ];
    }

    setData(e) {
        this.descTxt.string = e.desc;
        this.successCb = e.successCb;
        this.cancelCb = e.cancelCb;
    }

    confirmBtnClick() : void {
        this.successCb && this.successCb();
        this.close();
    }

    cancelBtnClick() : void {
        this.cancelCb && this.cancelCb();
        this.close();
    }

    close() {
        ModuleManager.Instance.closeUI(ModuleName.Sample, UINameEnum.SampleActivity3);
        this.successCb = this.cancelCb = null;
    }


}
