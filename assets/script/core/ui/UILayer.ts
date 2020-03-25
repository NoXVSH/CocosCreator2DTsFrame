export enum UILayer {
    Bottom = 0, //底层         当该层发生切换时, 会关闭所有同级的界面
    Main = 1, //主界面层        当该层发生切换时, 会关闭所有同级的界面
    Pop = 2, //弹窗层          当该层发生切换时, 会关闭所有同级的界面
    Activity = 3, //活动层      有界面回退记录
    Guide = 4, //引导层         当该层发生切换时, 会关闭所有同级的界面
    Load = 5, //加载层         有界面回退记录
    Gm = 6, //GM层  放GM界面
    Tip = 7, //提示层          有界面回退记录
}

//要显示banner的界面一般注册在 Bottom -> Activity层

window.regVar("UILayer", UILayer);
