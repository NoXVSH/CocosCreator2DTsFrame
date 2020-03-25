import MyGlobal from "../../config/MyGlobal";
import UserInfo from "../../config/UserInfo";
import PlatformManager from "../PlatformManager";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import { PlatformShareInfoStruct } from "../PlatformShareInfo";
import {ShareVideoResultType} from "../enum/PlatformEnum";


const videoId = "adunit-3245fae03381d997";
let video = null;//视频广告
let isinit = null;//是不是初始化了
let videoCallBack = null;//视频回调函数
let isPlaying = false;//是否在播放中

export default class VideoControl {
    private static _instance : VideoControl;

    static get Instance() : VideoControl {
        if(this._instance == null) {
            this._instance = new VideoControl();
        }

        return this._instance;
    }

    private btnType : PlatformShareInfoStruct;

    videoInit() : void {
        video = wx.createRewardedVideoAd({ adUnitId: videoId });
        if (!isinit) {

            video.onLoad(() => {
                //log("vodeo onLoad callback");
            });
            video.onClose((res) => {
                log("onClose ：", res);

                cc.audioEngine.pauseMusic();
                cc.audioEngine.resumeMusic();

                isPlaying = false;
                let videoComplete: ShareVideoResultType;//是不是观看完毕

                if (res && res.isEnded || res === undefined) {
                    videoComplete = ShareVideoResultType.VIDEO_SUCCEED;
                    MyGlobal.Instance.point(this.btnType.videoSuccessPointId, 1);
                    UserInfo.Instance.setWatchVideoCount(UserInfo.Instance.getWatchVideoCount() + 1);
                    UserInfo.Instance.Upload();
                } else {
                    videoComplete = ShareVideoResultType.VIDEO_CANCEL;
                    wx.showModal({
                        content: "看完广告才能获得奖励哦~",
                        confirmText: "确定",
                        showCancel: false,
                    });
                }

                if (videoCallBack) {
                    videoCallBack(videoComplete);
                    videoComplete && EventManager.Instance.emit(EventType.RefreshShareOrVideoBtn);
                }
            });
            video.onError(res => {
                errorlog("video error:", res);
            });
            isinit = true;
        }
    }

    videoShow(btnType : PlatformShareInfoStruct, callback : (resultType: ShareVideoResultType) => void) : void {
        MyGlobal.Instance.point(btnType.videoStartPointId, 1);
        this.btnType = btnType;

        if (video) {
            video.show().catch((err) => {
                video.load().then(function () {
                    video.show();
                    log("广告加载成功");
                }).catch(function (err) {
                    errorlog("广告加载失败");
                    isPlaying = false;
                    videoCallBack = null;
   
                    wx.showModal({
                        content: "广告需要休息一下，请稍后再试哦！",
                        confirmText: "确定",
                        showCancel: false,
                    });

                    callback(ShareVideoResultType.VIDEO_FAIL);
                }.bind(this));

                log("显示广告");

            });
            isPlaying = true;
            videoCallBack = callback;
        } else {
            // errorlog("广告拉取失败");
            callback(ShareVideoResultType.VIDEO_FAIL);
        }
    }

    getIsPlaying() : boolean {
        return isPlaying;
    }

    

}
