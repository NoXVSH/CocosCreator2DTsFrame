import ModuleBase from "../../core/module/ModuleBase";
import UIManager, { UIInfoStruct } from "../../core/ui/UIManager";
import SampleModel from "./model/SampleModel";
import { UINameEnum } from "../../core/ui/UINameEnum";
import { UILayer } from "../../core/ui/UILayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SampleManager extends ModuleBase {
    private sampleActivity1UIInfo : UIInfoStruct;
    private sampleActivity2UIInfo : UIInfoStruct;
    private sampleActivity3UIInfo : UIInfoStruct;


    init() {
        super.init();

        this.sampleActivity1UIInfo = {
            name: UINameEnum.SampleActivity1,
            layer: UILayer.Activity,
            showMask : true,
        } as UIInfoStruct;

        this.sampleActivity2UIInfo = {
            name: UINameEnum.SampleActivity2,
            layer: UILayer.Activity,
            showMask : true,
        } as UIInfoStruct;

        this.sampleActivity3UIInfo = {
            name: UINameEnum.SampleActivity3,
            layer: UILayer.Activity,
            showMask : true,
        } as UIInfoStruct;

        this.registerUIInfo(this.sampleActivity1UIInfo, this.open1, this.close1);
        this.registerUIInfo(this.sampleActivity2UIInfo, this.open2, this.close2);
        this.registerUIInfo(this.sampleActivity3UIInfo, this.open3, this.close3);
    }

    getModelClass() {
        return [SampleModel];
    }

    addEvent() {
        super.addEvent();
    }

    open1(data): void {
        UIManager.Instance.openUIWithInfo(this.sampleActivity1UIInfo, data.callback);
    }

    close1(data): void {
        UIManager.Instance.closeUIWithInfo(this.sampleActivity1UIInfo);
    }

    open2(data): void {
        UIManager.Instance.openUIWithInfo(this.sampleActivity2UIInfo, data.callback);
    }

    close2(data): void {
        UIManager.Instance.closeUIWithInfo(this.sampleActivity2UIInfo);
    }

    open3(data): void {
        UIManager.Instance.openUIWithInfo(this.sampleActivity3UIInfo, data.callback);
    }

    close3(data): void {
        UIManager.Instance.closeUIWithInfo(this.sampleActivity3UIInfo);
    }

}
