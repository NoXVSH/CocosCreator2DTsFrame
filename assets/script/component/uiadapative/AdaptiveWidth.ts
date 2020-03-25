const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
// @executeInEditMode
@menu('UIAdapative/AdaptiveWidth')
export default class AdaptiveWidth extends cc.Component {
    @property(cc.Boolean)
    _isLeft : boolean = true;

    @property(cc.Boolean)
    _isRight : boolean = false;

    @property(cc.Integer)
    offset : number = 0;

    @property(cc.Integer)
    fullScreenOffset : number = 0;

    @property
    get isLeft() {
        return this._isLeft;
    }

    set isLeft(value) {
        this._isLeft = value;
        this._isRight = !value;
        this.resize();
    }

    @property
    get isRight() {
        return this._isRight;
    }

    set isRight(value) {
        this._isLeft = !value;
        this._isRight = value;
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

        let rate = size.width / size.height;

        let offset = rate >= 2.0 ? this.fullScreenOffset : this.offset;
        
        if(this._isRight) {
            this.node.x = size.width / 2 - offset;
        }
        else {
            this.node.x = -size.width / 2 + offset;
        }

    }
}
