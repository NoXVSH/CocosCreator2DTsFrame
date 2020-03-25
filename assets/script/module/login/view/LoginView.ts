import EventManager from "../../../core/event/EventManager";
import { EventType } from "../../../core/event/EventType";
import BaseView from "../../../core/ui/BaseView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginView extends BaseView {

    @property(cc.Node)
    startBtn: cc.Node = null;

    getEvents() {
        return [
            [this.startBtn, "click", this.startBtnClick, this],         
        ];
    }


    startBtnClick(): void {
        EventManager.Instance.emit(EventType.TipShow, { str: "开始游戏了" });
    }
}
