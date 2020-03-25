import SelectBase from "./SelectBase";

const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
@menu('selectedGroupButton/SelectedButton')
export default class SelectedButton extends SelectBase {
    _button: cc.Button;

    onLoad() {
        this._button = this.node.getComponent(cc.Button);
        super.onLoad();
    }

    onChangeChecked(value) {
        super.onChangeChecked(value);
        if(this._button) this._button.interactable = !value;
        if (value) {

        } else {

        }
    }
}
