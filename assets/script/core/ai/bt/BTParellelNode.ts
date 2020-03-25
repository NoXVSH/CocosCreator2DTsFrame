import BTNode from "./BTNode"
import { BTStatus } from "./enum/BTStatus";

export default class BTParellelNode extends BTNode {
    private statusRecord : BTStatus[] = [];
    private successCount : number = 0;
    private failCount : number = 0;
    private maxSuccess : number = -1;

    onUpdate(agent : any, dt : number, dataRecord : any) : BTStatus {
        let len = this.children.length;
        let child = null;
        let status = null;


        let maxSuccess = this.maxSuccess; 
        if (maxSuccess < 0) maxSuccess = len; //默认全部success 才返回success
        if (maxSuccess > len) maxSuccess = len;


        if (len == 0) return BTStatus.success;

        for (let i = 0; i < len; i++) {
            child = this.children[i];

            if (this.statusRecord[i] == null || this.statusRecord[i] == BTStatus.running) {
                status = child.update(agent, dt, dataRecord);

                this.statusRecord[i] = status;

                if (status == BTStatus.success) {
                    this.successCount++;

                    if (this.successCount == this.maxSuccess) return BTStatus.success;
                }
                else if (status == BTStatus.fail) {
                    this.failCount++;
                    return BTStatus.fail;
                }
            }

        }

        return BTStatus.running;
    }

    onReset(agent : any, dt : number, dataRecord : any) : void {
        let child = null;
        for (let i = 0, len = this.children.length; i < len; i++) {
            child = this.children[i];
            child.reset(agent, dt, dataRecord);
        }

        this.statusRecord = [];
        this.successCount = 0;
        this.failCount = 0;
    }

    setMaxSuccess(value : number) : BTParellelNode {
        this.maxSuccess = value;
        return this;
    }

}
