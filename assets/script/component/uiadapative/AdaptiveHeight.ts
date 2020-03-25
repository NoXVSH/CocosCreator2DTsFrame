const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
// @executeInEditMode
@menu('UIAdapative/AdaptiveHeight')
export default class AdaptiveHeight extends cc.Component {
    @property(cc.Boolean)
    _isUp : boolean = true;

    @property(cc.Boolean)
    _isBottom : boolean = false;

    @property(cc.Integer)
    offset : number = 0;

    @property(cc.Integer)
    fullScreenOffset : number = 0;

    @property
    get isUp() {
        return this._isUp;
    }

    set isUp(value) {
        this._isUp = value;
        this.isBottom = !value;
        this.resize();
    }

    @property
    get isBottom() {
        return this._isBottom;
    }

    set isBottom(value) {
        this._isUp = !value;
        this._isBottom = value;
        this.resize();
    }

    onLoad () {
        (<any>cc.view).on("canvas-resize", this.resize, this);
        this.enabled && this.resize();
    }

    resize() {
        if(!this.enabled) return;

        let size = cc.winSize;
        this.node.width = 0;
        this.node.height = 0;

        let rate = size.height / size.width;

        let offset = rate >= 2.0 ? this.fullScreenOffset : this.offset;
        
        if(this._isUp) {
            this.node.y = size.height / 2 - offset;
        }
        else {
            this.node.y = -size.height / 2 + offset;
        }

    }
}
