import LoaderManager from "../../core/loader/LoaderManager";
import ShaderEffectBase from "../ShaderEffectBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GrayToOriginEffect extends ShaderEffectBase {
    @property(cc.Float)
    duration = 1.0;

    materialUrl: string = "internal/material/graytooriginmaterial";

    update(dt) {
        if (this.usingMaterial) {
            let time = (Date.now() - this.startTime) / 1000;
            this.usingMaterial.setProperty("time", time);
        }
    }

    initProperty() {
        this.usingMaterial = this.sprite.getMaterial(0);
        this.usingMaterial.setProperty("time", 0);
        this.usingMaterial.setProperty("duration", this.duration);
    }


}
