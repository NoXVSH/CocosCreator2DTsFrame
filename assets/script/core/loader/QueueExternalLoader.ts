import QueueLoaderBase from "./QueueLoaderBase";
import LoaderExternalManager from "./LoaderExternalManager";

export default class QueueExternalLoader extends QueueLoaderBase {
    private static _instance: QueueExternalLoader;

    static get Instance(): QueueExternalLoader {
        if (this._instance == null) {
            this._instance = new QueueExternalLoader();
        }

        return this._instance;
    }

    constructor() {
        super();
        this.queueLoader = LoaderExternalManager.Instance;
    }


}

window.regVar("QueueExternalLoader", QueueExternalLoader);
