import LoaderManager from "../../core/loader/LoaderManager";
import ShaderEffectBase from "../ShaderEffectBase";
import { BundleName } from "../../core/loader/LoaderConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FlashWhiteEffect extends ShaderEffectBase {
    materialUrl: string = "material/flashwhiteeffectmaterial";
    bundleName : BundleName = BundleName.RemoteRes;

    update(dt) {
        if (this.usingMaterial) {
            let time = (Date.now() - this.startTime) / 1000;
            this.usingMaterial.setProperty("time", time);
        }
    }

    initProperty() {
        this.usingMaterial = this.sprite.getMaterial(0);
        this.usingMaterial.setProperty("time", 0);
    }


}
