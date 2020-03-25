import DynamicEffectManager, { DynamicEffectStruct } from "./DynamicEffectManager";
import PoolManager from "../loader/PoolManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class DynamicEffectNode extends cc.Component {
    private animation : cc.Animation = null;
    private isUsing : boolean = null;
    private tick : number = null;
    private factory : DynamicEffectManager = null;
    private url : string = null;

    onEnable() : void {
        this.node.opacity = 255;

        if(this.animation == null) {
            this.animation = this.getAnimCom();
        }

        this.animation && this.animation.play();
        this.addEvent();
    }

    addEvent() : void {
        // ModuleManager.Instance.Game.on("gameFinish", this.recycle, this);
        this.node.on("recycle", this.recycle, this);
    }

    setEffect(factory : DynamicEffectManager, info : DynamicEffectStruct) : void {
        this.isUsing = true;
        this.url = info.url;
        this.factory = factory;
        this.tick = info.tick;

        let time = info.time;
        let useAction = info.useAction;

        if(this.animation == null) this.animation = this.getAnimCom();

        if (this.animation) {
            this.animation.on("finished", this.animFinishedCallback, this);
        }
        else {
            if (time != null) {
                if (useAction) {
                    let action = cc.sequence(cc.fadeOut(time), cc.callFunc(function () {
                        this.factory.recycleEffect(this.tick);
                    }, this));
    
                    this.node.runAction(action);
                }
                else {
                    this.scheduleOnce(function () {
                        this.factory.recycleEffect(this.tick);
                    }.bind(this), time);
                }
            }
        }

        // if(info.effectComonentName) this.node.getOrAddComponent(info.effectComonentName);
    }

    private recycle() : void {
        if(this.isUsing) {
            this.node.stopAllActions();
            this.unscheduleAllCallbacks();
            this.node.removeFromParent(false);
            this.animation && this.animation.off("finished", this.animFinishedCallback, this);

            PoolManager.Instance.put(this.url, this.node);
            this.isUsing = false;
        }
    }

    getAnimCom() : cc.Animation {
        let animation = this.node.getComponent(cc.Animation);
        if(animation == null) animation = this.node.getComponentInChildren(cc.Animation);
        return animation;
    }

    animFinishedCallback() : void {
        this.factory.recycleEffect(this.tick);
    }
}
