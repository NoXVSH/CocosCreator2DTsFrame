import SelectBase from "./SelectBase";

const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
@menu('selectedGroupButton/SelectedSpriteFrameButton')
export default class SelectedSpriteFrameButton extends SelectBase {
    @property(cc.Sprite)
    target: cc.Sprite = null;

    @property({
        type : cc.SpriteFrame,
        displayName : 'Normal'
    })
    normalSprite: cc.SpriteFrame = null;

    @property({
        type : cc.SpriteFrame,
        displayName : 'Checked'
    })
    checkedSprite: cc.SpriteFrame = null;

    onLoad() {
        super.onLoad();
    }

    onChangeChecked(value) {
        super.onChangeChecked(value);
        if (!this.target) return;
        if (value) {
            this.target.spriteFrame = this.checkedSprite;
        } else {
            this.target.spriteFrame = this.normalSprite;
        }
    }
}
