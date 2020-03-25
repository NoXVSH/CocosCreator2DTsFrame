import SelectBase from "./SelectBase";

const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
@menu('selectedGroupButton/SelectedNodeButton')
export default class SelectedNodeButton extends SelectBase {
    @property(cc.Node)
    targetChecked: cc.Node = null;
    
    @property(cc.Node)
    targetNormal: cc.Node = null;

    onLoad() {
        super.onLoad();
    }

    onChangeChecked(value) {
        super.onChangeChecked(value);
        if (this.targetChecked) this.targetChecked.active = value;
        if (this.targetNormal) this.targetNormal.active = !value;
    }
}
