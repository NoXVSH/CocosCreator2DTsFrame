import PlatformManager from "../../platform/PlatformManager";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import ConfigManager from "../../core/config/ConfigManager";
import LoaderManager from "../../core/loader/LoaderManager";
import ModuleManager from "../../core/module/ModuleManager";
import MyGlobal from "../../config/MyGlobal";
import { ModuleName } from "../../core/module/ModuleName";
import { UINameEnum } from "../../core/ui/UINameEnum";
let LoadWaitTime = 30000;
let preLoadList = [
    "internal/prefab/base/mask",
    "internal/prefab/loading/smallloading",
    "internal/prefab/tip/tip",
    "internal/prefab/login/login"
];

export default class GamePreload {
    private static waitTimeOut: number = null;

    public static gamePreload() {
        let info = {} as any;

        info.progress = (current, total) => {
            let info = {} as any;
            info.current = current;
            info.total = total;
            EventManager.Instance.emit(EventType.SetLoading, info);
        };

        info.complete = () => {
            if(MyGlobal.Instance.isLogin) {
                this.enterGame();
            }
            else {
                PlatformManager.Instance.showLoading("正在登陆中");
                EventManager.Instance.once(EventType.LoginSuccess, this.enterGame, this);
            }
        }

        ModuleManager.Instance.openUI(ModuleName.Loading, UINameEnum.Loading, {
            callback : () =>  {
                EventManager.Instance.emit(EventType.LoadingOpen, {callback : info.complete, isUnload : true});
                this.launch(info);
            }
        });
    }

    private static launch(info): void {
        this.setLoadTimeout();

        let progressCb = info.progress;
        let completeCb = info.complete;

        this.loadConfigAsync().then(() => {
            log("加载游戏配置表完成");
            EventManager.Instance.emit(EventType.ConfigLoadComplete);
            return this.loadResAsync(preLoadList, progressCb);
        }).then(() => {
            this.clearLoadTimeout();
            completeCb && completeCb();
        }).catch((reason) => {
            errorlog("预加载出错了", reason);
        });
    }

    private static loadConfigAsync(): Promise<any> {
        let p = new Promise<any>((resolve, reject) => {
            ConfigManager.Instance.startLoad(() => {
                resolve();
            });
        });

        return p;
    }

    private static loadResAsync(loadList, progressCb): Promise<any> {
        let p = new Promise<any>((resolve, reject) => {
            let startTime = new Date().getTime();
            log("开始加载资源", loadList);

            let list = loadList;
            let _loaded = 0;

            if (list.length == 0) resolve();

            let type = null;
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].indexOf("atlas") != -1) type = cc.SpriteAtlas; //图集特殊, 不传type, 加载会当成cc.texture2d
                else type = null;

                LoaderManager.Instance.silentLoad(list[i], type, () => {
                    _loaded++;

                    progressCb(_loaded, list.length);

                    if (_loaded >= list.length) {
                        let endTime = new Date().getTime();
                        let time = endTime - startTime;
                        log("加载资源完成, 耗时" + time + "ms", loadList);

                        resolve();
                    }
                });
            }
        });

        return p;
    }

    private static setLoadTimeout() {
        this.waitTimeOut = setTimeout(() => {
            this.showLoadTimeoutTip();
        }, LoadWaitTime);
    }

    private static clearLoadTimeout() {
        clearTimeout(this.waitTimeOut);
    }

    private static showLoadTimeoutTip(): void {
        errorlog("加载超时提示!!!!!!!");

        let info = {} as any;
        info.title = "提示";
        info.content = "网络不稳定, 请检查网络后重启游戏";
        info.confirmText = "确定";

        info.successCb = () => {
            PlatformManager.Instance.exitMiniProgram();
        };

        info.cancelCb = () => {
            PlatformManager.Instance.exitMiniProgram();
        }
        PlatformManager.Instance.showModal(info);
    }

    private static enterGame() {
        cc.find("Canvas/bg").active = false;
        PlatformManager.Instance.hideLoading();
        EventManager.Instance.emit(EventType.BeforeEnterHome); 

        ModuleManager.Instance.openUI(ModuleName.Login, UINameEnum.Login, {
            callback : () => EventManager.Instance.emit(EventType.FirstEnterHome) //打开主页面 才算预加载完成
        });
    }

}
