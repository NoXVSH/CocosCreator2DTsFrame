import { BTStatus } from "./enum/BTStatus";
import BTNode from "./BTNode";

export default class BTRunner {

    private static openLog: false;

    static run(root : BTNode, agent : any, dt : number, dataRecord : any) : void {
        let status = root.update(agent, dt, dataRecord);
        if (status != BTStatus.running) {
            root.reset(agent, dt, dataRecord);
        }
    }

    static log(...args) : void {
        this.openLog && log(...args);
    }

}
