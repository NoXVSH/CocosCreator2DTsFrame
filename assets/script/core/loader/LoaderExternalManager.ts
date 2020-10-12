import LoaderBase, { LoaderStruct } from "./LoaderBase";

export default class LoaderExternalManager extends LoaderBase {
    private static _instance: LoaderExternalManager;

    static get Instance(): LoaderExternalManager {
        if (this._instance == null) {
            this._instance = new LoaderExternalManager();
        }

        return this._instance;
    }
    
    protected name : string = "LoaderExternalManager";

    protected __engineLoad(info: LoaderStruct) {
        cc.assetManager.loadRemote(info.url, (error, resource) => {
            this.__loadResultHandler(info, error, resource);
        });
    }

}

window.regVar("LoaderExternalManager", LoaderExternalManager);