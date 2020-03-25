export default class EventHandler {
    private eventNode : cc.EventTarget = new cc.EventTarget();

    on(eventName : string, callback : Function, thisObj : any) : void {
        if(this.eventNode == null) {
            log("未绑定事件节点!!!");
            return;
        }

        if(eventName == undefined || eventName == null || callback == null || thisObj == null) {
            errorlog("事件注册存在undefined 或 null!!!!!!!", eventName, callback, thisObj);
            return;
        }

        this.eventNode.on(eventName, callback, thisObj);
    }

    once(eventName : string, callback : Function, thisObj : any) {
        if(this.eventNode == null) {
            log("未绑定事件节点!!!");
            return;
        }

        if(eventName == undefined || eventName == null || callback == null || thisObj == null) {
            errorlog("事件注册存在undefined 或 null!!!!!!!", eventName, callback, thisObj);
            return;
        }

        this.eventNode.once(eventName, callback, thisObj);
    }

    off(eventName : string, callback : Function, thisObj : any) {
        if(this.eventNode == null) {
            log("未绑定事件节点!!!");
            return;
        }

        if(eventName == undefined || eventName == null || callback == null || thisObj == null) {
            errorlog("事件注销存在undefined 或 null!!!!!!!", eventName, callback, thisObj);
            return;
        }

        this.eventNode.off(eventName, callback, thisObj);
    }

    emit(eventName : string, arg? : any) { //限制只传递一个参数
        if(this.eventNode == null) {
            log("未绑定事件节点!!!");
            return;
        }

        if(eventName == undefined || eventName == null) {
            errorlog("事件名为undefined 或 null!!!!!!!");
            return;
        }

        // log("派发事件: " + eventName);

        this.eventNode.emit(eventName, arg);
    }

    syncEmit(eventName : string, arg? : any) { //同步派发, 直接拿到返回值
        if(this.eventNode == null) {
            log("未绑定事件节点!!!");
            return;
        }

        if(eventName == undefined || eventName == null) {
            errorlog("事件名为undefined 或 null!!!!!!!");
            return;
        }

        // log("派发事件: " + eventName);

        let event = new cc.Event.EventCustom(eventName, false); //不进行冒泡
        if(arg != null) event.setUserData(arg);
        this.eventNode.dispatchEvent(event);
        return event.getUserData();
    }

}
