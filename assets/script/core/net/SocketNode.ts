import { SocketCommand } from "./SocketCommand";
import EncyptUtils from "../utils/EncyptUtils";

interface SocketListenerMapStruct {
    callback : Function;
    thisObj : any;
}

export class SocketNode {
    private listenerMap : {[key : number] : SocketListenerMapStruct} = {};
    private sendCacheMap : any = {}; //每个指令只保存最新的那一条
    private ws : WebSocket = null;

    private openCallback : Function = null;
    private closeCallBack : Function = null;
    private errorCallBack : Function = null;

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

        for(const key in this.sendCacheMap) {
            let cache = this.sendCacheMap[key];
            this.send(cache.command, cache.data);
        }

        this.sendCacheMap = {};

        this.openCallback && this.openCallback();
    }

    onClose() : void {
        log("ws连接关闭");
        this.closeCallBack && this.closeCallBack();
    }

    onError() : void {
        log("ws连接出错");
        this.errorCallBack && this.errorCallBack();
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
            warnlog("ws未连接, 消息进入发送缓存列表中");
            this.sendCacheMap[command] = {command : command, data : data};

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

    registerOpenCallBack(cb) {
        this.openCallback = cb;
    }

    registerErrorCallBack(cb) {
        this.errorCallBack = cb;
    }

    registerCloseCallBack(cb) {
        this.closeCallBack = cb;
    }
}
