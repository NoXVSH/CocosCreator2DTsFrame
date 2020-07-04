import ModuleBase from "../../core/module/ModuleBase";
import UIManager, { UIInfoStruct } from "../../core/ui/UIManager";
import { UILayer } from "../../core/ui/UILayer";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import { UINameEnum } from "../../core/ui/UINameEnum";

export default class TipManager extends ModuleBase {

    private mainUIInfo : UIInfoStruct;


    init() : void {
        super.init();

        this.mainUIInfo = {
            name : UINameEnum.Tip,
            layer : UILayer.Tip,
        } as UIInfoStruct;

        this.registerUIInfo(this.mainUIInfo, this.open, this.close);
    }

    addEvent() : void {
        super.addEvent();

        EventManager.Instance.on(EventType.TipShow, this.setTip, this);
    }

    open(data) : void {
        UIManager.Instance.openUIWithInfo(this.mainUIInfo, data.callback);
    }

    close() : void {
        UIManager.Instance.closeUIWithInfo(this.mainUIInfo);
    }

    setTip(e :{str : string, time : number}) : void {
        let isShow = UIManager.Instance.checkUIIsShowWithInfo(this.mainUIInfo);
        
        let func = function() {
            this.emit("setTip", {str : e.str, time : e.time});
        }.bind(this);

        if(isShow) {
            func();
        }
        else {
            this.open({
                callback : func
            });
        }

    }
}
