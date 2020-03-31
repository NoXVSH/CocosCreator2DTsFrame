import UserInfo from "../../config/UserInfo";
import GameConfig from "../../config/GameConfig";
import MyGlobal from "../../config/MyGlobal";
import VideoControl from "./VideoControl";
import WxInterstitialAd from "./WxInterstitialAd";
import PlatformManager from "../PlatformManager";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import { HttpManager } from "../../core/net/HttpManager";
import Util from "../../core/utils/Util";
import { PlatformShareInfoStruct } from "../PlatformShareInfo";
import { ShareVideoResultType } from "../enum/PlatformEnum";
import WxVersionCheck from "./WxVersionCheck";
import BaseConfig from "../../core/config/BaseConfig";
import PlayerDataCheck from "../../config/PlayerDataCheck";
import BasePlatformApi from "../base/BasePlatformApi";
import { HttpApi } from "../../core/net/HttpApi";


/*
【微信小游戏】全局对象
功能：登录，本地数据保存，数据同步，显示微信开放数据，分享接口，获取数据库数据
*/
let GMList = ["4", "5", "6", "7", "41"];

// 屏蔽分享图版本使用本地分享图
let localShareCfg = {
    //分享标题
    shareTitles: '误入山河社稷图，你的地盘你做主',
    //分享的图片
    // sharePng: 'res/resources/sharePic.jpg',
    sharePng: 'res/sharepictures/sharePic.jpg',
};

// 右上角分享
let onAppShareCfg = {
    //分享标题
    shareTitles: "",
    //分享的图片
    sharePng: "",
    //素材Id，用于记录用户通过哪张分享图进入的游戏
    materialid: "",
};

export default class WxApi extends BasePlatformApi {
    private name: string = '全局数据对象';
    private dbData: any = null;   //数据库返回数据
    private drawTimers: any[] = [];   //渲染定时器
    private LaunchOption: any = null; //游戏启动参数
    private wxInfo: any = {};
    private wxLoginCb: Function = null; //微信登录回调函数
    private isLoginSuccess: boolean = false;  //登录服务器成功唯一标识
    shareTime: number;
    newShareCall: (resultType: ShareVideoResultType) => void;
    shareBtnType: PlatformShareInfoStruct;
    btnShareCountList: any;
    wxOpenid: string;

    //初始化
    login(cb: Function): void {
        let self = this;
        log('运行环境 = ', cc.sys.platform);
        if (!this.LaunchOption) {
            this.wxLoginCb = cb;
            this.LaunchOption = wx.getLaunchOptionsSync();
            log("微信启动参数 ======== : ", this.LaunchOption);
            self.judgyOnShowReward();

            //显示‘转发’按钮
            wx.showShareMenu({
                withShareTicket: true,
                success: function (res) {
                    log('\n转发==', res);
                }
            });

            //'转发'按钮分享信息
            this.OnAppShare();

            wx.onShow(function (res) {
                log("微信前台化回调：", res);
                self.LaunchOption = res;

                self.judgyOnShowReward();
                self.onShow();

                EventManager.Instance.emit(EventType.GameOnShow);
            });

            wx.onHide(function (res) {
                log("微信后台化回调：", res);
                EventManager.Instance.emit(EventType.GameOnHide);
            });

            wx.onMemoryWarning(() => {
                errorlog("内存过高警告!!!");
                MyGlobal.Instance.point("19090000"); //内存过高打点
                EventManager.Instance.emit(EventType.MemoryDanger);
            });
        }

        // 登录。获取服务器数据
        let scheduleLogin = function () {
            this.wxLogin((ret) => {
                if (this.isLoginSuccess == true) {
                    cb(ret, ret.data.curTimeStamp);
                } else {
                    errorlog("开始尝试连接游戏服务器");
                    setTimeout(scheduleLogin, 3 * 1000);
                }
            });
        }.bind(this);

        scheduleLogin();

    }

