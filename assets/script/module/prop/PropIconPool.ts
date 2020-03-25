import {PropEnum} from "./PropEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PropIconPool extends cc.Component {

    @property(cc.SpriteFrame)
    iconSmall: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    iconBig: cc.SpriteFrame[] = [];


    getIconSmall(propId: PropEnum): cc.SpriteFrame {
        return this.iconSmall[propId];
    }

    getIconBig(propId: PropEnum): cc.SpriteFrame {
        return this.iconBig[propId];
    }
}
