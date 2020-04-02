import BaseConfig from "../config/BaseConfig";

let md5 = require("../utils/Md5");

let key = "!@#$%(12345)";

let formatData = function (data) {
    let arr =[];
    for (let k in data) {
        let kv = `${k}${data[k]}&`;
        arr.push(kv);
    }
    arr.sort();
    let kvstr = key
    arr.forEach(element => {
        kvstr = kvstr + element;
    });
    let sign = md5.hex_md5(kvstr)
    // log(kvstr + '[签名] == '+sign);
    data.sign = sign;

    //--------------------
    let str = "?";
    for (let k in data) {
        if (str != "?") {
            str += "&";
        }
        str += k + "=" + data[k];
    }
    return str;
};

interface HttpResultStruct {
    errcode : number;
    errmsg : string;
    text : string;
}

export class HttpManager {
    private static _instance : HttpManager;

    static get Instance() : HttpManager {
        if(this._instance == null) {
            this._instance = new HttpManager();
        }

        return this._instance;
    }

    private url : string = null;

    init() {
        this.url = BaseConfig.Instance.getServerUrl();
        if (!this.url) errorlog("服务器地址为空！！！！！！！！！！");
    }

    getPromise(path : string, data : any, serverUrl? : string) : Promise<any> {
        let p = new Promise((resolve, reject) => {
            this.get(path, data, resolve, serverUrl);
        });
        return p;
    }

    getFilePromise(fileName : string) : Promise<any> {
        let p = new Promise((resolve, reject) => {
            this.getFile(fileName, resolve);
        });
        return p;
    }

    getWithHeaderPromise(path : string, data : any) : Promise<any> {
        let p = new Promise((resolve, reject) => {
            this.getWithHeader(path, data, resolve);
        });
        return p;
    }

    postPromise(path : string, data : any, serverUrl? : string) {
        let p = new Promise((resolve, reject) => {
            this.post(path, data, resolve, serverUrl);
        });
        return p;
    }

    requestPromise(requestURL : string,) {
        let p = new Promise((resolve, reject) => {
            this.request(requestURL, resolve);
        });
        return p;
    }

    requestTextPromise(requestURL: string) {
        let p = new Promise((resolve, reject) => {
            this.requestText(requestURL, resolve);
        });
        return p;
    }

