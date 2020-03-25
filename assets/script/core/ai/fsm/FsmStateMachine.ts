import FsmState from "./FsmState";
import { FsmStateEnum } from "./FsmStateEnum";

export default class FsmStateMachine {
    private fsmStateMap : {[key : string] : FsmState} = {};
    private state : FsmStateEnum = null;
    private currentState : FsmState = null;
    private dataRecord : any = null;

    init() : void {
        this.fsmStateMap = {};
        this.state = null;
        this.currentState = null;
    }

    setDataRecord(dataRecord : any) : void {
        this.dataRecord = dataRecord;
    }

    addState(key : FsmStateEnum, state : FsmState) : void {
        this.fsmStateMap[key] = state;
    }

    clear() : void {
        this.currentState && this.currentState.exit();
        this.state = null;
        this.currentState = null;
    }

    setState(state : FsmStateEnum) : void {
        if(this.currentState != null) {
            this.currentState.exit();
        }

        // log(this.state + "--------->" + state);

        this.state = state;
        this.currentState = this.getFsmState(state);
        this.currentState.reset();
        this.currentState.enter();

        
    }

    getState() : FsmStateEnum {
        return this.state;
    }

    getFsmState(state) : FsmState {
        return this.fsmStateMap[state];
    }

    update(dt : number) : void { 
        let state = this.currentState.checkTransition();
        if(state != null) {
            this.setState(state);
        }

        state = this.currentState.checkTransition();
        if(state != null) {
            this.setState(state);
        }

        this.currentState.update(dt);

        state = this.currentState.checkTransition();
        if(state != null) {
            this.setState(state);
        }
    }

}
