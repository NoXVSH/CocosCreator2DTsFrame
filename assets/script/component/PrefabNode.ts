const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu('SelfComponent/PrefabNode')
export default class PrefabNode extends cc.Component {
    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    @property(cc.Boolean)
    createToChild: boolean = true;

    @property(cc.Boolean)
    isDelayChange: boolean = false;

    @property(cc.Integer)
    delayTime: number = 0.0;
    
    
    onLoad() {
        if(this.isDelayChange) {
            this.scheduleOnce(this.create, this.delayTime);
        }
        else this.create();
    }

    create() {
        let node = cc.instantiate(this.prefab);
        if (this.createToChild)
            this.node.addChild(node);
        else {
            node.x = this.node.x;
            node.y = this.node.y;
            this.node.parent.insertChild(node, this.node.getSiblingIndex());
        }
    }

}