    get(path : string, data : any, handler : Function, serverUrl? : string) : XMLHttpRequest {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        let str = formatData(data);
        let requestURL = serverUrl == null? this.url + path + encodeURI(str) : serverUrl + path + encodeURI(str);
        log("Get URL:" + requestURL);
        xhr.open("GET",requestURL, true);
        if (cc.sys.isNative){
            xhr.setRequestHeader("Accept-Encoding","gzip,deflate");
        }            
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    log("Http Get返回 ： " + xhr.responseText);
                    try {
                        let ret = JSON.parse(xhr.responseText);
                        if (handler) {
                            handler(ret);
                        }
                    } catch (e) {
                        errorlog("http get解析失败!!!!! err:" + e, path);
                    }
                }
            }
        };

        xhr.ontimeout = function (event) {
            errorlog("请求超时!!!------", path, event);
            let result = {} as HttpResultStruct;
            result.errcode = -3;
            result.errmsg = 'XMLHttpRequest timeout';
            handler(result);
        };

        xhr.onerror = function (event) {
            errorlog("请求错误!!!------", path, event);
            let result = {} as HttpResultStruct;
            result.errcode = -4;
            result.errmsg = 'XMLHttpRequest error';
            handler(result);
        };
        
        xhr.send();
        return xhr;
    }

    getFile(fileName : string, callback : Function) : XMLHttpRequest {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;

        let requestURL = this.url + "file/" + fileName;
        log("Get FILE URL:" + requestURL);
        xhr.open("GET", requestURL, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // log("Http Get返回 ： " + xhr.responseText);
                    let text = xhr.responseText;
                    callback && callback(text, true);
                }
            }
        };

        xhr.ontimeout = function (event) {
            errorlog("请求超时!!!------file", fileName, event);
            callback && callback(null, false);
        };

        xhr.onerror = function (event) {
            errorlog("请求错误!!!------file", fileName, event);
            callback && callback(null, false);
        };

        xhr.send();
        return xhr;
    }

    getWithHeader(path : string, data : any, handler : Function) : XMLHttpRequest {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        let requestURL = this.url + path;
        xhr.open("GET", requestURL, true);
        for (let k in data) {
            xhr.setRequestHeader(k + '', data[k] + '');
        }
        log("GetWithHeader==+   "+requestURL);
        log(data);
        xhr.onreadystatechange = function () {
            // log("xhr.readyState==  "+xhr.readyState);
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300){
                    log("Http Get返回 ： " + xhr.responseText);
                    try {
                        let ret = JSON.parse(xhr.responseText);
                        if (handler) {
                            handler(ret);
                        }
                    } catch (e) {
                        errorlog("http getWithHeader解析失败!!!!! err:" + e);
                    }
                }   
            }
           
        };

        xhr.ontimeout = function (event) {
            errorlog("请求超时!!!------", path, event);
            let result = {} as HttpResultStruct;
            result.errcode = -3;
            result.errmsg = 'XMLHttpRequest timeout';
            handler(result);
        };

        xhr.onerror = function (event) {
            errorlog("请求错误!!!------", path, event);
            let result = {} as HttpResultStruct;
            result.errcode = -4;
            result.errmsg = 'XMLHttpRequest error';
            handler(result);
        };
        
        xhr.send();
        return xhr;
    }

    post(path : string, data : any, handler : Function, serverUrl? : string) : XMLHttpRequest {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        let requestURL = serverUrl == null? this.url + path : serverUrl + path;
        log("Post URL:" + requestURL);
        xhr.open("POST", requestURL, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                log("Http Post返回 ： " + xhr.responseText);
                try {
                    let ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        handler(ret);
                    }
                } catch (e) {
                    log("err:" + e);
                }
            }
        };

        xhr.ontimeout = function (event) {
            errorlog("请求超时!!!------", requestURL, event);
            let result = {} as HttpResultStruct;
            result.errcode = -3;
            result.errmsg = 'XMLHttpRequest timeout';
            handler(result);
        };

        xhr.onerror = function (event) {
            errorlog("请求错误!!!------", requestURL, event);
            let result = {} as HttpResultStruct;
            result.errcode = -4;
            result.errmsg = 'XMLHttpRequest error';
            handler(result);
        };

        xhr.send(JSON.stringify(data));
        return xhr;
        
    }
    
    request(requestURL : string, handler : Function) : XMLHttpRequest {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        log("Get URL ========= " + requestURL);
        xhr.open("GET", requestURL, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    log("Http Get返回 ： " + xhr.responseText);
                    try {
                        let ret = JSON.parse(xhr.responseText);
                        if (handler) {
                            handler(ret);
                        }
                    } catch (e) {
                        errorlog("http request解析失败!!!!! err:" + e);
                    }
                }
            }
        };

        xhr.ontimeout = function (event) {
            errorlog("请求超时!!!------", requestURL, event);
            let result = {} as HttpResultStruct;
            result.errcode = -3;
            result.errmsg = 'XMLHttpRequest timeout';
            handler(result);
        };

        xhr.onerror = function (event) {
            errorlog("请求错误!!!------", requestURL, event);
            let result = {} as HttpResultStruct;
            result.errcode = -4;
            result.errmsg = 'XMLHttpRequest error';
            handler(result);
        };

        xhr.send();
        return xhr;
    }

    requestText(requestURL : string, handler : Function) : XMLHttpRequest {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        log("Get URL ========= " + requestURL);
        xhr.open("GET", requestURL, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // log("Http Get返回 ： " + xhr.responseText);
                    let result = {} as HttpResultStruct;
                    result.errcode = 0;
                    result.text = xhr.responseText;
                    handler && handler(result);
                }
                else {
                    // errorlog("http requestText失败!!!!!  xhr.status =", xhr.status, requestURL);
                    // let result = {};
                    // result.errcode = -2;
                    // result.errmsg = 'XMLHttpRequest Error';
                    // handler(result)
                }
            }
        };

        xhr.ontimeout = function (event) {
            errorlog("请求超时!!!------", requestURL, event);
            let result = {} as HttpResultStruct;
            result.errcode = -3;
            result.errmsg = 'XMLHttpRequest timeout';
            handler(result);
        };

        xhr.onerror = function (event) {
            errorlog("请求错误!!!------", requestURL, event);
            let result = {} as HttpResultStruct;
            result.errcode = -4;
            result.errmsg = 'XMLHttpRequest error';
            handler(result);
        };

        xhr.send();
        return xhr;
    }


}

window.regVar("HttpManager", HttpManager);