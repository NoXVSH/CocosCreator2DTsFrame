export enum EventType {
    //loading使用
    SetLoading = "SetLoading",
    LoadingOpen = "LoadingOpen",
    LoadingClose = "LoadingClose",

    MemoryDanger = "MemoryDanger",

    AppStart = "AppStart",
    BeforeEnterHome = "BeforeEnterHome",  //进入主界面前的时机, 进行配置表数据初始化
    FirstEnterHome = "FirstEnterHome",

    BtnClick = "BtnClick",
    AudioSettingChange = "AudioSettingChange",

    // 每秒时间戳更新
    GetNowTimesStamp = "GetNowTimesStamp",
    TimestampUpdate = "TimestampUpdate",
    NowDay = "NowDay",
    // 新的一天
    NewDay = "NewDay",
    LoginSuccess = "LoginSuccess", //登陆成功

    ConfigLoadComplete = "ConfigLoadComplete",
    GameConfigQueryComplete = "GameConfigQueryComplete",

    UIChange = "UIChange",
    UIOpen = "UIOpen",
    UIClose = "UIClose",
    TipShow = "TipShow",
    WatchVideoCountChange = "WatchVideoCountChange",
    GameOnShow = "GameOnShow",
    GameOnHide = "GameOnHide",
    RefreshShareOrVideoBtn = "RefreshShareOrVideoBtn",
    EnterFromFloatWindow = "EnterFromFloatWindow",

    GoldChange = "GoldChange",

    EnergySendAdd = "EnergySendAdd",
    EnergyDown = "EnergyDown",
    EnergyChange = "EnergyChange",


    ShowGlobalBlock = "ShowGlobalBlock", //全局遮挡, 屏蔽触摸用户输入
    HideGlobalBlock = "HideGlobalBlock",

    //道具使用
    ItemUse = "ItemUse",
    AddItem = "AddProp",
    UseItem = "UseProp",
    GetItem = "GetProp",
    ClearItem = "ClearProp",

    PlatformUserInfoGet = "PlatformUserInfoGet", //平台用户信息成功获取

    // GM Event
    GMChange = "GMChange",
    GMDebugInfo = "GMDebugInfo",
}

window.regVar("EventType", EventType);
