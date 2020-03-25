import { FsmStateEnum } from "./FsmStateEnum";

export default class FsmState {

    private state : FsmStateEnum = null;
    private duration : number = 0;
    private node : cc.Node;
    private nextState : FsmStateEnum = null;

    init(node : cc.Node, state : FsmStateEnum) {
        this.node = node;
        this.state = state;
    }

    reset() : void {
        this.duration = 0;
        this.nextState = null;
    }

    enter() : void {

    }

    update(dt : number) : void {
        this.duration += dt;
    }

    exit() : void {

    }

    checkTransition() : FsmStateEnum {
        return this.nextState;
    }


}
