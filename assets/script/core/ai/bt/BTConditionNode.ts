import BTNode from "./BTNode";
import { BTStatus } from "./enum/BTStatus";

export default class BTConditionNode extends BTNode {
    onUpdate(agent : any, dt : number, dataRecord : any) : BTStatus {
        let isTrue = this.isTrue(agent, dt, dataRecord);
        let status = isTrue ? BTStatus.success : BTStatus.fail;
        return status;
    }

    onReset(agent : any, dt : number, dataRecord : any) : void {

    }

    //子类重写
    isTrue(agent : any, dt : number, dataRecord : any) : boolean {
        return true;
    }

}
