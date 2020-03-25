import { UILayer } from "../../core/ui/UILayer";
import ModuleBase from "../../core/module/ModuleBase";
import UIManager, { UIInfoStruct } from "../../core/ui/UIManager";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import { UINameEnum } from "../../core/ui/UINameEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadingManager extends ModuleBase {
    private smallLoadingUIInfo : UIInfoStruct
    private loadingUIInfo: UIInfoStruct;

    private smallLoadingRecord = [];
    private smallLoadingMap = {};
    private smallLoadingType = 0; //当前smallloading的类型 取值 0 3

    init() : void {
        super.init();

        this.loadingUIInfo = {
            name : UINameEnum.Loading,
            layer : UILayer.Load,
            forbidShowSmallLoading : true,
        } as UIInfoStruct;

        this.smallLoadingUIInfo = {
            name : UINameEnum.SmallLoading,
            layer : UILayer.Load,
            forbidShowSmallLoading : true,
            showMask : true,
        } as UIInfoStruct;

        this.registerUIInfo(this.loadingUIInfo, this.open, this.close);
        this.registerUIInfo(this.smallLoadingUIInfo, this.openSmallLoading, this.close);
    };

    //type : 0 等待加载回应 type : 1 等待网络回应
    openSmallLoading(data) : void {
        let key = data.key == null ? "default" : data.key;
        let type = data.type == null ? 0 : data.type;

        if(this.smallLoadingMap[key] != null) {
            warnlog(`开启小loading key: ${key}已经存在----------  smallloading`);
            return;
        }

        let info = {} as any;
        info.key = key;
        info.type = type;

        this.smallLoadingMap[info.key] = info;
        this.smallLoadingRecord.push(key);

        if(this.smallLoadingType != 3) this.smallLoadingType = type; //3优先级最高

        if(UIManager.Instance.checkUIIsShowWithInfo(this.smallLoadingUIInfo)) {
            this.emit("setSmallLoadingType", this.smallLoadingType);
        }
        else {
            UIManager.Instance.openUIWithInfo(this.smallLoadingUIInfo, () => {
                this.emit("setSmallLoadingType", this.smallLoadingType);
            });
        }
    };

    closeSmallLoading(data) : void {
        let key = data.key == null ? "default" : data.key;
        let withAnim = data.withAnim;

        if(this.smallLoadingMap[key] == null) {
            warnlog(`关闭小loading key: ${key}不存在----------  smallloading`);
            return;
        }

        delete this.smallLoadingMap[key];
        let index = this.smallLoadingRecord.indexOf(key);
        this.smallLoadingRecord.splice(index, 1);

        if(this.smallLoadingRecord.length == 0) {
            this.smallLoadingType = 0;
            withAnim && this.smallLoadingUIInfo.node.emit("closeWithAnim", () => UIManager.Instance.closeUIWithInfo(this.smallLoadingUIInfo));
            !withAnim && UIManager.Instance.closeUIWithInfo(this.smallLoadingUIInfo);
        }
        else {
            let lastKey = this.smallLoadingRecord[this.smallLoadingRecord.length - 1];
            let lastInfo = this.smallLoadingMap[lastKey];
            if(this.smallLoadingType != 3) this.smallLoadingType = lastInfo.type; //3优先级最高
            this.emit("setSmallLoadingType", this.smallLoadingType);
        }
    };

    open(data) {
        UIManager.Instance.openUIWithInfo(this.loadingUIInfo, data.callback);
    }

    close(data) {
        UIManager.Instance.closeUIWithInfo(this.loadingUIInfo, data.isDestroy, data.isUnload);
    }

}
