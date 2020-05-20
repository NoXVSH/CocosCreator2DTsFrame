import ModuleBase from "../../core/module/ModuleBase";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import UserInfo from "../../config/UserInfo";
import EnergyConst from "./const/EnergyConst";
import {PropEnum} from "../prop/PropEnum";
import { UserInfoJsonKey } from "../../config/UserInfoEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EnergyManager extends ModuleBase {

    beforeEnterHome() {
        this.initInfo();

        EventManager.Instance.on(EventType.EnergySendAdd, this.energySendAdd, this);
        EventManager.Instance.on(EventType.EnergyDown, this.energyDown, this);
        EventManager.Instance.on(EventType.GameOnShow, this.initInfo, this);
    }

    initInfo() {
        this.unscheduleAllCallbacks();
        
        let recoverTime = UserInfo.Instance.getUserjson(UserInfoJsonKey.energyRecoverTime);
        let nowTime = parseInt((Date.now() / 1000) + "");
        let offsetTime = recoverTime - nowTime;

        if (offsetTime < 0) {
            let tempTime = -offsetTime;
            let value = Math.ceil(tempTime / EnergyConst.recoverTimer);
            let energy = EventManager.Instance.dispatchGet(EventType.GetProp, PropEnum.ENERGY);

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
            this.scheduleOnce(() => {
                this.__addEnergy(1);
            }, offsetTime + 1);

            warnlog("LOGIN--- 时间不够   " + offsetTime);
        }

        this.emit("updateEnergyInfo");
    }

    energyAdd() {
        let energy = EventManager.Instance.dispatchGet(EventType.GetProp, PropEnum.ENERGY);

        if (energy >= EnergyConst.maxEnergy) {
            this.emit("updateEnergyInfo");
            return;
        }

        this.unscheduleAllCallbacks();

        let recoverTime = parseInt((Date.now() / 1000 + EnergyConst.recoverTimer) + "");
        UserInfo.Instance.setUserjson(UserInfoJsonKey.energyRecoverTime, recoverTime);

        this.scheduleOnce(() => {
            this.__addEnergy(1);
        }, EnergyConst.recoverTimer + 1);

        this.emit("updateEnergyInfo");
    }

    energySendAdd() {
        let energy = EventManager.Instance.dispatchGet(EventType.GetProp, PropEnum.ENERGY);
        energy >= EnergyConst.maxEnergy && this.unscheduleAllCallbacks();

        this.emit("updateEnergyInfo");
    }

    energyDown(e) {
        e.old >= EnergyConst.maxEnergy && e.now < EnergyConst.maxEnergy && this.energyAdd();

        this.emit("updateEnergyInfo");
    }

    __addEnergy(addValue) { //外部切记勿调用
        EventManager.Instance.requestOperate(EventType.AddProp, {type : PropEnum.ENERGY, value : addValue});
        this.energyAdd();
    }

}
