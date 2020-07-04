import ModuleBase from "../../core/module/ModuleBase";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import UserInfo from "../../config/UserInfo";
import EnergyConst from "./const/EnergyConst";
import { UserInfoJsonKey } from "../../config/UserInfoEnum";
import { ItemEnum } from "../item/ItemEnum";

export default class EnergyManager extends ModuleBase {
    private com : cc.Component = new cc.Node().addComponent(cc.Component);

    beforeEnterHome() {
        this.initInfo();

        EventManager.Instance.on(EventType.EnergySendAdd, this.energySendAdd, this);
        EventManager.Instance.on(EventType.EnergyDown, this.energyDown, this);
        EventManager.Instance.on(EventType.GameOnShow, this.initInfo, this);
    }

    initInfo() {
        this.com.unscheduleAllCallbacks();
        
        let recoverTime = UserInfo.Instance.getUserjson(UserInfoJsonKey.energyRecoverTime);
        let nowTime = parseInt((Date.now() / 1000) + "");
        let offsetTime = recoverTime - nowTime;

        if (offsetTime < 0) {
            let tempTime = -offsetTime;
            let value = Math.ceil(tempTime / EnergyConst.recoverTimer);
            let energy = EventManager.Instance.dispatchGet(EventType.GetItem, ItemEnum.ENERGY);

            if (energy >= EnergyConst.maxEnergy) {
                this.emit("updateEnergyInfo");
                return;
            }

            if (energy + value > EnergyConst.maxEnergy) {
                value = EnergyConst.maxEnergy - energy;
            }

            this.__addEnergy(value);

            
            warnlog("LOGIN--- 时间够   " + offsetTime);
        }
        else {
            this.com.scheduleOnce(() => {
                this.__addEnergy(1);
            }, offsetTime + 1);

            warnlog("LOGIN--- 时间不够   " + offsetTime);
        }

        this.emit("updateEnergyInfo");
    }

    energyAdd() {
        let energy = EventManager.Instance.dispatchGet(EventType.GetItem, ItemEnum.ENERGY);

        if (energy >= EnergyConst.maxEnergy) {
            this.emit("updateEnergyInfo");
            return;
        }

        this.com.unscheduleAllCallbacks();

        let recoverTime = parseInt((Date.now() / 1000 + EnergyConst.recoverTimer) + "");
        UserInfo.Instance.setUserjson(UserInfoJsonKey.energyRecoverTime, recoverTime);

        this.com.scheduleOnce(() => {
            this.__addEnergy(1);
        }, EnergyConst.recoverTimer + 1);

        this.emit("updateEnergyInfo");
    }

    energySendAdd() {
        let energy = EventManager.Instance.dispatchGet(EventType.GetItem, ItemEnum.ENERGY);
        energy >= EnergyConst.maxEnergy && this.com.unscheduleAllCallbacks();

        this.emit("updateEnergyInfo");
    }

    energyDown(e) {
        e.old >= EnergyConst.maxEnergy && e.now < EnergyConst.maxEnergy && this.energyAdd();

        this.emit("updateEnergyInfo");
    }

    __addEnergy(addValue) { //外部切记勿调用
        EventManager.Instance.requestOperate(EventType.AddItem, {type : ItemEnum.ENERGY, value : addValue});
        this.energyAdd();
    }

}
