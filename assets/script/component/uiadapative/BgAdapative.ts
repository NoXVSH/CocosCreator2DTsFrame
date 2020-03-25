const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("UIAdapative/BgAdapative")
export default class BgAdapative extends cc.Component {
    @property
    multiple : number = 1;

    onLoad () : void {
        (<any>cc.view).on("canvas-resize", this.resize, this);
        this.resize();
    }

    resize() : void {
        let winSize = cc.winSize;

        let rateW = winSize.width / this.node.width;
        let rateH = winSize.height / this.node.height;

        let rate = Math.max(rateW, rateH);

        this.node.width *= rate;
        this.node.height *= rate;

        this.node.width *= this.multiple;
        this.node.height *= this.multiple;
    }
}
