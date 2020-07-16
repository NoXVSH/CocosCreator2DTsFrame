import EventManager from "../../../core/event/EventManager";
import { EventType } from "../../../core/event/EventType";
import BaseView from "../../../core/ui/BaseView";
import ModuleManager from "../../../core/module/ModuleManager";
import UserInfo from "../../../config/UserInfo";
import { ModuleName } from "../../../core/module/ModuleName";
import { UINameEnum } from "../../../core/ui/UINameEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadingView extends BaseView {

    @property(cc.Label)
    progressTxt: cc.Label = null;

    @property(cc.Label)
    dotTxt: cc.Label = null;

    @property(cc.Label)
    userId: cc.Label = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    private startLoad : boolean = null;
    private targetValue : number = null;
    private nowValue : number = null;
    private callback : Function = null;
    private dotIndex: number;
    private rate : number = 1;
    private isUnload: boolean = false;

    getEvents() {
        return [
            [EventManager.Instance, EventType.LoginSuccess, this.loginSuccess, this]
        ];
    }

    getStaticEvents() {
        return [
            [EventManager.Instance, EventType.LoadingOpen, this.open, this],
            [EventManager.Instance, EventType.SetLoading, this.setProgress, this],
            // [EventManager.Instance, EventType.LoadingClose, this.close, this]
        ];
    }

    loginSuccess() {
        this.userId.string = `userid: ${UserInfo.Instance.GetUserId()}`;
    }

    viewLoad() {
        if(CC_PREVIEW) this.rate = 100000;

        this.dotTxt.string = "";
        this.dotIndex = 0;

        this.schedule(this.updateDotTxt, 0.1);

        this.loginSuccess();
    }

    updateDotTxt() {
        this.dotTxt.string = "";
        for(let i = 0; i < this.dotIndex - 1; i++) {
            this.dotTxt.string += ".";
        }
        this.dotIndex = ++this.dotIndex % 6;
    }

    init(e) : void {
        this.progressBar.progress = 0;
        this.progressTxt.string = "0%";

        this.callback = e.callback;
        this.isUnload = e.isUnload ? e.isUnload : false;
    }

    setProgress(e) : void {
        if(this.startLoad != true) {
            this.startLoad = true;
        }

        let current = e.current;
        let total = e.total;

        this.targetValue = current / total;
        // this.progressTxt.string = parseInt(this.targetValue * 100 + "") + "%";
        // this.progressBar.progress = this.targetValue;
   
        // if(this.targetValue == 1) {
        //     this.startLoad = false;
        //     // this.callback && this.callback();
        //     // this.close();
        // }
    }

    update(dt : number) : void {
        if(this.startLoad) {
            if(this.nowValue == null) this.nowValue = 0;

            if(this.nowValue == this.targetValue) {
                return;       
            }
            else {
                this.nowValue += this.rate * dt;
                if(this.nowValue > this.targetValue) this.nowValue = this.targetValue;
                this.progressBar.progress = this.nowValue;
                this.progressTxt.string = parseInt(this.nowValue * 100 + "") + "%";
            }

            if(this.nowValue == 1) {
                this.startLoad = false;
                this.nowValue = null;
                this.close();
                // this.callback && this.callback();
            }
        }
    }

    open(e) : void {
        this.init(e);
    }

    close() : void {
        ModuleManager.Instance.closeUI(ModuleName.Loading, UINameEnum.Loading, {
            isUnload : this.isUnload,
            isDestroy : this.isUnload,
        });
    }
}
