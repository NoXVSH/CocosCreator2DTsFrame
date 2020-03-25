//最先被cocos require 最先执行
window.regVar = (key, value, force = false) => { //注册变量至全局上, 同时提供检查
    if(window[key] != null) {
        if(!force) {
            console.error(`window中${key}已存在赋值!!!`);
            console.error(key, value);
            return;
        }
        else {
            console.warn(`window中${key}已存在赋值!!!  但被强行覆盖`);
            console.warn(key, value);
        }
    }

    Object.defineProperty(window, key, {
        value: value,
        configurable: true, 
        writable: false,  //锁定属性不能再修改
        enumerable: false   //隐藏迭代打印 
    });
}

//此方法注入到全局 为了方便控制台敲代码调试, 实际代码中对各模块调用都是基于 import export









