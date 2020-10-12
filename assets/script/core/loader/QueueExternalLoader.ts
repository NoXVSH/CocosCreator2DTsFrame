import QueueLoaderBase, { QueueLoaderItem } from "./QueueLoaderBase";
import LoaderExternalManager from "./LoaderExternalManager";

export default class QueueExternalLoader extends QueueLoaderBase {
    private static _instance: QueueExternalLoader;

    static get Instance(): QueueExternalLoader {
        if (this._instance == null) {
            this._instance = new QueueExternalLoader();
        }

        return this._instance;
    }

    load(url: string, type: string | typeof cc.Asset, callback: Function, errorback?: Function) {
        let tick = this.tick++;

        let queueItem: QueueLoaderItem = {
            url: url, 
            type: type, 
            callback: callback, 
            errorback: errorback, 
            isLoading: false, 
            timeOutTick: null, 
            tick: tick,
            bundleName : null,
            loader : LoaderExternalManager.Instance
        };

        this.waitList.push(queueItem);
        this.checkLoadList();

        return tick;
    }
}

window.regVar("QueueExternalLoader", QueueExternalLoader);
