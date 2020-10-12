import ModuleBase from "../../core/module/ModuleBase";
import UIManager, { UIInfoStruct } from "../../core/ui/UIManager";
import { UILayer } from "../../core/ui/UILayer";
import { UINameEnum } from "../../core/ui/UINameEnum";
import { BundleName } from "../../core/loader/LoaderConst";

export default class LoginManager extends ModuleBase {
    private mainUIInfo: UIInfoStruct;

    init() {
        super.init();

        this.mainUIInfo = {
            name: UINameEnum.Login,
            bundleName : BundleName.LocalRes,
            layer: UILayer.Main,
        } as UIInfoStruct;

        this.registerUIInfo(this.mainUIInfo, this.open, this.close);
    }

    getModelClass() {
        return [];
    }

    addEvent() {
        super.addEvent();
    }

    open(data): void {
        UIManager.Instance.openUIWithInfo(this.mainUIInfo, data.callback);
    }

    close(data): void {
        UIManager.Instance.closeUIWithInfo(this.mainUIInfo);
    }

}
