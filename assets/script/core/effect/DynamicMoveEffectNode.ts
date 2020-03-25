import DynamicEffectManager, { DynamicEffectStruct } from "./DynamicEffectManager";
import PoolManager from "../loader/PoolManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class DynamicMoveEffectNode extends cc.Component {
    private isUsing : boolean = null;
    private tick : number = null;
    private factory : DynamicEffectManager = null;
    private url : string = null;

    onEnable() : void {
        this.node.opacity = 255;

        // let com = this.node.getComponent(cc.ParticleSystem);
        // com && com.resetSystem();

        this.addEvent();
    }

    addEvent() : void {
        this.node.on("recycle", this.recycle, this);
    }

    setEffect(factory : DynamicEffectManager, info : DynamicEffectStruct) : void {
        this.isUsing = true;

        this.url = info.url;
        this.factory = factory;
        this.tick = info.tick;

        if(info.labelStr != null) {
            let labelCom = this.node.getComponentInChildren(cc.Label);
            if(labelCom != null) labelCom.string = info.labelStr;
        }

        let action = null;

        if(info.moveArray != null) {
            let index = 0;
            action = cc.sequence(
                // cc.moveTo(info.time, info.moveArray[index]),
                // cc.bezierTo(5, info.moveArray),
                cc.cardinalSplineTo(info.time, info.moveArray, 0),
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    // this.checkMoveArrayEnd(info, index);
                    this.factory.recycleEffect(this.tick);
                }, this),
            );

        }
        else {
            action = cc.sequence(
                cc.moveTo(info.time, info.endPos).easing(cc.easeSineOut()),
                cc.delayTime(0.2),
                cc.callFunc(function () {
                this.factory.recycleEffect(this.tick);
            }, this));

        }

        this.node.runAction(action);
    }

    checkMoveArrayEnd(info, index) : void {
        index++;

        if(index < info.moveArray.length) {
            let action = cc.sequence(
                cc.moveTo(info.time, info.moveArray[index]).easing(cc.easeSineOut()),
                cc.callFunc(() => {
                    this.checkMoveArrayEnd(info, index);
                }, this),
            );

            this.node.runAction(action);
        }
        else {
            this.factory.recycleEffect(this.tick);
        }
    }

    recycle() : void {
        if(this.isUsing) {
            let com = this.node.getComponent(cc.ParticleSystem);
            com && com.resetSystem();

            this.node.stopAllActions();

            this.node.removeFromParent(false);
            PoolManager.Instance.put(this.url, this.node);
            this.isUsing = false;
        }
    }
}
