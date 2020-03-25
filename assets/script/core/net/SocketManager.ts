import { SocketCommand } from "./SocketCommand";
import EncyptUtils from "../utils/EncyptUtils";

interface SocketListenerMapStruct {
    callback : Function;
    thisObj : any;
}

export class SocketManager {
    private static _instance : SocketManager;

    static get Instance() : SocketManager {
        if(this._instance == null) {
            this._instance = new SocketManager();
        }

        return this._instance;
    }

    private listenerMap : {[key : number] : SocketListenerMapStruct} = {};
    private ws : WebSocket = null;

    connnect(url : string) : void {
        if(this.getIsConnectting()) {
            errorlog("ws正在连接中!!!");
        }

        if(this.getIsConnect()) {
            errorlog("ws已连接!!!");
        }

        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }
    
    addEvent(command : SocketCommand, callback : Function, thisObj) : void {
        if(this.listenerMap[command]) {
            errorlog(command + "指令已经注册过事件了!!!");
            return;
        }

        let info = {} as SocketListenerMapStruct;
        info.callback = callback;
        info.thisObj = thisObj;

        this.listenerMap[command] = info;
    }

    onOpen() : void {
        log("ws连接成功");
    }

    onClose() : void {
        log("ws连接关闭");
        this.close();
    }

    onError() : void {
        log("ws连接出错");
        this.close();
    }

    send(command : SocketCommand, data : any) : void {
        if(this.getIsConnect()) {
            let str = JSON.stringify(data);
            str =  EncyptUtils.Instance.utf16ToUtf8(str);
            let buffer = new ArrayBuffer(str.length + 4);
            let dataview = new DataView(buffer);
            dataview.setUint32(0, command);

            for (let i = 0; i < str.length; i++) {
                dataview.setUint8(i + 4, str.charCodeAt(i));
            }
            this.ws.send(dataview.buffer);

            log("send   ", command, "    ", data);
        }
        else {
            errorlog("ws未连接, 发送失败");
        }

    }

    onMessage(e : any) : void {
        let buffer = e.data;
        let dataview = new DataView(buffer);

        let command = dataview.getUint32(0);
        let message = "";

        for(let i = 0, len = dataview.byteLength - 4; i < len; i++) {
            message += String.fromCharCode(dataview.getUint8(i + 4));
        }

        message = EncyptUtils.Instance.utf8ToUtf16(message);

        let info = this.listenerMap[command];
        if(info!= null) {
            info.callback.call(info.thisObj, JSON.parse(message));
        }
        else {
            errorlog("未监听" + command + "指令, 却收到该指令信息");
        }

        log("receive", command, "    ", message);
    }

    close() : void {
        if(this.ws != null) {
            this.ws.readyState == WebSocket.OPEN && this.ws.close();
            this.ws.onopen = null;
            this.ws.onclose = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws = null;
        }
    }

    getIsConnect() : boolean {
        return this.ws != null && this.ws.readyState == WebSocket.OPEN;
    }

    getIsConnectting() : boolean {
        return this.ws != null && this.ws.readyState == WebSocket.CONNECTING;
    }
}

window.regVar("SocketManager", SocketManager);