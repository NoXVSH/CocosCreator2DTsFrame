let LoaderConst = {
    RetryCount : 3,  //加载失败重试次数
    LoadTimeOut : 30, //加载等待时间,超过该值超时处理, 单位秒
    MaxLoadingCount : 6, //排队加载 允许的最大同时请求数量
    ReleaseWaitTime : 3 * 60, //资源上次加载时间与卸载时间作对比, 若时间超过该值, 才真正卸载  单位秒
    UIUnloadWaitTime : 3 * 60, //一个界面超过多少时间后没使用 将会被销毁 释放  单位秒
}

export default LoaderConst;