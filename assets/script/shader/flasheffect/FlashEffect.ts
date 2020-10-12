import ShaderEffectBase from "../ShaderEffectBase";
import { BundleName } from "../../core/loader/LoaderConst";

const { ccclass, property } = cc._decorator;

enum Mode {
    Flash = "Flash",
    Wait = "Wait"
}

@ccclass
export default class SingleColorEffect extends ShaderEffectBase {
    materialUrl: string = "material/flasheffectmaterial";
    bundleName : BundleName = BundleName.RemoteRes;

    @property(cc.Float)
    flashWidth: number = 0.15;

    @property(cc.Float)
    strength: number = 0.0025;

    @property(cc.Float)
    offset: number = 0.45;

    @property(cc.Float)
    speed: number = 10.0;

    @property(cc.Float) //扫过一次后的等待时间
    waitTime: number = 2.0;

    @property(cc.Boolean)
    isRotateFlash: boolean = false;

    @property(cc.Boolean)
    isAutoSet: boolean = true;
    startPos: number;
    nodeLength: number;
    mode : Mode;
    waitTick: number;


    onLoad() {
        this.isAutoSet && this.setShader();
    }

    initProperty() {
        this.usingMaterial = this.sprite.getMaterial(0);
        this.startPos = -this.sprite.node.width * 0.5;

        if (this.sprite) {
            this.startTime = Date.now();

            this.usingMaterial.setProperty("strength", this.strength);
            this.usingMaterial.setProperty("isRotateFlash", this.isRotateFlash == true ? 1 : 0);

            if (this.isRotateFlash == true) {
                this.nodeLength = this.sprite.node.height;
            }
            else {
                this.nodeLength = this.sprite.node.width;
            }
            this.startPos = -this.nodeLength;
            this.usingMaterial.setProperty("startPos", this.startPos / this.nodeLength);

            let offsetX;
            let offsetY;
            let uv = (<any>this.sprite.spriteFrame).uv;

            if (this.sprite.spriteFrame.isRotated() == true) {
                offsetX = Math.abs(uv[4] - uv[0]);
                offsetY = Math.abs(uv[3] - uv[1]);

                this.usingMaterial.setProperty("uvXStart", uv[0]);
                this.usingMaterial.setProperty("uvYStart", uv[5]);
            }
            else {
                offsetX = Math.abs(uv[2] - uv[0]);
                offsetY = Math.abs(uv[5] - uv[1]);

                this.usingMaterial.setProperty("uvXStart", uv[0]);
                this.usingMaterial.setProperty("uvYStart", uv[1]);
            }

            this.usingMaterial.setProperty("offset", this.offset);
            this.usingMaterial.setProperty("width", this.flashWidth);
            this.usingMaterial.setProperty("strength", this.strength);
            this.usingMaterial.setProperty("time", 0);
            this.usingMaterial.setProperty("offsetX", offsetX);
            this.usingMaterial.setProperty("offsetY", offsetY);
            this.usingMaterial.setProperty("isRotated", this.sprite.spriteFrame.isRotated() == true ? 1 : 0);

            this.mode = Mode.Flash;
        }
    }

    update(dt) {
        if (this.isSetMaterial) {
            if(this.mode == Mode.Flash) {
                this.flashUpdate(dt);
            }
            else {
                this.waitTimeUpdate(dt)
            }
        }
    }

    flashUpdate(dt) {
        this.usingMaterial = this.sprite.getMaterial(0);
        let time = (Date.now() - this.startTime) / 1000;
        this.usingMaterial.setProperty("time", time);
        this.startPos += this.speed;

        if (this.startPos > this.nodeLength * 1.5) {
            this.startPos = -this.nodeLength;

            this.waitTick = 0;
            this.mode = Mode.Wait;
        }
        this.usingMaterial.setProperty("startPos", this.startPos / this.nodeLength);
    }

    waitTimeUpdate(dt) {
        this.waitTick += dt;

        if(this.waitTick >= this.waitTime) {
            this.mode = Mode.Flash;
        }
    }


}
