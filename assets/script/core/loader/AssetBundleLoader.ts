import LoaderBase, { LoaderStruct } from "./LoaderBase";

export default class AssetBundleLoader extends LoaderBase {
    private bundle : cc.AssetManager.Bundle = null;
    protected name : string = "";

    constructor(bundle : cc.AssetManager.Bundle) {
        super();
        this.bundle = bundle;
        this.name = `assetbundle------${bundle.name}`;
    }

    protected __engineLoad(info: LoaderStruct) {
        this.bundle.load(info.url, info.type as typeof cc.Asset, (error: any, resource) => {
            this.__loadResultHandler(info, error, resource);
        });
    }

    preload(url: string, type: typeof cc.Asset | string) {
        this.bundle.preload(url, type as typeof cc.Asset);
    }

    clear(): void {
        this.bundle.releaseUnusedAssets();
    }

}
