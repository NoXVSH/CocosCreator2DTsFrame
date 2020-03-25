import { BTStatus } from "./enum/BTStatus";

export default class BTNode {
    private parent: BTNode = null;
    protected children: BTNode[] = [];

    addChild(...args : BTNode[]) : BTNode {
        let node : BTNode = null;
        for (let i = 0, len = args.length; i < len; i++) {
            node = args[i];
            node.setParent(this);
            this.children.push(node);
        }

        return this;
    }

    update(agent : any, dt : number, dataRecord : any) : BTStatus {
        return this.onUpdate(agent, dt, dataRecord);
    }

    reset(agent : any, dt : number, dataRecord : any) {
        this.onReset(agent, dt, dataRecord);
    }

    //子类重写
    onUpdate(agent : any, dt : number, dataRecord : any) : BTStatus {
        return null;
    }

    //子类重写
    onReset(agent : any, dt : number, dataRecord : any) {

    }

    setParent(parent) {
        this.parent = parent;
    }

    getParent() {
        return this.parent;
    }
}
