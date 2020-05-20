import UserInfo from "../../config/UserInfo";
import { HttpManager } from "../../core/net/HttpManager";
import { PlatformShareInfoStruct } from "../PlatformShareInfo";
import ModuleManager from "../../core/module/ModuleManager";
import EventManager from "../../core/event/EventManager";
import { EventType } from "../../core/event/EventType";
import { ShareVideoResultType } from "../enum/PlatformEnum";
import BaseConfig from "../../core/config/BaseConfig";
import { ModuleName } from "../../core/module/ModuleName";
import { UINameEnum } from "../../core/ui/UINameEnum";
import BasePlatformApi from "../base/BasePlatformApi";
import { HttpApi } from "../../core/net/HttpApi";

export default class LocalGameApi extends BasePlatformApi {
    login(cb: Function): void {
        //游客登录
        let data = cc.sys.localStorage.getItem("GameApiAccountInfo");
        data = JSON.parse(data);

        if(data) {
            UserInfo.Instance.setDataFromLocal();
            cb(null, new Date().getTime());
        }
        else {
            data = { account: 'user' + Math.floor(Math.random() * 1000000), channel: "" };
            cc.sys.localStorage.setItem("GameApiAccountInfo", JSON.stringify(data));
            cb(null, new Date().getTime());
        }
    }

    share(shareInfo: PlatformShareInfoStruct, cb: (resultType: ShareVideoResultType) => void): void {
        cb(ShareVideoResultType.SHARE_SUCCEED);
    }

    videoShow(shareInfo: PlatformShareInfoStruct, callback: (resultType: ShareVideoResultType) => void) {
        callback && callback(ShareVideoResultType.VIDEO_SUCCEED);
        UserInfo.Instance.setWatchVideoCount(UserInfo.Instance.getWatchVideoCount() + 1);
        UserInfo.Instance.Upload();
    }

    // 是否请求远程配置
    isQueryGameConfig(): boolean {
        return false;
    }

    isDaDian(): boolean {
        return false;
    }

    isShowRanklist(): boolean {
        return true;
    }

    exitMiniProgram() {
        document.location.reload();
    }

    showModal(info: any) {
        let successCb = info.successCb;
        let cancelCb = info.cancelCb;

        ModuleManager.Instance.openUI(ModuleName.MessageBox, UINameEnum.MessageBox, {
            desc : info.content,
            successCb : () => successCb && successCb(),
            cancelCb : () => cancelCb && cancelCb,
        });
    }

    isGetPlatformUserInfo() {
        return true;
    }

    limitUpdateRank() {
        return !BaseConfig.Instance.getIsTest();
    }

    showLoading(title) {
        EventManager.Instance.emit(EventType.TipShow, { str: title });
    }

    garbageCollect() {
        cc.sys.garbageCollect();
    }


}
