import { LoadErrorEnum } from "./LoadErrorEnum";
import LoaderConst from "./LoaderConst";


export interface LoaderStruct {
    url: string;
    type: typeof cc.Asset | string;
    callback: Function;
    errorback: Function;
    resource: any;
    count: number;
    depends: any[];
    tryCount: number;
    isTimeout: boolean;
    timeoutFuncTick: number;
    unloaded: boolean;
    isUsed: boolean; //是否真正使用过
    unloadTime: number; //最近一次使用的时间
}

export default class LoaderManagerBase {
    protected _references: { [key: string]: number } = {};
    protected _urlMap: { [key: string]: LoaderStruct } = {};
    protected _isLoading: { [key: string]: boolean } = {};
    protected _waitList: LoaderStruct[] = [];

    protected openLog: boolean = true;

    protected name: string = "LoaderManagerBase";

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
            info.isUsed = true, info.unloaded = info.isTimeout = false;
            if (this._isLoading[url] != true) { //已经加载完成, 直接返回
                callback(info.resource); //如果加载超时or失败 有可能是null
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

    createInfo(url: string, type: typeof cc.Asset | string, callback: Function, errorback?: Function): LoaderStruct {
        let info = {} as LoaderStruct;
        info.url = url;
        info.type = type;
        info.count = 1;
        info.resource = null;
        info.callback = callback;
        info.errorback = errorback;
        info.tryCount = 0;
        info.isTimeout = false;
        info.unloaded = false;

        this._urlMap[url] = info;

        return info;
    }

    loadAsset(info: LoaderStruct): void {
        this._isLoading[info.url] = true;
        this.__engineLoad(info);
        this.__setInfoTimeOutFunc(info);
    }

    //子类重写
    __engineLoad(info: LoaderStruct) {

    }

    __loadResultHandler(info: LoaderStruct, error: any, resource) {
        delete this._isLoading[info.url];
        clearTimeout(info.timeoutFuncTick);

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

        if (info.unloaded || info.isTimeout) { //加载过程中被卸载掉了或者加载超时后完成加载了
            if (info.unloaded) errorlog(info.url, `被卸载掉了, 加载回调不会执行!!!!!!!!!!!---${this.name}`);
            else if (info.isTimeout) errorlog(info.url, `加载成功但超时了, 加载回调不会执行!!!!!!!!!!!---${this.name}`);
            return;
        }

        info.resource = resource;
        this.addReference(info);
        info.callback && info.callback(resource);

        this.checkLoadComplete();
    }

    __setInfoTimeOutFunc(info: LoaderStruct) {
        info.timeoutFuncTick = setTimeout(() => {
            info.isTimeout = true;
            errorlog(info.url + `加载超时了---${this.name}`);
            info.errorback && info.errorback(LoadErrorEnum.Timeout);
            this.checkLoadError(info.url, LoadErrorEnum.Timeout);
        }, LoaderConst.LoadTimeOut * 1000);
    }

    checkLoadComplete(): void {
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

    checkLoadError(url: string, errortype: LoadErrorEnum): void {
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

    unload(url: string, isForce: boolean = false): void {  //此接口必须外部调用
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
            urlInfo.unloadTime = Date.now();

            if (urlInfo.resource == null || isForce) { //如果res都没有, 直接移除掉
                this.removeCache(urlInfo);
            }
        }
    }

    removeCache(info: LoaderStruct) {
        warnlog(`unload 释放缓存 ---${this.name}---:`, info.url);
        this.removeReference(info);
        delete this._urlMap[info.url];
    }

    //子类重写
    addReference(info: LoaderStruct): void {

    }

    __addReference(depends: any[]) {
        for (let i = 0, len = depends.length; i < len; i++) {
            if (this._references[depends[i]] == null) {
                this._references[depends[i]] = 1;
            } else {
                this._references[depends[i]] += 1;
            }
        }
    }

    removeReference(info: LoaderStruct): void {
        let depends = info.depends;
        if (!depends) {
            warnlog(`removeReference fail info not exist depends ---- ${this.name} --- `, info);
            return;
        }

        for (let i = 0, len = depends.length; i < len; i++) {
            this._references[depends[i]] -= 1;
        }
    }

    /**
     * 卸载资源缓存
     * @param isForce 当为true时, 强制清除掉未达到卸载时间的资源
     */
    clear(isForce: boolean = false): void {
        log(`res start clear --- ${this.name}`);

        let isLoading = Object.keys(this._isLoading).length > 0;

        if (isLoading) {
            warnlog(`有资源正在加载中, clear操作中止 ---- ${this.name}`);
            return;
        }

        this.checkRemoveCache(isForce);

        for (const depend in this._references) {
            if (this._references.hasOwnProperty(depend)) {
                if (this._references[depend] <= 0) {
                    warnlog(`-----clear res-----  ${this.name}`, depend);
                    cc.loader.release(depend);
                    delete this._references[depend];
                }
            }
        }

        log(`res end clear --- ${this.name}`);
    }

    checkResIsLoad(url: string): boolean {
        return this._isLoading[url] == true;
    }

    //通过url直接获取加载完成的资源, 未加载则返回null
    getResByUrl(url: string): any {
        let urlInfo = this._urlMap[url];
        if (urlInfo != null && urlInfo.resource != null) return urlInfo.resource;
        return null;
    }

    checkIsCanRemoveCache(info: LoaderStruct): boolean {
        if (!info.unloaded) return false;
        let offsetTime = (Date.now() - info.unloadTime) / 1000;
        return offsetTime >= LoaderConst.ReleaseWaitTime;
    }

    checkRemoveCache(isForce: boolean) {
        for (const key in this._urlMap) {
            let info = this._urlMap[key];
            let canRemoveCache = this.checkIsCanRemoveCache(info);
            if (canRemoveCache || (isForce && info.count == 0)) this.removeCache(info);
            // if(info.unloaded) warnlog(`unload 未达到释放时间 保存缓存 ---${this.name}---:`, key);
        }
    }

    //输出游戏中加载的png图片占用内存
    logPngMemory(): void {
        let totalMemory = 0;
        let count = 0;

        let tempMemory = 0;
        let cache = (<any>cc.loader)._cache;
        for (const key in cache) {
            let data = cache[key];
            if (data.type == "png") {
                let info = data._owner != null ? data._owner : data.content;

                tempMemory = info.width * info.height * (info._format / 8) / (1024 * 1024); //B(字节)转MB(兆)
                totalMemory += tempMemory;
                count++;
                log("图片" + key + "    占用内存" + tempMemory + "MB");
            }
        }

        warnlog(count + "张图片占用内存     " + totalMemory + "MB");
    }

}
