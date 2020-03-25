import LoaderConst from "./LoaderConst";
import { LoadErrorEnum } from "./LoadErrorEnum";

export interface QueueLoaderItem {
    url: string;
    type: string | typeof cc.Asset;
    callback: Function;
    errorback: Function;
    isLoading : boolean;
    timeOutTick : number;
}

export interface QueueLoaderInterface {
    load : (url: string, type: string | typeof cc.Asset, callback: Function, errorback?: Function) => void;
    unload : (url : string, force : boolean) => void;
}

export default class QueueLoaderBase {
    loadList: QueueLoaderItem[] = [];
    waitList: QueueLoaderItem[] = [];
    loadingCount : number = 0;
    queueLoader : QueueLoaderInterface;

    load(url: string, type: string | typeof cc.Asset, callback: Function, errorback?: Function) {
        let queueItem: QueueLoaderItem = {
            url: url, type: type, callback: callback, errorback: errorback, isLoading : false, timeOutTick : null
        };

        this.waitList.push(queueItem);
        this.checkLoadList();
    }

    checkLoadList() {
        if (this.loadingCount >= LoaderConst.MaxLoadingCount) return;
        if(this.waitList.length == 0) return;

        let queueItem = this.waitList.shift();
        this.loadList.push(queueItem);

        queueItem.timeOutTick = setTimeout(() => { //分帧
            this.__load(queueItem);
        }, 0);
    }

    __load(queueItem : QueueLoaderItem) {
        this.changeLoadingCount(true);
        queueItem.isLoading = true;
        this.queueLoader.load(queueItem.url, queueItem.type,
            (resource) => {
                this.changeLoadingCount(false);
                queueItem.isLoading = false;
                queueItem.callback && queueItem.callback(resource);
            },

            (errortype: LoadErrorEnum) => {
                this.changeLoadingCount(false);
                queueItem.isLoading = false;
                queueItem.errorback && queueItem.errorback(errortype);
            }
        );
    }

    changeLoadingCount(isAdd : boolean) {
        isAdd && this.loadingCount++;
        !isAdd && this.loadingCount--;
        this.checkLoadList();
    }

    unload(url : string, force : boolean = false) {
        //先检测waitlist 在检测loadlist 保证队列的特性

        for(let i = this.waitList.length - 1; i >= 0; i--) {
            let item = this.waitList[i];
            if(item.url == url) {
                this.__unload(url, force);
                this.waitList.splice(i, 1);
                return;
            }
        }

        for(let i = this.loadList.length - 1; i >= 0; i--) {
            let item = this.loadList[i];
            if(item.url == url) {
                if(this.__clearTimeout(item)) {
                    this.__unload(url, force);
                    if(item.isLoading) this.changeLoadingCount(false);
                }
                this.loadList.splice(i, 1);
                return;
            }
        }

    }

    __clearTimeout(item : QueueLoaderItem) {
        if(item.timeOutTick) {
            clearTimeout(item.timeOutTick);
            item.timeOutTick = null;
            return true;
        }

        return false;
    }

    __unload(url : string, force : boolean) {
        this.queueLoader.unload(url, force);
    }

}
