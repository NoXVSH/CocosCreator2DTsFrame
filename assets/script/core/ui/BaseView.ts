import BaseUI from "./BaseUI";
import ModuleBase from "../module/ModuleBase";

export default class BaseView extends BaseUI {
    protected manager : ModuleBase = null;

    init(manager : ModuleBase) {
        this.manager = manager;
    }

    addEvent() {
        super.addEvent();

        this.node.on("setData", this.setData, this);
    }

    removeEvent() {
        super.removeEvent();
        this.node.off("setData", this.setData, this);
    } 

    addStaticEvent() {
        super.addStaticEvent();

        this.node.on("beforeDestroy", this.beforeDestroy, this);
    }

    removeStaticEvent() {
        super.removeStaticEvent();

        this.node.off("beforeDestroy", this.beforeDestroy, this);
    }
    
    setData(e) {

    }

    beforeDestroy() {
        
    }


}