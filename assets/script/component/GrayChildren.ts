const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("SelfComponent/GrayChildren")
export default class GrayChildren extends cc.Component {
    @property({
        type : [cc.Node],
        tooltip: "排除列表（设置置灰时，会忽略此列表内的Node）",
    })
    exclude: cc.Node[] = [];

    @property({
        type : [cc.Node],
        tooltip: "指定置灰的对象列表（未指定任何对象时，默认为除exclude以外的所有Node）",
    })
    assignNodes: cc.Node[] = [];

    _childrens: cc.Node[];

    onLoad() : void {
    }

    gatherAllNode() : void {
        if (this._childrens != null) return;
        if (this.assignNodes.length > 0) {
            this._childrens = this.assignNodes;
            return;
        }
        this._childrens = this.getChildrenByNode(this.node, []);
    }

    getChildrenByNode(node, list) : cc.Node[] {
        if (this.exclude.indexOf(node) >= 0) {
            return;
        }
        list.push(node);
        for (let i = node.childrenCount - 1; i >= 0; i--) {
            let child = node.children[i];
            this.getChildrenByNode(child, list);
        }
        return list;
    }

    setGray(isGray) : void {
        this.gatherAllNode();
        for (let i = 0, len = this._childrens.length; i < len; i++) {
            let node = this._childrens[i];
            let sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                let material = null;
                if(isGray) material = (<any>cc.Material).getInstantiatedBuiltinMaterial("2d-gray-sprite", sprite);
                else material = (<any>cc.Material).getInstantiatedBuiltinMaterial("2d-sprite", sprite);

                sprite.setMaterial(0, material);
                sprite._activateMaterial();
            }
        }
    }
}

