import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";

export default class ReflectionManager {
    private static _instance : ReflectionManager;
    videoCallback: any;

    static get Instance() : ReflectionManager {
        if(this._instance == null) {
            this._instance = new ReflectionManager();
        }

        return this._instance;
    }

    bannerShow() : any {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "makeNativeAd", "(I)V", 771);
    }

    interstitialShow() : any {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "makeNativeAd", "(I)V", 772);
    }

    videoShow(callback) : any {
        this.videoCallback = callback;
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "makeNativeAd", "(I)V", 773);
    }

    javaBack(code) : any {
        log("javaBack", code);
        if (code == 881) {//激励视频成功
            if (this.videoCallback) {
                this.videoCallback(true);
                this.videoCallback = null;
            }
        } else if (code == 882) {//激励视频关闭
            if (this.videoCallback) {
                this.videoCallback(-1);
                EventManager.Instance.emit(EventType.TipShow, {str : "看完视频才能获得奖励哦~"});
                this.videoCallback = null;
            }
        } else if (code == 883) {//激励视频拉取失败
            if (this.videoCallback) {
                this.videoCallback(-1);
                EventManager.Instance.emit(EventType.TipShow, {str : "广告拉取失败"});
                this.videoCallback = null;
            }
        }
    }

}
