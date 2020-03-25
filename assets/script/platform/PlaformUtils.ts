
export default class PlaformUtils {

    static getPlatformName(): string {
        if (cc.sys.isNative) {  // 原生apk
            if (cc.sys.os === cc.sys.OS_ANDROID) {    // android
                return "android";
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {   // IOS
                return "ios";
            }
            else if (cc.sys.os === cc.sys.OS_WINDOWS) {  // windows模拟器
                return "windows";
            }
            else if (cc.sys.os === cc.sys.OS_OSX) {   // mac模拟器
                return "osX";
            }
        } else {    // 小游戏或者模拟器
            if (cc.sys.platform === cc.sys.MOBILE_BROWSER || cc.sys.platform === cc.sys.DESKTOP_BROWSER) {
                return "web";
            } else if (cc.sys.platform === cc.sys.BAIDU_GAME) {
                return "baidu";
            } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                return "weixin";
            }
        }
    }

}
