import SelectedSpriteFrameButton from "./SelectedSpriteFrameButton";

const {menu, ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
@menu('selectedGroupButton/SelectedFrameAndNodeButton')
export default class SelectedFrameAndNodeButton extends SelectedSpriteFrameButton {
    @property(cc.Node)
    targetCheckedNode: cc.Node = null;

    @property(cc.Node)
    targetNormalNode: cc.Node = null;

    onLoad() {
        super.onLoad();
    }

    onChangeChecked(value) {
        super.onChangeChecked(value);
        if (this.targetCheckedNode) this.targetCheckedNode.active = value;
        if (this.targetNormalNode) this.targetNormalNode.active = !value;
    }
}
