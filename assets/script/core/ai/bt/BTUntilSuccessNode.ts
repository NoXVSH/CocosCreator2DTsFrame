import BTNode from "./BTNode";
import { BTStatus } from "./enum/BTStatus";

export default class BTUntilSuccessNode extends BTNode {
    onUpdate(agent : any, dt : number, dataRecord : any) : BTStatus {
        let status = this.children[0].update(agent, dt, dataRecord);

        if(status != BTStatus.success) {
            return BTStatus.running;
        }
        else {
            return BTStatus.success;
        }
    }

    onReset(agent : any, dt : number, dataRecord : any) : void {
        this.children[0].reset(agent, dt, dataRecord);
    }
}
