import LoaderManager from "../core/loader/LoaderManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShaderEffectBase extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    isSet: boolean;
    isSetMaterial : boolean;
    isLoading: boolean;
    forceCancel: boolean;

    materialUrl: string = null;
    usingMaterial: cc.Material;
    startTime: number;

    onLoad() {
 
    }

    //子类重写
    update(dt) {

    }

    setShader() {
        if (this.sprite == null) {
            return;
        }

        if (this.isSet) return;

        this.forceCancel = false;
        this.isSet = true;
        LoaderManager.Instance.load(this.materialUrl, cc.Material, (material: cc.Material) => {
            if (this.forceCancel) return;
            this.__setShader(material);
        });
    }

    __setShader(material: cc.Material) {
        this.startTime = Date.now();

        let materialCopy = (<any>cc).MaterialVariant.create(material, this.sprite);

        this.sprite.setMaterial(0, materialCopy);
        this.sprite._activateMaterial();

        this.initProperty();

        this.isSetMaterial = true;
    }

    //子类重写
    initProperty() {
   
    }

    resetShader() {
        if (!this.isSet) return;

        if (this.sprite && this.sprite.node && cc.isValid(this.sprite.node)) {
            this.forceCancel = true;

            if(this.isSetMaterial) {
                this.sprite.setMaterial(0, null);
                this.sprite._activateMaterial();

                this.usingMaterial.destroy();
                this.usingMaterial = null;
            }

            // LoaderManager.Instance.unload(this.materialUrl); 暂时常驻内存
        }

        this.isSetMaterial = false;
        this.isSet = false;

    }
}
