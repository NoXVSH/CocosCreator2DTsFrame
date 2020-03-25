import UserInfo from "../../config/UserInfo";
import EventManager from "../event/EventManager";
import {EventType} from "../event/EventType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FpsControl extends cc.Component {

    @property(cc.Label)
    fpsLabel: cc.Label = null;


    hadSetFrame : boolean = false;
    count : number = null;
    time : number = null;
    calculateCount : number = null;
    totalFps : number = null;
    canReach60Fps : boolean = null;

    private isShowFps: boolean = false;

    onLoad () {
        EventManager.Instance.once(EventType.BeforeEnterHome, this.beforeEnterHome, this);
        EventManager.Instance.on(EventType.GMDebugInfo, this.onGMShowDebugInfo, this);

        this.fpsLabel.node.active = false;
    }

    addEvent() {
        cc.director.on(cc.Director.EVENT_AFTER_DRAW, this.calculateFps, this);
    }

    removeEvent() {
        cc.director.off(cc.Director.EVENT_AFTER_DRAW, this.calculateFps, this);
    }

    beforeEnterHome() {
        this.fpsLabel.node.active = this.isShowFps = UserInfo.Instance.getIsGM() || CC_PREVIEW;
        this.isShowFps && this.addEvent();
    }

    onGMShowDebugInfo() {
        this.fpsLabel.node.active = !this.fpsLabel.node.active;
        this.fpsLabel.node.active && this.addEvent();
        !this.fpsLabel.node.active && this.removeEvent();
    }

    calculateFps() {
        if (!this.count) {
            this.count = 0;
        }

        if (!this.time) {
            this.time = Date.now();
        }

        if (!this.calculateCount) { //计算次数
            this.calculateCount = 0;
        }

        if (!this.totalFps) {
            this.totalFps = 0;
        }

        if ((Date.now() - this.time) >= 1000) {
            this.totalFps += this.count;
            this.calculateCount++;

            if (this.fpsLabel.node.active) {
                let averageValue : number = this.totalFps / this.calculateCount;
                this.fpsLabel.string = `帧率: ${this.count}\n平均帧率: ${parseInt(averageValue.toString())}\nDrawCall: ${cc.renderer.drawCalls}`;
            }

            this.count = 0;
            this.time = Date.now();
        }

        this.count++;
    }
}
