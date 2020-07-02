import BaseView from "./BaseView";
const { ccclass, property } = cc._decorator;

@ccclass
export default class MainView extends BaseView {
    isOpenAniming: boolean;
    isCloseAniming: boolean;

    openAnim() {

    }

    closeAnim(cb: Function) {
        cb && cb();
    }



}
