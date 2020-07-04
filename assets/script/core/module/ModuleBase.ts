import ModelBase from "./ModelBase";
import EventHandler from "../event/EventHandler";
import EventManager from "../event/EventManager";
import { EventType } from "../event/EventType";
import { UINameEnum } from "../ui/UINameEnum";
import UIManager, { UIInfoStruct } from "../ui/UIManager";

export default class ModuleBase { //模块管理器基类
    private eventHanlder : EventHandler = new EventHandler();
    private modelMap : {[key : string] : ModelBase} = {};
    private uiOpenFuncMap: {[key : string] : Function} = {};
    private uiCloseFuncMap: {[key : string] : Function} = {};

    init() : void {
        this.initModel();
        this.addEvent();
    };

    initModel() {
        let modelClasss = this.getModelClass();

        for(let i = 0, len = modelClasss.length; i < len; i++) {
            let modelClass = modelClasss[i];
            let model = new modelClass() as ModelBase;       
            this.modelMap[modelClass] = model;

            model.init(this);
        }
    };

    addEvent() : void {
        EventManager.Instance.on(EventType.ConfigLoadComplete, this.configLoadCompelte, this);
        EventManager.Instance.on(EventType.BeforeEnterHome, this.beforeEnterHome, this);
    };

    beforeEnterHome() {
        
    }

    configLoadCompelte() {
        
    }

    getModelClass() {
        return [];
    }

    on(eventName : string, callback : Function, thisObj : any) : void {
        this.eventHanlder.on(eventName, callback, thisObj);
    }
    
    once(eventName : string, callback : Function, thisObj : any) : void {
        this.eventHanlder.once(eventName, callback, thisObj);
    }

    off(eventName : string, callback : Function, thisObj : any) {
        this.eventHanlder.off(eventName, callback, thisObj);
    }

    emit(eventName : string, arg? : any) { //限制只传递一个参数
        this.eventHanlder.emit(eventName, arg);
    }

    dispatchGet(eventName : string, arg? : any) {
        return this.__syncEmit(eventName, arg);
    }

    dispatchSet(eventName : string, arg? : any) { 
        return this.__syncEmit(eventName, arg);
    }

    requestOperate(eventName : string, arg? : any) { //请求操作, 返回值为错误码
        return this.__syncEmit(eventName, arg);
    }

    __syncEmit(eventName : string, arg? : any) {
        return this.eventHanlder.syncEmit(eventName, arg);
    }

    private openUI(uiName : UINameEnum, data) {
        let func = this.uiOpenFuncMap[uiName];
        if(!func) {
            errorlog(`打开${uiName}错误, 未找到打开函数`);
            return;
        }
        func.call(this, data);
    }

    private closeUI(uiName : UINameEnum, data) {
        let func = this.uiCloseFuncMap[uiName];
        if(!func) {
            errorlog(`关闭${uiName}错误, 未找到关闭函数`);
            return;
        }
        func.call(this, data);
    }

    registerUIInfo(info : UIInfoStruct, openFunc : Function, closeFunc : Function) {
        this.uiOpenFuncMap[info.name] = openFunc;
        this.uiCloseFuncMap[info.name] = closeFunc;
        info.manager = this;
        UIManager.Instance.registerUIInfo(info);
    }





}
