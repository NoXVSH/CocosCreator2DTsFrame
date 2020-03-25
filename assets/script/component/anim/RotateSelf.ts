const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu('AnimComponent/RotateSelf')
export default class RotateSelf extends cc.Component {

    @property(cc.Integer)
    speed: number = 1.0;

    @property(cc.Boolean)
    autoRotate: boolean = false;
    action: cc.ActionInterval;

    onLoad () {
        this.autoRotate && this.startAnim();
    }

    startAnim() {
        if(this.action != null) this.stopAnim();
        this.action = cc.repeatForever(cc.rotateBy(this.speed, 360));
        this.node.runAction(this.action);
    }

    stopAnim() {
        if(this.action == null) return;
        this.node.stopAction(this.action);
    }
}
