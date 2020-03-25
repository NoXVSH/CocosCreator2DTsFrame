const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
@menu('selectedGroupButton/SelectBase')
export default class SelectBase extends cc.Component {
    @property(cc.Boolean)
    isSingleton : boolean = true;  //单体，一般用做单选框,不受SelectBtnGroup的管理

    @property(cc.Boolean)
    _interactive : boolean = true;
    
    @property(cc.Boolean)
    _isChecked : boolean = false;
    _isInit: boolean = false;

    @property
    get interactive() {
        return this._interactive;
    }

    set interactive(value) {
        if (this._interactive == value) return;
        this._interactive = value;
        if (this._interactive) {
            this.node.on(cc.Node.EventType.TOUCH_END, this.onClickHandler, this);
        }
        else {
            this.node.off(cc.Node.EventType.TOUCH_END, this.onClickHandler, this);
        }
    }

    @property
    get isChecked() {
        return this._isChecked;
    }

    set isChecked(value) {
        if (this._isChecked == value) return;
        this._isChecked = value;
        if (this._isInit) this.onChangeChecked(value);
    }

    onChangeChecked(value : boolean) :void {
        
    }

    onLoad() : void {
        this._isInit = true;
        if (this.interactive) this.node.on(cc.Node.EventType.TOUCH_END, this.onClickHandler, this);
        this.onChangeChecked(this._isChecked);
    }

    onClickHandler(event) : void {
        if (this.isSingleton || !this._isChecked) {
            this._isChecked = !this._isChecked;
            this.onChangeChecked(this._isChecked);
            this.node.emit("toggle", this.node, this._isChecked);
        }
    }

}
