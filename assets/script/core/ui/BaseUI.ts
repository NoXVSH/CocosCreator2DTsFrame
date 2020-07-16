export default class BaseUI extends cc.Component {
    //所有UI基类
    
    onLoad() {
        this.addStaticEvent();
        this.viewLoad();
    }
    
    viewLoad() {
        
    }

    onEnable() {
        this.addEvent();
        this.viewEnable();
        this.showAnimation();
    }

    viewEnable() {

    }

    onDisable() {
        this.viewDisable();
        this.removeEvent();
    }

    viewDisable() {

    }

    viewDestroy() {
        this.removeStaticEvent();
    }

    addEvent() {
        let events = this.getEvents();

        for(let i = 0, len = events.length; i < len; i++) {
            let event = events[i];
            event[0].on(event[1], event[2], event[3]);
        }
    }

    addStaticEvent() {
        let events = this.getStaticEvents();

        for(let i = 0, len = events.length; i < len; i++) {
            let event = events[i];
            let useCapture = event[4] != null? event[4] : false;
            event[0].on(event[1], event[2], event[3], useCapture);
        }
    }

    removeEvent() {
        let events = this.getEvents();

        for(let i = 0, len = events.length; i < len; i++) {
            let event = events[i];
            event[0].off(event[1], event[2], event[3]);
        }
    }

    removeStaticEvent() {
        let events = this.getStaticEvents();

        for(let i = 0, len = events.length; i < len; i++) {
            let event = events[i];
            event[0].off(event[1], event[2], event[3]);
        }
    }

    getEvents() {  //普通事件 该节点隐藏 移除 显示 重新注册
        return [];  //[[eventManager, eventname, function, target]]
    }

    getStaticEvents() { //静态事件 生命周期 该节点创建到销毁
        return []; //[[eventManager, eventname, function, target]]
    }

    showAnimation() {

    }

}