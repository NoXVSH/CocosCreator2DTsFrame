import { LoadErrorEnum } from "./LoadErrorEnum";
import LoaderConst from "./LoaderConst";

export interface LoaderStruct {
    url: string;
    type: typeof cc.Asset | string;
    callback: Function;
    errorback: Function;
    resource: cc.Asset;
    count: number;
    depends: any[];
    unloaded: boolean;
    isUsed: boolean;
    tryCount: number;
}

export default class LoaderBase {
    protected _urlMap: { [key: string]: LoaderStruct } = {};
    protected _isLoading: { [key: string]: boolean } = {};
    protected _waitList: LoaderStruct[] = [];

    protected openLog: boolean = true;

    protected name: string = "LoaderBase";

    loadPromise(url: string, type: typeof cc.Asset | string): Promise<any> {
        let p = new Promise((resolve, reject) => {
            this.load(url, type, resolve, reject);
        });
        return p;
    }

    silentLoadPromise(url: string, type: typeof cc.Asset | string) {
        let p = new Promise((resolve, reject) => {
            this.silentLoad(url, type, resolve);
        });
        return p;
    }

    /**
     * 正常加载, 走资源计数
     * @param url 
     * @param type 
     * @param callback 
     */
    load(url: string, type: typeof cc.Asset | string, callback: Function, errorback?: Function) {
        let info = this._urlMap[url];

        if (info != null) {
            info.count++;
            info.isUsed = true;
            if (this._isLoading[url] != true) { //已经加载完成, 直接返回
                callback(info.resource); //如果加载失败 有可能是null
            }
            else { //正在加载中, 进入等待列表
                this._waitList.push({ url: url, type: type, callback: callback, errorback: errorback } as LoaderStruct);
            }
        }
        else { //加载资源
            let info = this.createInfo(url, type, callback, errorback);
            info.isUsed = true;
            this.loadAsset(info);
        }
    }

    /**
     * 后台偷偷加载, 不走资源计数
     * @param url 
     * @param type 
     * @param callback 
     */
    silentLoad(url: string, type: typeof cc.Asset | string, callback?: Function): void {
        let info = this._urlMap[url];

        let errorback: Function = () => {
            this.unload(url);
        }; //偷偷下载失败 需要卸载下资源标记

        if (info != null) {
            if (this._isLoading[url] != true) { //已经加载完成, 直接返回
                callback && callback();
            }
            else { //正在加载中, 进入等待列表
                this._waitList.push({ url: url, type: type, callback: callback, errorback: errorback } as LoaderStruct);
            }
        }
        else { //加载资源
            let info = this.createInfo(url, type, callback, errorback);
            info.isUsed = false;
            this.loadAsset(info);
            this._urlMap[url].count--; //不计数 减1
        }
    }

    private createInfo(url: string, type: typeof cc.Asset | string, callback: Function, errorback?: Function): LoaderStruct {
        let info = {} as LoaderStruct;
        info.url = url;
        info.type = type;
        info.count = 1;
        info.resource = null;
        info.callback = callback;
        info.errorback = errorback;
        info.unloaded = false;
        info.tryCount = 0;

        this._urlMap[url] = info;

        return info;
    }

    private loadAsset(info: LoaderStruct): void {
        this._isLoading[info.url] = true;
        this.__engineLoad(info);
    }

    //子类重写
    protected __engineLoad(info: LoaderStruct) {

    }

    protected __loadResultHandler(info: LoaderStruct, error: any, resource) {
        delete this._isLoading[info.url];

        if (error) {
            errorlog(`res load error -----${this.name}`, info.url, error.message || error);

            info.tryCount++;
            if (info.tryCount <= LoaderConst.RetryCount) {
                setTimeout(() => {
                    errorlog(`拉取资源失败，重新拉取 ----${this.name}`, info.url);
                    this.loadAsset(info);
                }, 2000);
            }
            else {
                info.errorback && info.errorback(LoadErrorEnum.LoadFail);
                this.checkLoadError(info.url, LoadErrorEnum.LoadFail);
            }
            return;
        }

        if (info.unloaded) { //加载过程中被卸载掉了
            errorlog(info.url, `被卸载掉了, 加载回调不会执行!!!!!!!!!!!---${this.name}`);
            return;
        }

        info.resource = resource;
        this.addReference(info);
        info.callback && info.callback(resource);

        this.checkLoadComplete();
    }

    private checkLoadComplete(): void {
        let tempList = [];
        for (let i = 0; i < this._waitList.length; i++) { //优先处理列表前面的
            let info = this._waitList[i];
            let urlInfo = this._urlMap[info.url];

            if (this._isLoading[info.url] != true) {
                info.callback && info.callback(urlInfo.resource);
            }
            else {
                tempList.push(info);
            }
        }

        this._waitList = tempList;
    }

    private checkLoadError(url: string, errortype: LoadErrorEnum): void {
        let errorList = [];

        for (let i = this._waitList.length - 1; i >= 0; i--) {
            let info = this._waitList[i];
            if (info.url == url) {
                errorList.push(info);
                this._waitList.splice(i, 1);
            }
        }

        for (let i = errorList.length - 1; i >= 0; i--) { //保证先来后到顺序
            let info = errorList[i];

            if (info.errorback) {
                info.errorback(errortype);
                errorlog(url + `在等待加载完成列表中移除, 并错误回调触发了----${this.name}`);
            }
            else {
                errorlog(url + `在等待加载完成列表中移除----${this.name}`);
            }
        }

    }

    unload(url: string): void {  //此接口必须外部调用
        let urlInfo = this._urlMap[url];

        if (urlInfo == null) {
            errorlog(`unload warn : unloaded  ----${this.name}`, url);
            return;
        }
        if (urlInfo.count == 0 && urlInfo.isUsed) { //使用过但计数为0
            errorlog(`unload warn : unloaded 计数本来为0  ---${this.name}`, url);
            return;
        }
        else if (urlInfo.count != 0) {
            urlInfo.count--;
            for (let i = this._waitList.length - 1; i >= 0; i--) {
                let info = this._waitList[i];
                if (info.url == url) {
                    this._waitList.splice(i, 1);
                    break;
                }
            }
        }

        if (urlInfo.count == 0) {
            let isLoading = this._isLoading[url] == true;

            if (isLoading) {  //加载过程中被卸载了
                errorlog(`unload warn : loading ---${this.name}`, url);
                delete this._isLoading[url];
            }

            urlInfo.unloaded = true; //打上卸载标签
            this.removeCache(urlInfo);
        }
    }

    private removeCache(info: LoaderStruct) {
        warnlog(`unload 释放缓存 ---${this.name}---:`, info.url);
        this.removeReference(info);
        delete this._urlMap[info.url];
    }

    private addReference(info: LoaderStruct): void {
        if (info.resource == null) {
            errorlog("添加资源引用失败", info, this.name);
            return;
        }

        info.resource.addRef();
    }

    private removeReference(info: LoaderStruct): void {
        if (info.resource == null) {
            errorlog("减少资源引用失败", info, this.name);
            return;
        }

        info.resource.decRef();
        info.resource = null;
    }

    checkResIsLoad(url: string): boolean {
        return this._isLoading[url] == true;
    }

    //通过url直接获取加载完成的资源, 未加载则返回null
    getResByUrl(url: string): cc.Asset {
        let urlInfo = this._urlMap[url];
        if (urlInfo != null && urlInfo.resource != null) return urlInfo.resource;
        return null;
    }

}
