import PlatformShareInfo, { PlatformShareInfoStruct } from "../PlatformShareInfo"; import { ShareVideoResultType } from "../enum/PlatformEnum";
import PlaformUtils from "../PlaformUtils";

export default class BasePlatformApi {
    // 平台系统类型

    getPlatformName(): string {
        return PlaformUtils.getPlatformName();;
    }

    init() {
        this.getSystemInfoSync(); // 获取设备信息

        this.videoInit();
        this.bannerInit();

        PlatformShareInfo.Instance.init();
        this.checkVersion((isNewVersion) => {
            isNewVersion && this.cleanOldCaches();
        });
    }

    isNative(): boolean {
        return cc.sys.isNative;
    }

    login(cb: Function): void {

    }

    // 是否请求远程配置
    isQueryGameConfig(): boolean {
        return false;
    }

    bannerInit(): void {

    }

    // 加载广告
    bannerShow(): void {

    }

    // 隐藏广告
    bannerHide(): void {

    }

    // 销毁广告
    bannerClose(): void {

    }

    bannerFresh(): void {
        this.bannerClose();
        this.bannerShow();
    }

    videoInit(): void {

    }

    // 播放激励视频
    videoShow(btnType: PlatformShareInfoStruct, callback: (resultType: ShareVideoResultType) => void): void {

    }

    // 普通分享方法，分享后无奖励时调用此方法
    CommonShare(fenxiangCode: number[] | string[]): void {

    }

    // 分享后可获得奖励时调用此方法
    share(btnType: PlatformShareInfoStruct, cb: (resultType: ShareVideoResultType) => void): void {

    }

    // 微信平台下将用户数据上传给微信，主要用来显示排行榜
    SaveToPlatform(kvlist: any, failcb: Function) {

    }

    // 微信渲染排行榜
    RenderCanvas(uiNode: cc.Node, param: any, isHideLoading: boolean) {

    }

    // 微信排行榜翻页
    RenderPage(param: any): void {

    }

    RenderEnd(): void {
    }

    getSystemInfoSync(): any {
        return null;
    }

    //震动
    vibrate(): void {

    }

    //长震动
    vibrateLong(): void {

    }

    // 点击首页更多按钮，自己的banner，动图
    clickPromote(data: any): void {

    }

    clickPromoteTy(data: any, pointSuccessId: string | number): void {

    }

    postMessage(data: any): void {

    }

    showModal(info: any): void {

    }

    exitMiniProgram(): void {

    }

    // 插屏广告
    showInterstitial(): void {

    }

    authorizeUserInfo(callback: Function): void {
        callback && callback(true);
    }

    isDaDian(): boolean {
        return false;
    }

    isShowRanklist(): boolean {
        return false;
    }

    getUserInfo(): any {

    }

    createUserInfoButton(node = null, callback = null, errorback = null): any {

    }


    setClipboardData(data: any): void {

    }

    //客服会话
    openCustomerServiceConversation(data: any): void {

    }

    //订阅消息
    requestSubscribeMessage(tempId: string, cb: Function): void {

    }

    canSubscribe() {
        return false;
    }

    getOpenId() {
        return null;
    }

    limitUpdateRank() {
        return false;
    }

    isGetPlatformUserInfo() {
        return false;
    }

    showLoading(title) {

    }

    hideLoading() {

    }

    checkVersion(cb: Function) {

    }

    cleanOldCaches() {

    }

    garbageCollect() {

    }

}
