import CullingListItem from "./CullingListItem";

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("SelfComponent/CullingList")
export default class CullingList extends cc.Component {

    @property(cc.Node)
    mask: cc.Node = null;

    @property(cc.Node)
    parent: cc.Node = null;

    _area: cc.Rect;

    start() : void {
        this.scheduleOnce(() => {
            let maskNode = this.node.parent;

            if (this.mask) maskNode = this.mask;
            this._area = maskNode._getSelfBoundingWorldBox();
            this.node.on('child-added', this.refreshChild, this);

            for (let i = 0, len = this.node.childrenCount; i < len; i++) {
                this.refreshChild(this.node.children[i]);
            }
        }, 0);
    }

    refreshChild(child) : void {
        let item = child.getOrAddComponent(CullingListItem) as CullingListItem;
        item.setParent(this.parent);
        item.setMask(this._area);
    }

    setMaskRect(mask, parent) : void {
        if (mask) {
            this._area = mask._getSelfBoundingWorldBox();
        }

        if (parent) {
            this.parent = parent;
        }

        for (let i = 0, len = this.node.childrenCount; i < len; i++) {
            this.refreshChild(this.node.children[i]);
        }
    }
}
