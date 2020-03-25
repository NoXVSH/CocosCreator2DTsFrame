import BannerControl from "./BannerControl";
import GameConfig from "../../config/GameConfig";
import UserInfo from "../../config/UserInfo";
import MyGlobal from "../../config/MyGlobal";
import PlatformManager from "../PlatformManager";
import { HttpManager } from "../../core/net/HttpManager";

const {ccclass, property} = cc._decorator;
const BANNER_ID = "006";
const FRESH_TIME = 30;
const IS_FRESH = false;//展示自己的banner时，是否周期性刷新

@ccclass
export default class MyBanner extends cc.Component {
    haveError: boolean;
    _isSelfBanner: boolean;
    dynamicAdInfo : any;

    onLoad() : void {
        this.node.on("click", this.clickBanner, this);
    }

    bannerClose() : void {
        BannerControl.Instance.bannerClose();
        this.unschedule(this.showSelfBanner);
        this.node.active = false;

        this._isSelfBanner = false;
    }

    bannerHide() : void {
        BannerControl.Instance.bannerHide();
        this.unschedule(this.showSelfBanner);
        this.node.active = false;
    }

    // noSwitch从外部控制广点通banner不要定时刷新为自己的banner
    bannerShow(noSwitch : boolean) : void {
        if (!this.haveError && !this._isSelfBanner) {
            BannerControl.Instance.bannerShow();

            if (GameConfig.Instance.canBannerSwitch() && !noSwitch) {
                this.unschedule(this.showSelfBanner);
                this.scheduleOnce(this.showSelfBanner, GameConfig.Instance.getBannerTime());
            }
        } else {
            this.showSelfBanner();
        }
    }

    setError() : void {
        this.haveError = true;
    }

    showSelfBanner() : void {
        BannerControl.Instance.bannerHide();
        this._isSelfBanner = true;
        let self = this;
        HttpManager.Instance.request(`https://wxgameapi.sihai-inc.com/appadvert/index?posid=${MyGlobal.Instance.gameId + BANNER_ID}&os=${UserInfo.Instance.GetPlatform()}`, ret => {
            log("广告banner配置：", ret);
            if (ret.code === 200) {
                self.dynamicAdInfo = ret.data;
                cc.loader.load(ret.data.small_image, function (err, texture) {
                    if (self._isSelfBanner) {//避免请求过程中调用了close，故再判断一次
                        self.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                        self.node.active = true;
                    }
                });
            }
        });

        if (IS_FRESH) {
            this.unschedule(this.showSelfBanner);
            this.scheduleOnce(function () {
                this.scheduleOnce(self.showSelfBanner, FRESH_TIME);
            })
        }
    }

    bannerInit() : void {
        this.node.active = false;
        BannerControl.Instance.bannerInit();
    }

    clickBanner() : void {
        if (this.dynamicAdInfo) {
            PlatformManager.Instance.clickPromote(this.dynamicAdInfo);
        }
        this.showSelfBanner();//刷新banner
    }
}
