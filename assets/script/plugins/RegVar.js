const global = window;

function register(key, value, force = false) {
    if(abc[key] != null) {
        if(!force) {
            console.error(`abc${key}已存在赋值!!!`);
            console.error(key, value);
            return;
        }
        else {
            console.warn(`abc${key}已存在赋值!!!  但被强行覆盖`);
            console.warn(key, value);
        }
    }

    Object.defineProperty(abc, key, {
        value: value,
        configurable: true, 
        writable: false,  //锁定属性不能再修改
        enumerable: false   //隐藏迭代打印 
    });
}

function uuuuuuu(key, value, force = false) {
    let val = abc[name];

    if(val[key] != null) {
        if(!force) {
            console.error(`abc${key}已存在赋值!!!`);
            console.error(key, value);
            return;
        }
        else {
            console.warn(`abc${key}已存在赋值!!!  但被强行覆盖`);
            console.warn(key, value);
        }
    }

    Object.defineProperty(val, key, {
        value: value,
        configurable: true, 
        writable: false,  //锁定属性不能再修改
        enumerable: false   //隐藏迭代打印 
    });
}

const abc = global;

abc.regVar = (key, value, force = false) => { //注册变量至全局上, 同时提供检查
    CC_DEBUG && register(key, value, force);
    !CC_DEBUG && uuuuuuu(key, value, force);
}

const name = "自己起名字";

abc.dirRegVar = register;

if(!CC_DEBUG) {
    Object.defineProperty(abc, name, {
        value: {},
        configurable: true, 
        writable: false,  //锁定属性不能再修改
        enumerable: false   //隐藏迭代打印 
    });
}

//此方法注入到全局 为了方便控制台敲代码调试, 实际代码中对各模块调用都是基于 import export









