export enum SHADER_TYPE {
    NORMAL = 0,
    FLASH = 1, //闪白
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShaderControl extends cc.Component {
    _shader: any;
    _state: SHADER_TYPE;

    onLoad() {
        this.init();
        this.addEvent();
    }

    init() {
        this._shader = null;
    }

    addEvent() {
        this.node.on("shader", this.setShader, this);
    }

    setShader(event) {
        let shader = event;
        let params = null;

        if (shader == null) {
            if (this._shader) {
                this._shader.resetShader();
            }
            this._shader = null;
            this._state = SHADER_TYPE.NORMAL;
        }
        else {
            if (this._shader) {
                this._shader.resetShader();
            }
            switch (shader) {
                case SHADER_TYPE.NORMAL:
                    this._shader = null;
                    break;
                case SHADER_TYPE.FLASH:
                    this._shader = this.node.getOrAddComponent("FlashWhiteEffect");
                    break;
            }

            this._state = shader;
            if (shader != SHADER_TYPE.NORMAL) {
                let sprite = this.node.getComponent(cc.Sprite);
                if(!sprite) sprite = this.getComponentInChildren(cc.Sprite);
                
                this._shader.sprite = sprite;
                this._shader.setShader(params);
            }
        }
    }

}




