import BTNode from "./BTNode";
import { BTStatus } from "./enum/BTStatus";

export default class BTSequenceNode extends BTNode {
    private runningIndex: number = 0;

    onUpdate(agent: any, dt: number, dataRecord: any): BTStatus {
        if (this.children.length == 0) return BTStatus.success;

        let child = null;
        let status = null;

        child = this.children[this.runningIndex];
        status = child.update(agent, dt, dataRecord);

        if (status == BTStatus.fail) {
            return status;
        }
        else if (status == BTStatus.success) {
            this.runningIndex++;
            if (this.runningIndex == this.children.length) {
                return BTStatus.success;
            }
            else {
                return BTStatus.running;
            }
        }
        else {
            return status;
        }

    }

    onReset(agent: any, dt: number, dataRecord: any) {
        let child = null;
        for (let i = 0, len = this.children.length; i < len; i++) {
            child = this.children[i];
            child.reset(agent, dt, dataRecord);
        }

        this.runningIndex = 0;
    }

}
