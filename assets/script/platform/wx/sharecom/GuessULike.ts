import { HttpManager } from "../../../core/net/HttpManager";
import MyGlobal from "../../../config/MyGlobal";
import UserInfo from "../../../config/UserInfo";
import PlatformManager from "../../PlatformManager";
import Util from "../../../core/utils/Util";

const {ccclass, property} = cc._decorator;
const scrollStep = 50;//每秒移动像素

@ccclass
export default class GuessULike extends cc.Component {

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab : cc.Prefab = null;
    
    isInit: boolean;
    data: any;
    nodeList: any[];
    orderList: any[];

    onLoad() : void {
        HttpManager.Instance.request(`https://wxgameapi.sihai-inc.com/appadvert/list?posid=${MyGlobal.Instance.gameId + "002"}&os=${UserInfo.Instance.GetPlatform()}`, ret => {
            if (ret && ret.code === 200) {
                this.init(ret.data);
            }
        });
    }
    

    init(data) : void {
        this.isInit = true;

        this.data = data;
        this.nodeList = [];
        this.orderList = [];
        for (let i = 0; i < this.data.length; i++) {
            let node = cc.instantiate(this.itemPrefab);
            node.active = true;

            let clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "GuessULike";//这个是代码文件名
            clickEventHandler.handler = "clickItem";
            clickEventHandler.customEventData = i + "";
            let button = node.getComponent(cc.Button);
            button.clickEvents.push(clickEventHandler);

            this.content.addChild(node);
            this.nodeList.push(node);

            this.orderList.push(i);
        }

        this.randomOrder();
    }

    onEnable() : void {
        if (this.isInit) {
            this.randomOrder();
        }
    }

    randomOrder() : void {
        if (PlatformManager.Instance.getPlatformName() == "weixin") {
            let tempList = [];
            while (this.orderList.length > 0) {
                tempList.push(this.orderList.splice(Util.Instance.random(0, this.orderList.length - 1), 1)[0]);
            }
            this.orderList = tempList;
            // log("this.orderList", this.orderList);

            let self = this;
            for (let i = 0; i < this.data.length; i++) {
                (function (i) {
                    cc.loader.load(self.data[self.orderList[i]].small_image, function (errors, results) {
                        if (errors) return;
                        self.nodeList[i].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(results);
                        self.nodeList[i].setContentSize(cc.size(136, 136));
                        // self.nodeList[i].getComponentInChildren(cc.Label).string = self.data[this.orderList[i]].ad_title;
                    })
                })(i)
            }
            this.scheduleOnce(this.startAutoScroll, 0);
        }
        // this.scheduleOnce(this.startAutoScroll, 0);//电脑调试
    }

    startAutoScroll() : void {
        this.content.stopAllActions();
        let scrollView = this.node.getComponent(cc.ScrollView);
        scrollView.stopAutoScroll();
        scrollView.scrollToOffset(cc.v2(0, scrollView.getScrollOffset().y));
        log("this.content.width", this.content.width);
        if (this.content.width > 720) {
            let distance = this.content.width - 720;
            this.content.runAction(cc.repeatForever(cc.sequence(
                cc.delayTime(2),
                cc.callFunc(function () {
                    scrollView.scrollToRight(distance/scrollStep, false);
                }),
                cc.delayTime(distance/scrollStep + 2),
                cc.callFunc(function () {
                    scrollView.scrollToLeft(distance/scrollStep, false);
                }),
                cc.delayTime(distance/scrollStep),
            )))
        }
    }

    clickItem(event, customEventData) : void {
        let id = parseInt(customEventData);
        if (PlatformManager.Instance.getPlatformName() == "weixin") {
            PlatformManager.Instance.clickPromote(this.data[this.orderList[id]]);
        }
    }
}
