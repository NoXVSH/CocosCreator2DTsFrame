import LoaderManagerBase, { LoaderStruct } from "./LoaderManagerBase";

export default class LoaderExternalManager extends LoaderManagerBase {
    private static _instance: LoaderExternalManager;

    static get Instance(): LoaderExternalManager {
        if (this._instance == null) {
            this._instance = new LoaderExternalManager();
        }

        return this._instance;
    }

    
    protected name : string = "LoaderExternalManager";

    __engineLoad(info: LoaderStruct) {
        cc.loader.load(info.type ? { url: info.url, type: info.type as string } : info.url, (error: any, resource) => {
            this.__loadResultHandler(info, error, resource);
        });
    }

    addReference(info : LoaderStruct): void {
        if (info.depends == null) info.depends = [info.url];
        this.__addReference(info.depends);
    }

}

window.regVar("LoaderExternalManager", LoaderExternalManager);