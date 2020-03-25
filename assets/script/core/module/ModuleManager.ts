import { ModuleName } from "./ModuleName";
import ModuleBase from "./ModuleBase";
import { UINameEnum } from "../ui/UINameEnum";

export default class ModuleManager {
    private static _instance : ModuleManager;

    static get Instance() : ModuleManager {
        if(this._instance == null) {
            this._instance = new ModuleManager();
        }

        return this._instance;
    }

    private Loading : ModuleBase;
    private Banner : ModuleBase;
    private Tip : ModuleBase;
    private MessageBox : ModuleBase;
    private Login : ModuleBase;
    private Energy : ModuleBase;
    private Prop : ModuleBase;
    private Time : ModuleBase;

    init() : void {
        let layer = cc.find("Canvas/ModuleManager");
        //add
        for(const key in ModuleName) {
            let moduleName = ModuleName[key];
            let node = new cc.Node(moduleName + "Manager");
            let com = node.addComponent(moduleName + "Manager");
            this[moduleName] = com;
            com.moduleName = moduleName;

            layer.addChild(node);
            log(moduleName + "Manager----Add");
        }
        //init
        for(const key in ModuleName) {
            let moduleName = ModuleName[key];
            this[moduleName].init();
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

