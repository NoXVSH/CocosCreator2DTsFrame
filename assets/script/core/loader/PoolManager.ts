import LoaderManager from "./LoaderManager";

export default class PoolManager {
    private static _instance : PoolManager;

    static get Instance() : PoolManager {
        if(this._instance == null) {
            this._instance = new PoolManager();
        }

        return this._instance;
    }

    private pool : {[key : string] : cc.NodePool} = {}; 
    private loadRecord : {[key : string] : number} = {};

    getPromise(url : string, type : typeof cc.Asset) : Promise<any> {
        let p = new Promise((resolve, reject) => {
            this.get(url, type, resolve);
        });
        return p;
    }

    get(url : string, type : typeof cc.Asset, callback : Function) : void {
        let pool = this.pool[url];

        if (pool == null || pool.size() == 0) {
            this.load(url, type, callback);
        }
        else {
            let obj = pool.get();
            callback(obj);
        }
    }

    put(url : string, obj : cc.Node) {
        let pool = this.pool[url];
        if (pool == null) {
            pool = new cc.NodePool();
            this.pool[url] = pool;
        }

        pool.put(obj);
    }

    clear(url : string) : void {
        let pool = this.pool[url];
        pool != null && pool.clear();
        pool = null;
        delete this.pool[url];
    }

    clearAll() : void {
        for (const url in this.pool) {
            this.clear(url);
        }
    }

    unload(url : string) : void {
        this.clear(url);
        let count = this.loadRecord[url];
        while (count > 0) {
            LoaderManager.Instance.unload(url);
            count--;
        }

        delete this.loadRecord[url];
    }

    unloadAll() : void {
        for (const url in this.loadRecord) {
            this.unload(url);
        }
    }

    load(url : string, type : typeof cc.Asset, callback : Function) : void {
        if (this.loadRecord[url] == null) this.loadRecord[url] = 0;
        this.loadRecord[url]++;

        let cb = (res) => {
            callback(cc.instantiate(res));
        }

        LoaderManager.Instance.load(url, type, cb);
    }
}

window.regVar("PoolManager", PoolManager);