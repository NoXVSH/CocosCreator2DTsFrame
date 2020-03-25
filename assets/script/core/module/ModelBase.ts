import ModuleBase from "./ModuleBase";
import EventManager from "../event/EventManager";
import { EventType } from "../event/EventType";

//model层基类  数据来源 获取 设置数据 或者 一些逻辑操作
export default class ModelBase {
    manager : ModuleBase
    datas : any = {};

    init(manager : ModuleBase) {
        this.manager = manager;
        this.__addPrivateEvent();

        this.modelInit();
        this.addEvent();
    }

    __addPrivateEvent() {
        EventManager.Instance.on(EventType.ConfigLoadComplete, this.configLoadComplete, this);
        EventManager.Instance.on(EventType.LoginSuccess, this.loginSuccess, this);
        EventManager.Instance.on(EventType.BeforeEnterHome, this.beforeEnterHome, this);
        EventManager.Instance.on(EventType.PreloadComplete, this.preloadComplete, this);
    }

    modelInit() {

    }

    addEvent() {
 
    }

    configLoadComplete() {

    }

    userInfoInitComplete() {
        
    }

    loginSuccess() {
        
    }

    beforeEnterHome() {
        
    }

    preloadComplete() {
        
    }

    setData(key, value, force : boolean = false) {
        let old = this.datas[key];

        if(old == value && !force) {
            return;
        }

        this.datas[key] = value;

        this.manager.emit(`model-${key}`, {value : value, oldValue : old});
    }

    getData(key) {
        return this.datas[key];
    }

    emitData(key) {
        let value = this.datas[key];
        if(value == null) return;
        this.manager.emit(`model-${key}`, {value : value, oldValue : value});
    }

    refreshAll() {
        for(const key in this.datas) {
            this.emitData(key);
        }
    }

}
