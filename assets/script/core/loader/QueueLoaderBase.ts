import LoaderConst, { BundleName } from "./LoaderConst";
import { LoadErrorEnum } from "./LoadErrorEnum";

export interface QueueLoaderItem {
    url: string;
    type: string | typeof cc.Asset;
    bundleName : BundleName;
    loader : QueueLoaderInterface
    callback: Function;
    errorback: Function;
    isLoading : boolean;
    timeOutTick : number;
    tick : number; //标识
}

export interface QueueLoaderInterface {
    load : (url: string, type: string | typeof cc.Asset, callback: Function, errorback?: Function) => void;
    unload : (url : string) => void;
}

export default class QueueLoaderBase {
    loadList: QueueLoaderItem[] = [];
    waitList: QueueLoaderItem[] = [];
    loadingCount : number = 0;
    queueLoader : QueueLoaderInterface;

    tick : number = 0;

    checkLoadList() {
        if (this.loadingCount >= LoaderConst.MaxLoadingCount) return;
        if(this.waitList.length == 0) return;

        let queueItem = this.waitList.shift();
        this.loadList.push(queueItem);

        queueItem.timeOutTick = setTimeout(() => { //分帧
            queueItem.timeOutTick = null;
            this.__load(queueItem);
        }, 0);
    }

    __load(queueItem : QueueLoaderItem) {
        this.changeLoadingCount(true);
        queueItem.isLoading = true;
        queueItem.loader.load(queueItem.url, queueItem.type,
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

    unload(tick : number) {
        //先检测waitlist 在检测loadlist 保证队列的特性
        for(let i = this.waitList.length - 1; i >= 0; i--) {
            let item = this.waitList[i];
            if(item.tick == tick) {
                this.__unload(item);
                this.waitList.splice(i, 1);
                return;
            }
        }

        for(let i = this.loadList.length - 1; i >= 0; i--) {
            let item = this.loadList[i];
            if(item.tick == tick) {
                if(!this.__clearTimeout(item)) {
                    this.__unload(item);
                    if(item.isLoading) this.changeLoadingCount(false);
                }
                this.loadList.splice(i, 1);
                return;
            }
        }

    }

    __clearTimeout(item : QueueLoaderItem) { //若清除定时器成功 则还未真正加载
        if(item.timeOutTick != null) {
            clearTimeout(item.timeOutTick);
            item.timeOutTick = null;
            return true;
        }

        return false;
    }

    __unload(item : QueueLoaderItem) {
        item.loader.unload(item.url);
    }

}
