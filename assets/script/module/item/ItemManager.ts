import ModuleBase from "../../core/module/ModuleBase";
import UserInfo from "../../config/UserInfo";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import ConfigManager from "../../core/config/ConfigManager";
import { UserInfoJsonKey } from "../../config/UserInfoEnum";
import ItemIconPool from "./ItemIconPool";
import { ItemEnum, ItemMasterType } from "./ItemEnum";

export default class ItemManager extends ModuleBase {

    private itemIconPool: ItemIconPool;
    private itemConfig: any;

    init() {
        super.init();
    }

    addEvent() {
        super.addEvent();

        EventManager.Instance.on(EventType.AddItem, this.add, this);
        EventManager.Instance.on(EventType.UseItem, this.use, this);
        EventManager.Instance.on(EventType.GetItem, this.get, this);
        EventManager.Instance.on(EventType.ClearItem, this.clear, this);
    }

    configLoadCompelte() {
        this.itemConfig = ConfigManager.Instance["item"];
    }

    getIconSmall(type: ItemEnum) {
        // let data = this.getItemData(type);
        // return this.propIconPool && this.propIconPool.getIconSmall(data.iconId);
    }

    getIconBig(type: ItemEnum) {
        // let data = this.getItemData(type);
        // return this.propIconPool && this.propIconPool.getIconBig(data.iconId);
    }

    getItemData(type: ItemEnum) {
        return this.itemConfig[type];
    }

    /**
     * 增加道具
     * @param {ItemEnum} type
     * @param {number} value
     */
    add(e : cc.Event.EventCustom) {
        let data = e.getUserData();
        e.setUserData(this.__add(data.type, data.value));
    }

    __add(type: ItemEnum, value: number) {
        let data = this.getItemData(type);

        switch (data.itemType) {
            case ItemMasterType.Resource:
                return this.alterProp(type, value);
        }

        return null;
    }

    /**
     * 使用道具
     * @param {PropEnum} type
     * @param {number} value 传入为正数，如果传入负数为增加
     * @returns {boolean} 是否使用成功
     */
    use(e : cc.Event.EventCustom) {
        let data = e.getUserData();
        e.setUserData(this.__use(data.type, data.value));
    }

    __use(type: ItemEnum, value: number): boolean {
        return this.alterProp(type, -value);
    }

    /**
     * 道具清零
     * @param {PropEnum} type  只有资源类型的可以清零
     */
    clear(e : cc.Event.EventCustom) {
        e.setUserData(this.__clear(e.getUserData()));
    }

    __clear(type: ItemEnum) {
        let data = this.getItemData(type);
        if (data.itemType == ItemMasterType.Resource) this.__use(type, this.__get(type));
    }

    get(e : cc.Event.EventCustom): any {
        e.setUserData(this.__get(e.getUserData()));
    }

    __get(type: ItemEnum): any {
        switch (type) {
            case ItemEnum.GOLD:
                return UserInfo.Instance.getUserjson(UserInfoJsonKey.gold);

            case ItemEnum.ENERGY:
                return UserInfo.Instance.getUserjson(UserInfoJsonKey.energy);


            default:
                errorlog("道具类型错误：", type);
                return null;
        }
    }

    private alterProp(type: ItemEnum, value: number): boolean {
        let data = this.getItemData(type);

        if (data.itemType == ItemMasterType.Resource) {
            switch (type) {
                case ItemEnum.GOLD:
                    return this.alterGold(value);

                case ItemEnum.ENERGY:
                    return this.alterEnergy(value);

                default:
                    errorlog("道具类型错误：", type);
                    return false;
            }
        }
        else {
            EventManager.Instance.emit(EventType.ItemUse, { type: type, num: Math.abs(value) });
            return true;
        }
    }

    private alterGold(value: number): boolean {
        let lastGold: number = UserInfo.Instance.getUserjson(UserInfoJsonKey.gold);
        let nowGold = lastGold + value;

        if (value === 0 || nowGold < 0) return false;

        warnlog(`金币变化值   ${lastGold} ---->  ${nowGold}`);

        UserInfo.Instance.setUserjson(UserInfoJsonKey.gold, nowGold);

        EventManager.Instance.emit(EventType.GoldChange, value);

        return true;
    }

    private alterEnergy(value: number): boolean {
        let lastVal = this.__get(ItemEnum.ENERGY);
        let nowEnergy = lastVal + value;
        if (nowEnergy < 0) {

            return false;
        }
        warnlog(`体力变化值   ${lastVal} ---->  ${nowEnergy}`);

        UserInfo.Instance.setUserjson(UserInfoJsonKey.energy, nowEnergy);

        let info = {} as any;
        info.old = lastVal;
        info.now = nowEnergy;
        info.old < info.now ? EventManager.Instance.emit(EventType.EnergySendAdd, info)
            : EventManager.Instance.emit(EventType.EnergyDown, info);
        EventManager.Instance.emit(EventType.EnergyChange, info); //保证在add 和 down事件后派发

        return true;
    }


}
