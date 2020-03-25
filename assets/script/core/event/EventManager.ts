import EventHandler from "./EventHandler";

export default class EventManager {
    private static _instance : EventManager;

    static get Instance() : EventManager {
        if(this._instance == null) {
            this._instance = new EventManager();
        }

        return this._instance;
    };

    private eventHanlder : EventHandler = new EventHandler();

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


}

window.regVar("EventManager", EventManager);