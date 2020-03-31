
import MyGlobal from "./MyGlobal";
import PlatformManager from "../platform/PlatformManager";
import UserInfo from "./UserInfo";
import { EventType } from "../core/event/EventType";
import EventManager from "../core/event/EventManager";
import { HttpManager } from "../core/net/HttpManager";
import Util from "../core/utils/Util";
import { HttpApi } from "../core/net/HttpApi";

let istest = false;

// 正常配置，一般情况下勿动(默认保持所有点都是视频，方便过审)
let normalConfig = {
    share_skip_num: 0,//连续跳过分享点场次数
    share_max_num: 0,//一天可以分享的总次数

    reshare_times: 2, // 分享无效的判断次数
    reshare_second: 3, // 判断是否分享成功秒数
    reshare_tips: "分享无效，换个群试试", // 分享无效文字提示，提示框文字 提示，取消，去分享/确定
    reshare_tips2: "不要频繁分享到同一个群，换个群试试", // 分享无效文字提示，提示框文字 提示，取消，去分享/确定

    share_picture: "",//版本"1.1.4"使用本地分享图，"0"使用网路分享图

    banner_type: 0, // 广点通banner是否定时刷新成自己的banner,0:否,1:是
    banner_time: 30, // 展示广点通banner多少秒后切换为自己的banner
    banner_refreshlevel: 2, // banner广告的刷新间隔关卡，2就代表每2关才刷新一次banner

    interstitial_num: 1000,//每x关出现一次插屏广告

    default_type: 0,//默认分享开关，0代表视频，1代表分享
    default_num: 3,//默认最大分享值


};

let config = normalConfig;

export default class GameConfig {
    private static _instance: GameConfig;

    static get Instance(): GameConfig {
        if (this._instance == null) {
            this._instance = new GameConfig();
        }

        return this._instance;
    }

    getConfigData(key): any {
        if(config[key] == null) warnlog(`获取分享配置表字段${key}失败`);
        return config[key];
    }

    queryData(cb: Function): void {
        if (PlatformManager.Instance.isQueryGameConfig()) {
            let data = { clientversion: MyGlobal.Instance.Version, userid: UserInfo.Instance.GetUserId() };

            HttpManager.Instance.get(HttpApi.GameConfig, data, function (ret) {
                if (ret && ret.data && ret.errcode === 0) {
                    if (!istest) {
                        for (let k in ret.data) {
                            config[k] = ret.data[k];
                        }

                        log("-------------配置表----------", config);
                        EventManager.Instance.emit(EventType.GameConfigQueryComplete);
                    } else {
                        errorlog("当前远程配置istest为true,提交正式版请修改为false！！！！");
                    }
                    cb();
                } else {
                    cb();
                }
            });
        } else {
            cb();
        }
    }

    // 新分享策略---------------
    getNewShareTime(): number {
        return config.reshare_second + (1 - Util.Instance.random(0, 2));// 随机正负1范围波动
    }

    getNewShareFailCount(): number {
        return config.reshare_times;
    }

    getShareFailText(): string {
        if (Util.Instance.random(0, 1) == 1) {// 随机二选一
            return config.reshare_tips;
        } else {
            return config.reshare_tips2;
        }
    }

    canShareOnlinePicture(): boolean {
        return config.share_picture !== MyGlobal.Instance.Version;
    }

    canBannerSwitch(): boolean {
        return config.banner_type === 1;
    }

    getBannerTime(): number {
        return config.banner_time;
    }

    getBannerRefreshTime(): number {
        return config.banner_refreshlevel;
    }
}

window.regVar("GameConfig", GameConfig);
