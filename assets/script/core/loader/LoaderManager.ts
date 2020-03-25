import PlatformManager from "../../platform/PlatformManager";
import LoaderManagerBase, { LoaderStruct } from "./LoaderManagerBase";

export default class LoaderManager extends LoaderManagerBase{
    private static _instance: LoaderManager;

    static get Instance(): LoaderManager {
        if (this._instance == null) {
            this._instance = new LoaderManager();
        }

        return this._instance;
    }

    protected name : string = "LoaderManager";

    __engineLoad(info : LoaderStruct) {
        cc.loader.loadRes(info.url, info.type as typeof cc.Asset, (error : any, resource) => {
            this.__loadResultHandler(info, error, resource);
        });
    }

    addReference(info : LoaderStruct): void {
        if (info.depends == null) info.depends = cc.loader.getDependsRecursively(info.url);
        this.__addReference(info.depends);
    }

}

window.regVar("LoaderManager", LoaderManager);