    //登录===================================================================================================
    //微信登录
    wxLogin(callback: Function): void {
        let self = this;
        wx.login({                                                  //登录微信服务器
            success: function success(loginResult) {
                let res = { code: loginResult.code } as any;
                if (self.LaunchOption && self.LaunchOption.query) {
                    if (self.LaunchOption.query.scene) {
                        res.channel = decodeURIComponent(self.LaunchOption.query.scene);
                    } else if (self.LaunchOption.query.channel) {
                        res.channel = self.LaunchOption.query.channel;
                    } else {
                        res.channel = "";
                    }
                }
                log("微信登录成功code:  " + loginResult.code);
                HttpManager.Instance.getWithHeader(HttpApi.WxLogin, res, function (ret) {    //登录游戏服务器
                    if (ret.errcode === 0) {
                        log("登录游戏服务器成功！数据如下：");
                        log(ret);
                        self.isLoginSuccess = true;
                        self.dbData = ret.data;

                        PlayerDataCheck.Instance.checkAndInjectData(ret); //处理玩家存档数据并注入至内存中

                        self.wxOpenid = ret.data.openid;

                        // 判断是否是微信管理员
                        if (Util.Instance.isInArray(ret.data.userid, GMList)) {
                            UserInfo.Instance.setIsGM(true);
                        }

                        // 打点平台登录
                        // wx.jldSendOpenid(ret.data.openid);
                        // wx.jldSendSession(ret.data.session_key);

                        callback(ret);
                    } else {
                        errorlog("登录游戏服务器失败！数据如下：");
                        errorlog(ret);
                        callback(ret);
                    }
                });
            },
            fail: function fail(loginError) {
                errorlog("微信登录失败，请检查网络状态！");
                callback(loginError);
            }
        });
    }

    //获取用户头像
    getUserData(): void {
        let self = this;
        wx.getUserInfo({
            success: function success(userResult) {
                log("获取微信用户信息成功！");
                self.wxInfo = userResult.userInfo;//包含昵称、头像等
                // var userInfo = userResult.userInfo;
                // var nickName = UserInfo.Instance.nickName
                // var avatarUrl = UserInfo.Instance.avatarUrl
                // var gender = UserInfo.Instance.gender //性别 0：未知、1：男、2：女
                // var province = UserInfo.Instance.province
                // var city = UserInfo.Instance.city
                // var country = UserInfo.Instance.country
                log(self.wxInfo);

                UserInfo.Instance.setPlatformUserName(self.wxInfo.nickName, false);
                UserInfo.Instance.setPlatformUserIconUrl(self.wxInfo.avatarUrl, false);
                UserInfo.Instance.SaveData(true, true);
                UserInfo.Instance.UpLoadPlatformNameAndHeadIcon();  //向服务器上传

                EventManager.Instance.emit(EventType.PlatformUserInfoGet);
            },
            fail: function fail(userError) {
                log("获取微信用户信息失败，请允许授权！");
            },
            complete: function () {
                log("获取微信用户信息结束");
            },
        });
    }

    getUserInfo() {
        return this.wxInfo;
    }

