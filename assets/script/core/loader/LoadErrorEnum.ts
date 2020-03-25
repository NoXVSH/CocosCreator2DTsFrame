export enum LoadErrorEnum {
    LoadFail = "LoadFail", //加载失败
    Unloaded = "Unloaded", //已经被卸载了
    Timeout = "Timeout", //加载超时
}

window.regVar("LoadErrorEnum", LoadErrorEnum);