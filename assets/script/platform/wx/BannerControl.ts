///Banner广告位的控制
const adUnitId = "adunit-960bdcaf448bea84"; //广告id
let global_banner = null;//广告实例
let size = { _left: 0, _top: 0, _width: 0 };

export default class BannerControl {
    private static _instance : BannerControl;

    static get Instance() : BannerControl {
        if(this._instance == null) {
            this._instance = new BannerControl();
        }

        return this._instance;
    }

    bannerInit() : void {
        let wxis = wx.getSystemInfoSync();
        size._left = 0;//parseInt(wxis.screenWidth * 51 / 720);
        size._width = wxis.screenWidth;//parseInt(wxis.screenWidth * 620 / 720);
        let onePixel = wxis.screenWidth / 720;
        let winHeight = cc.winSize.height;
        if (winHeight > 1400) {//全面屏banner不能靠底，会挡住iphonex的操作，导致不过审
            // if (UserInfo.Instance.GetPlatform() === "ios") {
            //     // 微信banner在iphonex会自动上移，要放下来一点，如果微信解决了这个问题可以去除这个判断
            //     size._top = wxis.screenHeight / 2 + (winHeight / 2 - 260) * onePixel;
            // } else {
            size._top = wxis.screenHeight / 2 + (winHeight / 2 - 310) * onePixel;
            // }
        } else {
            size._top = wxis.screenHeight / 2 + (1280 / 2 - 245) * onePixel;
        }

        // 初始化时调用show然后hide,避免在游戏中调用show时导致卡顿
        this.bannerShow();
        this.bannerHide();
    }

    ///创建
    create() : void {
        if (global_banner) {
            return;
        }
        global_banner = wx.createBannerAd({
            adUnitId: adUnitId,
            style: {
                left: size._left,
                top: size._top,
                width: size._width
            }
        });

        // global_banner.onResize(() => {
        //     let wxis = wx.getSystemInfoSync();
        //
        //     global_banner.style.left = 0;//(wxis.windowWidth / 2 - size._width / 2) + bannerOffset.x + 0.1;
        //     global_banner.style.top = wxis.windowHeight - global_banner.style.realHeight - 5 + 0.1;
        // });

        global_banner.onError(function () {
            global_banner = null;
        });
    }

    //显示
    bannerShow() : void {
        this.create();
        global_banner.show();
    }

    //隐藏
    bannerHide() : void {
        if (global_banner) {
            global_banner.hide();
            return;
        }
    }

    //关闭
    bannerClose() : void {
        if (global_banner) {
            global_banner.destroy();
            global_banner = null;
        }
    }
}
