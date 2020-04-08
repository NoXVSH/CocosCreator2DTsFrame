import EventManager from "../../../core/event/EventManager";
import { EventType } from "../../../core/event/EventType";
import BaseView from "../../../core/ui/BaseView";
import ModuleManager from "../../../core/module/ModuleManager";
import { ModuleName } from "../../../core/module/ModuleName";
import { UINameEnum } from "../../../core/ui/UINameEnum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginView extends BaseView {

    @property(cc.Node)
    startBtn: cc.Node = null;

    @property(cc.Node)
    activity1Btn: cc.Node = null;

    @property(cc.Node)
    activity2Btn: cc.Node = null;

    @property(cc.Node)
    activity3Btn: cc.Node = null;

    getEvents() {
        return [
            [this.startBtn, "click", this.startBtnClick, this],
            [this.activity1Btn, "click", this.activity1BtnClick, this],   
            [this.activity2Btn, "click", this.activity2BtnClick, this],   
            [this.activity3Btn, "click", this.activity3BtnClick, this],            
        ];
    }


    startBtnClick(): void {
        EventManager.Instance.emit(EventType.TipShow, { str: "开始游戏了" });
    }

    activity1BtnClick() {
        ModuleManager.Instance.openUI(ModuleName.Sample, UINameEnum.SampleActivity1);
    }

    activity2BtnClick() {
        ModuleManager.Instance.openUI(ModuleName.Sample, UINameEnum.SampleActivity2);
    }

    activity3BtnClick() {
        ModuleManager.Instance.openUI(ModuleName.Sample, UINameEnum.SampleActivity3);
    }
}
