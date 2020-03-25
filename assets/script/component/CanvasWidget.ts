const {ccclass, property} = cc._decorator;

@ccclass
export default class CanvasWidget extends cc.Component {

    onLoad () {
        (<any>cc.view).on("canvas-resize", this.check, this);
        this.check();
    }

    check() {
        let size = cc.winSize;

        let rate = size.height / size.width;
        let canvas = this.getComponent(cc.Canvas);

        if(rate < 16 / 9) {
            canvas.fitHeight = canvas.fitWidth = true;
        }
        else {
            canvas.fitHeight = false;
        }
    }

}


