import { SocketNode } from "./SocketNode";
import { SocketCommand } from "./SocketCommand";

export default class SocketManagerBase {

    private _socketNode : SocketNode = null;

    constructor() {
        this._socketNode = new SocketNode();
    }

    connnect(url : string) : void {
        this._socketNode.connnect(url);
    }
    
    addEvent(command : SocketCommand, callback : Function, thisObj) : void {
        this._socketNode.addEvent(command, callback, thisObj);
    }

    send(command : SocketCommand, data : any) : void {
        this._socketNode.send(command, data);
    }

    close() : void {
        this._socketNode.close();
    }

    getIsConnect() : boolean {
        return this._socketNode.getIsConnect();
    }

    getIsConnectting() : boolean {
        return this._socketNode.getIsConnectting();
    }

    registerOpenCallBack(cb) {
        this._socketNode.registerOpenCallBack(cb);
    }

    registerErrorCallBack(cb) {
        this._socketNode.registerErrorCallBack(cb);
    }

    registerCloseCallBack(cb) {
        this._socketNode.registerCloseCallBack(cb);
    }
    



}
