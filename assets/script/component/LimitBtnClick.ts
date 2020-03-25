const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu('SelfComponent/LimitBtnClick')
export default class LimitBtnClick extends cc.Component {
    onLoad () {
        this.addEvent();
    }

    addEvent() {
        this.node.on("click", this.onClick, this);
    }

    onClick() {
        let btnCom = this.node.getComponent(cc.Button);
        if(btnCom != null) {
            btnCom.interactable = false;

            this.scheduleOnce(() => {
                btnCom.interactable = true;
            }, 0.5)
        }
    }

}