    authorizeUserInfo(callback: Function): void {
        let self = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    callback && callback(false);
                }
                else {
                    callback && callback(true);
                    self.getUserData();
                }
            },
            fail() {
                callback && callback(false);
            }
        });
    }

    createUserInfoButton(node: cc.Node = null, callback: Function = null, errorback: Function = null): void {
        let self = this;

        let info = {
            type: 'text',
            text: '',
            style:
            {
                left: 0,
                top: 0,
                width: wx.getSystemInfoSync().screenWidth,
                height: wx.getSystemInfoSync().screenHeight,
                lineHeight: 0,
                backgroundColor: '#00000000',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        }

        if (node != null) {
            let nodeInfo = Util.Instance.turnToLeftAxis(node, wx.getSystemInfoSync());

            info.style.left = nodeInfo.left;
            info.style.top = nodeInfo.top;
            info.style.width = nodeInfo.width;
            info.style.height = nodeInfo.height;
        }

        let button = wx.createUserInfoButton(info);

        button.onTap((res) => {
            if (res.errMsg == "getUserInfo:ok") {
                self.getUserData();
                button.hide();

                callback && callback();
            }
            else {
                errorback && errorback();
            }
        });

        return button;
    }
    //数据处理===================================================================================================


    //保存到微信
    SaveToPlatform(kvlist: any, failcb: Function) {
        // log("上传到微信的数据");
        // log(kvlist);
        wx.setUserCloudStorage({
            KVDataList: kvlist,
            success: function (res) {
                log('上传微信 success==', res);
            },
            fail: function (res) {
                log('上传微信 fail==', res);
                failcb();
            },
            complete: function (res) {
                // log('上传微信 complete==', res);
            },
        });
    }


    //分享==================================================================================================================

    // 排行榜渲染===================================================================================================
    // Loading
    Loading(timewait: number): void {
        wx.showLoading({
            title: '加载中...',
            mask: false,
        });
        setTimeout(() => {
            wx.hideLoading();
        }, timewait);
    }

    // 渲染开放域shareCanvas
    RenderCanvas(uiNode: cc.Node, param: any, isHideLoading: boolean = true): void {
        this.RenderEnd();    // 取消之前的定时器
        // if (!isHideLoading) { this.Loading(0); }

        let openDataContext = wx.getOpenDataContext();
        let sharedCanvas = openDataContext.canvas;
        if (param.view !== "chaoyue") {//设置宽高会刷新画布
            sharedCanvas.width = param.width;
            sharedCanvas.height = param.height;
        }
        param.userid = UserInfo.Instance.GetUserId() + "";
        // if (this.LaunchOption.shareTicket) {
        //     param.shareTicket = this.LaunchOption.shareTicket;
        //     param.cmd = 'grouprank';
        // }
        // else {
        //     param.cmd = 'friendrank';
        // }
        if (param.cmd === 'grouprank') {
            param.shareTicket = this.LaunchOption.shareTicket;
        } else if (param.view === "chaoyue") {
            param.cmd = 'chaoyue';
        }
        else if (param.view === 'myhead') {
            param.cmd = 'myhead';
        }
        else {
            param.cmd = 'friendrank';
        }
        //数据过期时间
        param.reftime = (this.dbData) ? this.dbData.reftime : '2018-04-09';
        openDataContext.postMessage(param);

        let texture = new cc.Texture2D();
        let spriteFrame = new cc.SpriteFrame(texture);
        let sprite = uiNode.getComponent(cc.Sprite);
        let draw = function () {
            texture.initWithElement(sharedCanvas);
            texture.handleLoadedTexture();
            sprite.spriteFrame = spriteFrame;
        };

        let timeId = setInterval(draw, 1000 * 0.2);
        this.drawTimers.push(timeId);
    }

    //分页 //{cmd:'page',index:1}
    RenderPage(param: any): void {
        // let openDataContext = wx.getOpenDataContext();
        // let sharedCanvas = openDataContext.canvas;
        // openDataContext.postMessage(param);
    }

    //渲染结算。//取消排行榜绘画调度定时器，在排行榜页面关闭时调用
    RenderEnd(): void {
        // wx.getOpenDataContext().postMessage({cmd: 'clear'});
        this.drawTimers.forEach(timeId => {
            clearInterval(timeId);
        });
        this.drawTimers = [];
    }

    queryTitleAndImg(): void {
        HttpManager.Instance.request(`https://wxgameapi.sihai-inc.com/appsharematter/index?mattercid=${MyGlobal.Instance.gameId}111001`, ret => {
            log("请求到分享的图片和标题", ret);
            if (ret.code === 200) {
                onAppShareCfg.shareTitles = ret.data.share_title;
                onAppShareCfg.sharePng = ret.data.share_image;
                onAppShareCfg.materialid = ret.data.materialid;
            }
        })
    }

    //菜单‘转发’按钮分享事件
    OnAppShare(): void {
        this.queryTitleAndImg();
        let title;
        let imageUrl;
        let query;
        // wx.jldOnShareAppMessage(function () {
        wx.onShareAppMessage(function () {
            if (GameConfig.Instance.canShareOnlinePicture()) {
                title = onAppShareCfg.shareTitles;
                imageUrl = onAppShareCfg.sharePng;
                query = `userid=${UserInfo.Instance.GetUserId()}&materialid=${onAppShareCfg.materialid}`
            } else {
                title = localShareCfg.shareTitles;
                imageUrl = BaseConfig.Instance.getResUrl() + localShareCfg.sharePng;
                query = `userid=${UserInfo.Instance.GetUserId()}`
            }

            let ShareOption = {
                title: title,
                imageUrl: imageUrl,
                query: query,
            };
            return ShareOption;
        });
    }

    //普通分享方法
    CommonShare(fenxiangCode: number[] | string[]): void {
        let title = localShareCfg.shareTitles;
        let imageUrl = BaseConfig.Instance.getResUrl() + localShareCfg.sharePng;
        let query = `userid=${UserInfo.Instance.GetUserId()}`;

        let sucaiId = fenxiangCode ? fenxiangCode[0] : MyGlobal.Instance.gameId + "111001";

        HttpManager.Instance.request(`https://wxgameapi.sihai-inc.com/appsharematter/index?mattercid=${sucaiId}`, ret => {
            log("请求到分享的图片和标题", ret);
            if (ret.code === 200) {
                if (GameConfig.Instance.canShareOnlinePicture()) {
                    title = ret.data.share_title;
                    imageUrl = ret.data.share_image;
                    query = `userid=${UserInfo.Instance.GetUserId()}&materialid=${ret.data.materialid}`
                }
            }

            // wx.jldShareAppMessage({
            wx.shareAppMessage({
                title: title,
                imageUrl: imageUrl,
                query: query,
            });
        })
    }

    // 分享以后可以获得奖励用此方法
    share(btnType: PlatformShareInfoStruct, cb: (resultType: ShareVideoResultType) => void): void {
        let self = this;
        let title = localShareCfg.shareTitles;
        let imageUrl = BaseConfig.Instance.getResUrl() + localShareCfg.sharePng;
        let query = `userid=${UserInfo.Instance.GetUserId()}`;

        HttpManager.Instance.request("https://wxgameapi.sihai-inc.com/appsharematter/index?mattercid=" + btnType.sharePicId, ret => {
            log("请求到分享的图片和标题", ret);
            if (ret.code === 200) {
                if (GameConfig.Instance.canShareOnlinePicture()) {
                    title = ret.data.share_title;
                    imageUrl = ret.data.share_image;
                    query = `userid=${UserInfo.Instance.GetUserId()}&materialid=${ret.data.materialid}`
                }
                // wx.jldShareAppMessage({
            }

            self.shareTime = Date.parse(new Date() as any);
            self.newShareCall = cb;
            self.shareBtnType = btnType;

            MyGlobal.Instance.point(btnType.shareStartPointId, 1);
            wx.shareAppMessage({
                title: title,
                imageUrl: imageUrl,
                query: query,
            });
        });
    }

    getSystemInfoSync(): any {
        return wx.getSystemInfoSync();
    }

    onShow(): void {
        if (this.shareTime !== 0 && this.shareTime !== undefined) {
            if (!this.btnShareCountList) {// 初始化失败次数数组
                this.btnShareCountList = {};
            }
            if (this.btnShareCountList[this.shareBtnType.name] === undefined) {
                this.btnShareCountList[this.shareBtnType.name] = 0;
            }

            let time = Date.parse(new Date().toString());
            let maxTime = GameConfig.Instance.getNewShareTime() * 1000;
            if (time - this.shareTime > maxTime) {
                this.newShareSuccess();
            } else {
                if (this.btnShareCountList[this.shareBtnType.name] >= GameConfig.Instance.getNewShareFailCount()) {
                    this.newShareSuccess();
                    this.btnShareCountList[this.shareBtnType.name] = 0;
                } else {
                    this.newShareFail();
                }
                this.btnShareCountList[this.shareBtnType.name]++;
            }

            this.shareTime = 0;

            EventManager.Instance.emit(EventType.RefreshShareOrVideoBtn);
        }
    }

    newShareSuccess(): void {
        MyGlobal.Instance.point(this.shareBtnType.shareSuccessPointId, 1);
        this.newShareCall(ShareVideoResultType.SHARE_SUCCEED);
    }

    newShareFail(): void {
        // 分享失败
        wx.showModal({
            title: "提示",
            content: GameConfig.Instance.getShareFailText(),
            confirmText: "去分享",
            success: function (res) {
                if (res.confirm) {
                    this.share(this.shareBtnType, this.newShareCall);
                }
            }.bind(this),
        });
    }

    videoInit() {
        VideoControl.Instance.videoInit();
    }

    videoShow(btnType: PlatformShareInfoStruct, callback: (resultType: ShareVideoResultType) => void) {
        VideoControl.Instance.videoShow(btnType, callback);
    }

    vibrate(): void {
        if (MyGlobal.Instance.getHaveSound()) {
            wx.vibrateShort();
        }
    }

    vibrateLong(): void {
        wx.vibrateLong();
    }

    canGoToMini(): boolean {
        let canGoToMini = false;
        let systemInfo = wx.getSystemInfoSync();
        if (systemInfo) {
            let strs = systemInfo.version.split('.');
            let ints = [6, 6, 7];
            for (let i = 0; i < strs.length; i++) {
                if (parseInt(strs[i]) > ints[i]) {
                    canGoToMini = true;
                    break;
                } else if (parseInt(strs[i]) === ints[i]) {
                    canGoToMini = true;
                } else {
                    canGoToMini = false;
                    break;
                }
            }
        }

        return canGoToMini;
    }

    clickPromote(data: any): any {
        let canGoToMini = this.canGoToMini();
        if (data.jump_type === "image") {
            canGoToMini = false;
        }
        if (canGoToMini) {
            MyGlobal.Instance.point(data.point_id, 1);
            wx.navigateToMiniProgram({
                appId: data.first_appid,
                path: data.first_path,
                extraData: { second_appid: data.second_appid, second_path: data.second_path },
                // envVersion:"trial",
                success: function () {
                },
                fail: function () {
                },
                complete: function () {
                }
            })
        } else {
            wx.previewImage({
                // current：'',
                urls: [data.big_image],
                success: res => {
                }
            })
        }
    }

    bannerInit(): void {
        MyBanner.bannerInit();
    }

    // 加载广告
    bannerShow(noSwitch: boolean): void {
        MyBanner.bannerShow(noSwitch);
    }

    // 隐藏广告
    bannerHide(): void {
        MyBanner.bannerHide();
    }

    // 销毁广告
    bannerClose(): void {
        MyBanner.bannerClose();
    }

    // 是否请求远程配置
    isQueryGameConfig() {
        return true;
    }

    onGameOver() {
        if (this.btnShareCountList) {
            for (let k in this.btnShareCountList) {
                this.btnShareCountList[k] = 0;
            }
        }
    }

    // 判断程序入口
    judgyOnShowReward() {
        let res = this.LaunchOption;
        // res && log("onshow!!!!!!!!!!", res);
        if (res) {
            if (res.scene == 1131) { //从悬浮窗口进来
                EventManager.Instance.emit(EventType.EnterFromFloatWindow);
            }
        }
    }

    postMessage(data) {
        data.userid = UserInfo.Instance.GetUserId();
        wx.getOpenDataContext().postMessage(data);
    }

    showModal(info) {
        let title = info.title;
        let content = info.content;
        let confirmText = info.confirmText;
        let successCb = info.successCb;
        let cancelCb = info.cancelCb;
        let showCancel = false;
        if (info.showCancel != null) showCancel = info.showCancel;

        wx.showModal({
            title: title,
            content: content,
            confirmText: confirmText,
            showCancel: showCancel,
            success: function (res) {
                if (res.confirm) {
                    successCb && successCb();
                }
                else if (res.cancel) {
                    cancelCb && cancelCb();
                }
            }.bind(this),
        });
    }

    exitMiniProgram(): void {
        wx.exitMiniProgram(); //此接口有可能导致游戏卡死一段时间才退出
    }

    showInterstitial(): any {
        WxInterstitialAd.Instance.show();
    }

    isDaDian(): boolean {
        return true;
    }

    isShowRanklist(): boolean {
        return true;
    }

    setClipboardData(data: any): void {
        wx.setClipboardData(data);
    }

    openCustomerServiceConversation(data: any): void {
        wx.openCustomerServiceConversation(data);
    }

    //订阅消息
    requestSubscribeMessage(tempId, cb): void {
        if (this.wxOpenid === undefined) {// 没有登录成功拿到openid的用户，不发请求直接给奖励
            cb && cb();
            return;
        }

        let info = {} as any;
        info.tmplIds = [];
        info.tmplIds.push(tempId);

        info.success = (res) => {
            if (res.errMsg == 'requestSubscribeMessage:ok') { //操作成功
                cb && cb(res);
                // if (res[tempId] == "accept") { //同意

                // }
                // else if (res.tempIds == "reject") { //拒绝

                // }
                // else if (res.tempIds == "ban") { //已被后台封禁

                // }
            }
        };

        wx.requestSubscribeMessage(info);
    }

    canSubscribe() {
        let version = wx.getSystemInfoSync().SDKVersion;
        if (Util.Instance.compareVersion(version, `2.8.2`) >= 0) {
            return true;
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            // wx.showModal({
            //     title: '提示',
            //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            // })
            return false;
        }
    }

    getOpenId(): string {
        return this.wxOpenid;
    }

    isGetPlatformUserInfo() {
        let name = UserInfo.Instance.getPlatformUserName();
        let icon = UserInfo.Instance.getPlatformUserIconUrl();

        return (name != "" && icon != "");
    }

    showLoading(title) {
        wx.showLoading({ title: title });
    }

    hideLoading() {
        wx.hideLoading();
    }

    checkVersion(cb: Function) {
        WxVersionCheck.Instance.checkVersion(cb);
    }

    cleanOldCaches() {
        wxDownloader.cleanOldCaches();
        errorlog("存在新版本 清除微信旧缓存");
    }

    garbageCollect() {
        wx.triggerGC();
    }

    limitUpdateRank() {
        return UserInfo.Instance.getIsGM() && !BaseConfig.Instance.getIsTest();
    }


}
