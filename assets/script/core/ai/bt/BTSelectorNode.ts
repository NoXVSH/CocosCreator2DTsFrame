import BTNode from "./BTNode";
import { BTStatus } from "./enum/BTStatus";

export default class BTSelectorNode extends BTNode {
    private runningIndex : number = 0

    onUpdate(agent : any, dt : number, dataRecord : any) : BTStatus {
        if(this.children.length == 0) return BTStatus.success;

        let child = this.children[this.runningIndex];
        let status = child.update(agent, dt, dataRecord);

        if(status == BTStatus.fail) {
            this.runningIndex++;
            child.reset(agent, dt, dataRecord);
            if(this.runningIndex == this.children.length) return BTStatus.fail;
            return BTStatus.running;
        }
        else {
            return status;
        }
    }

    onReset(agent : any, dt : number, dataRecord : any) : void {
        if(this.runningIndex >= 0 && this.runningIndex < this.children.length) {
            this.children[this.runningIndex].reset(agent, dt, dataRecord);
        }
        this.runningIndex = 0;
    }
}
