import ModuleBase from "../../core/module/ModuleBase";
import UIManager, { UIInfoStruct } from "../../core/ui/UIManager";
import { UILayer } from "../../core/ui/UILayer";
import { UINameEnum } from "../../core/ui/UINameEnum";

export default class MessageBoxManager extends ModuleBase {
    mainUIInfo: UIInfoStruct;

    init() {
        super.init();
        
        this.mainUIInfo = {
            name : UINameEnum.MessageBox,
            layer : UILayer.Tip,
            showMask : true,
        } as UIInfoStruct;
        
        this.registerUIInfo(this.mainUIInfo, this.open, this.close);
    }

    addEvent() {
        super.addEvent();
        
    }

    open(data) {
        this.mainUIInfo.viewData = {desc : data.desc, successCb : data.successCb, cancelCb : data.cancelCb};
        UIManager.Instance.openUIWithInfo(this.mainUIInfo, data.callback);
    }

    close() {
        UIManager.Instance.closeUIWithInfo(this.mainUIInfo);
    }

}
