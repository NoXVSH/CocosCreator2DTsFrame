import PoolManager from "../loader/PoolManager";
import { BundleName } from "../loader/LoaderConst";


export interface DynamicEffectStruct {
    x: number;
    y: number;
    url: string;
    bundleName : BundleName;
    targetNode: cc.Node;
    scriptName: string;
    useAction: boolean;
    tick: number;
    time: number;
    labelStr: string;
    moveArray: any[];
    endPos: cc.Vec2;

    effect: cc.Node;
    isLoading: boolean;
    whenLoadRecycle: boolean;
}

export default class DynamicEffectManager {
    private static _instance: DynamicEffectManager;

    static get Instance(): DynamicEffectManager {
        if (this._instance == null) {
            this._instance = new DynamicEffectManager();
        }

        return this._instance;
    }

    private effectLayer: cc.Node = null;
    private dynamicEffectMap: { [key: number]: DynamicEffectStruct } = {};
    private effectTick: number = 0;

    registerEffectLayer(node: cc.Node): void {
        this.effectLayer = node;
    }

    createEffect(info: DynamicEffectStruct): number {
        let callback = (effect) => {
            if (effect) {
                info.isLoading = false;
                this.dynamicEffectMap[info.tick].effect = effect;

                let scriptName = "DynamicEffectNode";

                if (info.scriptName != null) scriptName = info.scriptName;

                let com = effect.getOrAddComponent(scriptName);
                com.setEffect(this, info);

                if(info.whenLoadRecycle) {
                    this.recycleEffect(info.tick);
                    return;
                }

                effect.x = info.x;
                effect.y = info.y;

                if (info.targetNode) {
                    info.targetNode.addChild(effect);
                }
                else {
                    this.effectLayer.addChild(effect);
                }
            }
        }

        info.tick = this.effectTick;
        info.whenLoadRecycle = false;
        info.isLoading = true;

        this.dynamicEffectMap[info.tick] = info;

        PoolManager.Instance.get(info.url, info.bundleName, cc.Prefab, callback);
        return this.effectTick++;
    }

    recycleEffect(tick: number): void {
        if (this.dynamicEffectMap[tick] != null) {
            let info = this.dynamicEffectMap[tick];

            if (info.isLoading) {
                info.whenLoadRecycle = true; //打上标记 加载完成回调处理回收
            }
            else {
                this.dynamicEffectMap[tick].effect.emit("recycle");
                delete this.dynamicEffectMap[tick];
            }
        }
        else {
            warnlog(`-----不存在tick为${tick}的特效----或已经被回收`);
        }

    }

}

window.regVar("DynamicEffectManager", DynamicEffectManager);
