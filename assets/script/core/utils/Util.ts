import MyGlobal from "../../config/MyGlobal";
import AudioManager from "../audio/AudioManager";
import EventManager from "../event/EventManager";
import { EventType } from "../event/EventType";

export default class Util {
    private static _instance: Util;

    static get Instance(): Util {
        if (this._instance == null) {
            this._instance = new Util();
        }

        return this._instance;
    }

    //随机
    random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    strIsNum(str: string): boolean {
        let regPos = /^\d+(\.\d+)?$/; //非负浮点数
        let regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if (regPos.test(str) || regNeg.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    isInArray(item: any, array: any[]): boolean {
        return array.some((data, index, array) => {
            return item == data;
        });
    }

    copyArray(array: any[]): any[] {
        return array.slice();
    }

    // 从数组中挑选出count个不重复的元素
    getNoRepeatFromList(count: number, table: any[]): any[] {
        if (count <= table.length) {
            let newTable = [];
            for (let i = 0; i < table.length; i++) {
                newTable.push(table[i]);
            }
            let randomList = [];
            while (randomList.length < count) {
                let index = this.random(0, newTable.length - 1);
                randomList.push(newTable[index]);
                newTable.splice(index, 1);
            }
            return randomList;
        } else {
            log("getNoRepeatFromList: count大于table长度！！！！！");
            return table;
        }
    }

    formatGoldValue(gold: number): string {
        let unitValue = 1;
        let unitName = "";
        let isShowDot = false;

        if (gold <= 9999) {
            unitValue = 1;
            unitName = "";
            isShowDot = false;
        }
        else if (gold > 9999 && gold <= 99999) { //保留一位小数
            unitValue = 10000;
            unitName = "万";
            isShowDot = true;

        } else if (gold > 99999 && gold <= 99999999) {
            unitValue = 10000;
            unitName = "万";
            isShowDot = false;
        } else if (gold > 99999999 && gold <= 999999999) {  //保留一位小数
            unitValue = 100000000;
            unitName = "亿";
            isShowDot = true;
        }
        else {
            unitValue = 100000000;
            unitName = "亿";
            isShowDot = false;
        }

        let value = gold / unitValue;
        let result = "";

        if(isShowDot) {
            if (parseInt(value.toString()) != value) {//保留1位小数
                result = Math.floor(value * 10) / 10 + "";
            }
            else {
                result = parseInt(value.toString()) + "";
            }
        }
        else {
            result = parseInt(value.toString()) + "";
        }

        result += unitName;
        return result;
    }

    //计算source节点在target节点下的坐标系
    getNodePosInTargetNode(source: cc.Node, target: cc.Node): cc.Vec2 {
        return target.convertToNodeSpaceAR(source.convertToWorldSpaceAR(cc.v2(0, 0)));
    }

    //将节点转换成左上角为原点 (即微信原生坐标系)
    turnToLeftAxis(node: cc.Node, platformSize: any): any {
        let worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));
        let winSize = cc.winSize;

        worldPos.x -= winSize.width / 2;
        worldPos.y -= winSize.height / 2;

        let rateW = platformSize.screenWidth / winSize.width;
        let rateH = platformSize.screenHeight / winSize.height;

        let x = worldPos.x;
        let y = worldPos.y;

        x *= rateW;
        y *= rateH;

        let nodeW = node.width * rateW + 20; //稍微大一点 
        let nodeH = node.height * rateH + 20;

        x = x + platformSize.screenWidth / 2 - nodeW / 2;
        y = platformSize.screenHeight / 2 - (y + nodeH / 2);

        return { left: x, top: y, width: nodeW, height: nodeH };
    }

    isObj(data: any): boolean {
        return Object.prototype.toString.call(data) == "[object Object]";
    }

    isArray(data: any): boolean {
        return Object.prototype.toString.call(data) == "[object Array]";
    }

    getStrByLen(str: string, len: number): string {// 获取字符串相应长度的截取，中文占2个长度，非中文占1个长度
        let curlen = 0;
        let ind = 0;
        for (let i = 0; i < str.length; i++) {
            let s = str[i];
            if (s.match(/[\u4e00-\u9fa5]/g)) {
                curlen += 2;
            } else {
                curlen += 1;
            }
            if (curlen >= len) {
                ind = i;
                break;
            }
        }
        if (ind === 0 || ind === str.length - 1) {
            return str;
        } else {
            return str.substring(0, ind + 1) + "...";
        }
    }

