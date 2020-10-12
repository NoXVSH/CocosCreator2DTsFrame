let LoaderConst = {
    RetryCount : 3,  //加载失败重试次数
    LoadTimeOut : 30, //加载等待时间,超过该值超时处理, 单位秒
    MaxLoadingCount : 6, //排队加载 允许的最大同时请求数量
    UIUnloadWaitTime : 3 * 60, //一个界面超过多少时间后没使用 将会被销毁 释放  单位秒
}

export enum BundleName {
    LocalRes = "resources",
    RemoteRes = "remoteres",
}

export default LoaderConst;