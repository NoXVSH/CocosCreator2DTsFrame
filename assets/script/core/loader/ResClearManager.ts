import LoaderManager from "./LoaderManager";
import PlatformManager from "../../platform/PlatformManager";
import UIManager from "../ui/UIManager";

export default class ResClearManager {
    private static _instance: ResClearManager;

    static get Instance(): ResClearManager {
        if (this._instance == null) {
            this._instance = new ResClearManager();
        }

        return this._instance;
    }

    clearRes(isGc : boolean = false) {
        UIManager.Instance.clearUnuseUI();
        LoaderManager.Instance.clear();
        isGc && PlatformManager.Instance.garbageCollect();
    }


}
