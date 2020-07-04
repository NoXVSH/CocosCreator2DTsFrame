import { ItemEnum } from "./ItemEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemIconPool extends cc.Component {

    @property(cc.SpriteFrame)
    iconSmall: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    iconBig: cc.SpriteFrame[] = [];


    getIconSmall(itemId: ItemEnum): cc.SpriteFrame {
        return this.iconSmall[itemId];
    }

    getIconBig(itemId: ItemEnum): cc.SpriteFrame {
        return this.iconBig[itemId];
    }
}
