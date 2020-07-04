import { ModuleName } from "./ModuleName";
import ModuleBase from "./ModuleBase";
import { UINameEnum } from "../ui/UINameEnum";
import LoadingManager from "../../module/loading/LoadingManager";
import BannerManager from "../../module/banner/BannerManager";
import TipManager from "../../module/tip/TipManager";
import MessageBoxManager from "../../module/messagebox/MessageBoxManager";
import LoginManager from "../../module/login/LoginManager";
import EnergyManager from "../../module/energy/EnergyManager";
import TimeManager from "../../module/time/TimeManager";
import ItemManager from "../../module/item/ItemManager";
import SampleManager from "../../module/sample/SampleManager";

export default class ModuleManager {
    private static _instance : ModuleManager;

    static get Instance() : ModuleManager {
        if(this._instance == null) {
            this._instance = new ModuleManager();
        }

        return this._instance;
    }

    private Loading : ModuleBase = new LoadingManager();
    private Banner : ModuleBase = new BannerManager();
    private Tip : ModuleBase = new TipManager();
    private MessageBox : ModuleBase = new MessageBoxManager();
    private Login : ModuleBase = new LoginManager();
    private Energy : ModuleBase = new EnergyManager();
    private Item : ModuleBase = new ItemManager();
    private Time : ModuleBase = new TimeManager();
    private Sample : ModuleBase = new SampleManager();

    init() : void {
        for(const key in ModuleName) {
            let moduleName = ModuleName[key];
            this[moduleName].init();
            log(moduleName + "Manager----Init");
        }
    }

    dispatchSet(module: ModuleName, eventName: string, arg?: any) {
        return this[module].dispatchSet(eventName, arg);
    }

    dispatchGet(module: ModuleName, eventName: string, arg?: any) {
        return this[module].dispatchGet(eventName, arg);
    }

    emit(module: ModuleName, eventName: string, arg?: any) {
        this[module].emit(eventName, arg);
    }

    requestOperate(module: ModuleName, eventName: string, arg? : any) {
        this[module].requestOperate(eventName, arg);
    }

    getManager(moduleName: ModuleName) : ModuleBase {
        return this[moduleName];
    }

    openUI(moduleName: ModuleName, uiName : UINameEnum, data = {}) {
        this[moduleName]["openUI"](uiName, data);
    }

    closeUI(moduleName: ModuleName, uiName : UINameEnum, data = {}) {
        this[moduleName]["closeUI"](uiName, data);
    }
}

window.regVar("ModuleManager", ModuleManager);

