import PlatformManager from "../PlatformManager";

export default class WxVersionCheck {
    private static _instance: WxVersionCheck;

    static get Instance(): WxVersionCheck {
        if (this._instance == null) {
            this._instance = new WxVersionCheck();
        }

        return this._instance;
    }

    checkVersion(cb : Function) {
        let updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate((res) => {
            // 请求完新版本信息的回调
            errorlog("检测小程序新版本：", res.hasUpdate);
            cb && cb(res.hasUpdate);
        });

        updateManager.onUpdateReady(() => {
            wx.showModal({
                title: '更新提示',
                content: '发现新版本，请重启进行更新！',
                showCancel: false,
                success: (res) => {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                }
            });
        });

        updateManager.onUpdateFailed(() => {
            // 新版本下载失败
            wx.showModal({
                title: '更新提示',
                content: '新版本更新失败，请重启尝试更新。',
                showCancel: false,
                success: (res) => {
                    if (res.confirm) {
                        PlatformManager.Instance.exitMiniProgram();
                    }
                }
            });
        });

    }

}
