import BTNode from "./BTNode";
import { BTActionStatus } from "./enum/BTActionStatus";
import { BTStatus } from "./enum/BTStatus";

export default class BTActionNode extends BTNode {
    private runningStatus : BTActionStatus = BTActionStatus.ready;
    protected duration : number = 0;

    onUpdate(agent : any, dt : number, dataRecord : any) : BTStatus {
        let status : BTStatus = null;

        if(this.runningStatus == BTActionStatus.ready) {
            this.onEnter(agent, dt, dataRecord);
            this.runningStatus = BTActionStatus.running;
        }

        if(this.runningStatus == BTActionStatus.running) {
            status = this.onExecute(agent, dt, dataRecord);
        }

        this.duration += dt;
        return status;
    }

    onReset(agent : any, dt : number, dataRecord : any) {
        if(this.runningStatus == BTActionStatus.running) {
            this.onExit(agent, dt, dataRecord);    
        }

        this.runningStatus = BTActionStatus.ready;
        this.duration = 0;
    }

    //子类重写
    onEnter(agent, dt, dataRecord) {

    }

    //子类重写
    onExecute(agent, dt, dataRecord) : BTStatus {
        return null;
    }

    //子类重写
    onExit(agent, dt, dataRecord) {

    }

}
