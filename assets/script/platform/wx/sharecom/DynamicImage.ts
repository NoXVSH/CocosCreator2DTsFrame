import UserInfo from "../../../config/UserInfo";
import PlatformManager from "../../PlatformManager";
import { HttpManager } from "../../../core/net/HttpManager";


const FRESH_TIME = 20;
const {ccclass, property} = cc._decorator;

@ccclass
export default class DynamicImage extends cc.Component {

    @property
    adId: number = 0;
    
    dynamicAdInfo: any;
    scheUpdate: () => void;
    sche: () => void;

    onLoad() : void {
        let self = this;
        this.scheUpdate = function(){
            self.showDynamicImage();
        };

        this.node.on("click", this.moreGame, this);
    }

    onEnable() : void {
        this.showDynamicImage();
    }

    //动图
    showDynamicImage() : any {
        let self = this;
        let url = `https://wxgameapi.sihai-inc.com/appadvert/index?posid=${this.adId}&os=${UserInfo.Instance.GetPlatform()}`;
        if (PlatformManager.Instance.getPlatformName() == "weixin") {
            HttpManager.Instance.request(url, ret => {
                if (ret && ret.code === 200) {
                    self.dynamicAdInfo = ret.data;
                    let imgList = [];
                    let successNum = 0;
                    let spr = self.node.getComponent(cc.Sprite);
                    for (let i = 0; i < self.dynamicAdInfo.dynamic_small_image.length; i++) {
                        (function (i) {
                            cc.loader.load(self.dynamicAdInfo.dynamic_small_image[i], function (errors, results) {
                                if (errors) return;
                                successNum++;
                                imgList[i] = results;
                                if (successNum === self.dynamicAdInfo.dynamic_small_image.length) {
                                    log('图片加载完成');
                                    self.node.active = true;
                                    self.unschedule(self.sche);
                                    let k = 0;
                                    self.sche = function () {
                                        spr.spriteFrame = new cc.SpriteFrame(imgList[k++]);
                                        if (k >= imgList.length) k = 0;
                                    };
                                    self.schedule(self.sche, 0.2);
                                }
                            })
                        })(i)
                    }
                }
            });
        }

        this.unschedule(this.scheUpdate);
        this.schedule(this.scheUpdate, FRESH_TIME);
    }

    moreGame() : any {
        if (PlatformManager.Instance.getPlatformName() == "weixin") {
            if (this.dynamicAdInfo) {
                PlatformManager.Instance.clickPromote(this.dynamicAdInfo);
            }
            this.showDynamicImage();//点击后刷新动图
        }
    }
}
