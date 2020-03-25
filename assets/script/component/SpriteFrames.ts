const { ccclass, property, executeInEditMode, menu } = cc._decorator;

@ccclass
@executeInEditMode
@menu('SelfComponent/SpriteFrames')
export default class SpriteFrames extends cc.Component {
    @property(cc.Sprite)
    target: cc.Sprite = null;

    @property([cc.SpriteFrame])
    frames: cc.SpriteFrame[] = [];

    @property
    _index: number = 0;

    @property
    get index() {
        return this._index;
    }

    set index(value) {
        if (value == this._index)
            return;
        this._index = value;
        this.__refreshFrame();
    }

    _isInit: boolean = false;


    __refreshFrame() {
        if (!this.target || !this._isInit) return;
        let index = this.index;
        if (index < 0 || this.frames.length <= index) {
            this.target.spriteFrame = null;
            return;
        }
        this.target.spriteFrame = this.frames[index];
    }

    onLoad(): void {
        this._isInit = true;
        if (!this.target) this.target = this.getComponent(cc.Sprite);
        this.__refreshFrame();
    }
}

