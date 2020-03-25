const interstitialId = "adunit-434a0b0e6347dc31";

export default class WxInterstitialAd {
    private static _instance : WxInterstitialAd;

    static get Instance() : WxInterstitialAd {
        if(this._instance == null) {
            this._instance = new WxInterstitialAd();
        }

        return this._instance;
    }

    show(callback? : Function) : void {
        // MyGlobal.Instance.point(fenxiangCode[0]);

        let interstitialAd = wx.createInterstitialAd({ adUnitId: interstitialId });

        interstitialAd.onClose(() => {
            callback && callback();
        });

        interstitialAd.onError(res => {
            errorlog("InterstitialAd error:", res.errCode, res.errMsg);
        });

        let res = interstitialAd.show();
        log("InterstitialAd show:" , res)
    }

}
