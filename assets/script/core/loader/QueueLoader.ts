// import LoaderManager from "./LoaderManager";
// import QueueLoaderBase, { QueueLoaderItem } from "./QueueLoaderBase";
// import { BundleName } from "./LoaderConst";

// export default class QueueLoader extends QueueLoaderBase {
//     private static _instance: QueueLoader;

//     static get Instance(): QueueLoader {
//         if (this._instance == null) {
//             this._instance = new QueueLoader();
//         }

//         return this._instance;
//     }

//     load(url: string, bundleName: BundleName, type: string | typeof cc.Asset, callback: Function, errorback?: Function) {
//         let tick = this.tick++;

//         let queueItem: QueueLoaderItem = {
//             url: url, 
//             type: type, 
//             callback: callback, 
//             errorback: errorback, 
//             isLoading: false, 
//             timeOutTick: null, 
//             tick: tick,
//             bundleName : bundleName,
//             loader : LoaderManager.Instance.getBundleLoader(bundleName)
//         };

//         this.waitList.push(queueItem);
//         this.checkLoadList();

//         return tick;
//     }
// }

// window.regVar("QueueLoader", QueueLoader);
