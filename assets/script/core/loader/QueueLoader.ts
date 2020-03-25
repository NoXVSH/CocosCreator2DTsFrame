import LoaderManager from "./LoaderManager";
import QueueLoaderBase from "./QueueLoaderBase";

export default class QueueLoader extends QueueLoaderBase {
    private static _instance: QueueLoader;

    static get Instance(): QueueLoader {
        if (this._instance == null) {
            this._instance = new QueueLoader();
        }

        return this._instance;
    }

    constructor() {
        super();
        this.queueLoader = LoaderManager.Instance;
    }
}


window.regVar("QueueLoader", QueueLoader);