    compareVersion(v1: string, v2: string): number {
        let arr1 = v1.split('.');
        let arr2 = v2.split('.');
        const len = Math.max(arr1.length, arr2.length);

        while (arr1.length < len) {
            arr1.push('0')
        }
        while (arr2.length < len) {
            arr2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(arr1[i]);
            const num2 = parseInt(arr2[i]);

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }

        return 0;
    }

    replaceStrBySign(str, arr) {
        for(let i = 0, len = arr.length; i < len; i++) {
            str = str.replace("{" + i + "}", arr[i])
        }

        return str;
    }

}

window.regVar("Util", Util);


//日志输出, 同时打印出调用栈, 请用log 取代其他日志输出方法
let getstack = function () {
    let e = new Error();
    let lines = e.stack.split("\n");

    lines.shift(); //Error
    lines.shift(); //getstack
    if (true) {
        lines.shift(); //window.log
        return {
            stack: lines
        };
    } else {
        lines[0] = ""; //window.log
        return lines.join("\n");
    }
};

let getTimeStr = function () {
    let date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
};


let log = function (...args) {
    cc.log(cc.director.getTotalFrames().toString(), getTimeStr(), ...args, "         ", getstack());
};
window.regVar("log", log);

let consolelog = function (...args) {
    console.log(cc.director.getTotalFrames().toString(), getTimeStr(), ...args, "         ", getstack());
};
window.regVar("consolelog", consolelog);

let warnlog = function (...args) {
    cc.warn(getTimeStr(), ...args, "     ", getstack());
};
window.regVar("warnlog", warnlog);

let errorlog = function (...args) {
    cc.error(getTimeStr(), ...args, "     ", getstack());
};
window.regVar("errorlog", errorlog);


//节点添加组件（如果有则返回，没有则添加）
let getOrAddComponent = function (component) {
    let ret = this.getComponent(component);
    if (ret == null) {
        ret = this.addComponent(component);
    }
    return ret;
};
(<any>cc.Component.prototype).getOrAddComponent = getOrAddComponent;
cc.Node.prototype.getOrAddComponent = getOrAddComponent;

(<any>cc.Button.prototype)._onTouchBegan = function (event) {
    if (!this.interactable || !this.enabledInHierarchy) return;

    if(!MyGlobal.Instance.canClickBtn()) return;

    MyGlobal.Instance.setClickTime(Date.now());
    this._pressed = true;
    this._updateState();
    event.stopPropagation();
};

(<any>cc.Button.prototype)._onTouchEnded = function (event) {
    if (!this.interactable || !this.enabledInHierarchy) return;

    if (this._pressed) {
        if (MyGlobal.Instance.getHaveSound()) {
            EventManager.Instance.emit(EventType.BtnClick);
        }
        cc.Component.EventHandler.emitEvents(this.clickEvents, event);
        this.node.emit('click', this, event);
    }
    this._pressed = false;
    this._updateState();
    event && event.stopPropagation();
};

//返回节点在世界坐标系下的对齐轴向的包围盒（AABB）。
//该边框仅仅仅仅仅仅仅仅仅仅仅仅仅包含自身的世界边框(不包含子节点!!!!!!!!!!)。
let _getSelfBoundingWorldBox = function () {
    if (this._parent) {
        this._parent._updateWorldMatrix();
        this._updateLocalMatrix();

        let parentMat = this._parent._worldMatrix;
        let width = this._contentSize.width;
        let height = this._contentSize.height;
        let rect = cc.rect(-this._anchorPoint.x * width, -this._anchorPoint.y * height,
            width,
            height);

        parentMat = (<any>cc).vmath.mat4.mul(this._worldMatrix, parentMat, this._matrix);
        rect.transformMat4(rect, parentMat);

        return rect;
    } else {
        return this.getBoundingBox();
    }
}
cc.Node.prototype._getSelfBoundingWorldBox = _getSelfBoundingWorldBox;

!Object.values && (Object.values = function (object) {
    let array = [];

    if(!object) return array;

    for(let key in object) {
        array.push(object[key]);
    }

    return array;
});

cc.RenderTexture.prototype.readPixels = function(data, x, y, w, h) { //移植2.0.10代码 2.1.4无法读取
    if (!this._framebuffer || !this._texture) return data;

    x = x || 0;
    y = y || 0;
    let width = w || this.width;
    let height = h || this.height
    data = data  || new Uint8Array(width * height * 4);

    let gl = (<any>cc).renderer._forward._device._gl;
    let oldFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer._glID);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture._glID, 0);
    gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, oldFBO);

    return data;
}
