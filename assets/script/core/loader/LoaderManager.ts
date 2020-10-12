import AssetBundleLoader from "./AssetBundleLoader";
import { BundleName } from "./LoaderConst";

export default class LoaderManager {
    private static _instance: LoaderManager;

    static get Instance(): LoaderManager {
        if (this._instance == null) {
            this._instance = new LoaderManager();
        }

        return this._instance;
    }

    protected name : string = "LoaderManager";

    private bundlesMap : {[key : string] : AssetBundleLoader} = {};

    init() {
        let bundleLoader = new AssetBundleLoader(cc.assetManager.resources);
        this.bundlesMap[BundleName.LocalRes] = bundleLoader;
    }
    
    async load(url: string, bundleName : BundleName, type: typeof cc.Asset | string, callback: Function, errorback?: Function) {
        let bundleLoader = await this.getBundleLoader(bundleName);
        bundleLoader.load(url, type, callback, errorback);
    }

    async unload(url: string, bundleName : BundleName) {
        let bundleLoader = await this.getBundleLoader(bundleName);
        bundleLoader.unload(url);
    }

    async silentLoad(url: string, bundleName : BundleName, type: typeof cc.Asset | string, callback?: Function) {
        let bundleLoader = await this.getBundleLoader(bundleName);
        bundleLoader.silentLoad(url, type, callback);
    }

    async preload(url: string, bundleName : BundleName, type: typeof cc.Asset | string) {
        let bundleLoader = await this.getBundleLoader(bundleName);
        bundleLoader.preload(url, type);
    }

    loadBundle(bundleName : BundleName, cb : Function, errorback? : Function) {
        if(this.bundlesMap[bundleName]) {
            warnlog(`assetbunle  ${bundleName}已经加载过`);
            cb && cb();
            return;
        }

        cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
            if(err) {
                errorlog(`assetbunle  ${bundleName}加载失败`, err);
                errorback && errorback();
                return;
            }

            log(`assetbunle  ${bundleName}加载完成`);
            let bundleLoader = new AssetBundleLoader(bundle);
            this.bundlesMap[bundleName] = bundleLoader;
            cb && cb(bundleLoader);
        });
    }

    loadBundlePromise(bundleName : BundleName) : Promise<AssetBundleLoader> {
        let p = new Promise<AssetBundleLoader>((resolve, reject) => {
            this.loadBundle(bundleName, resolve, reject);
        });
        return p;
    }

    async getBundleLoader(bundleName : BundleName) {
        let bundleLoader = this.bundlesMap[bundleName];
        if(bundleLoader) return bundleLoader;

        bundleLoader = await this.loadBundlePromise(bundleName);
        return bundleLoader;
    }

    checkResIsLoad(url : string, bundleName : BundleName) {
        let bundleLoader = this.bundlesMap[bundleName];
        return bundleLoader.checkResIsLoad(url);
    }

    getResByUrl(url : string, bundleName : BundleName) {
        let bundleLoader = this.bundlesMap[bundleName];
        return bundleLoader.getResByUrl(url);
    }

    clear() {
        for(const key in this.bundlesMap) {
            let bundleLoader = this.bundlesMap[key];
            bundleLoader.clear();
        }
    }



}

window.regVar("LoaderManager", LoaderManager);