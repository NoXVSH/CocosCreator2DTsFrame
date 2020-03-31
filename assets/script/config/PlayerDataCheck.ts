import UserInfo, { UserInfoJsonKey } from "./UserInfo";
import Util from "../core/utils/Util";
import DeviceID from "./DeviceID";
import { HttpManager } from "../core/net/HttpManager";
import MyGlobal from "./MyGlobal";
import { HttpApi } from "../core/net/HttpApi";

export default class PlayerDataCheck {
    private static _instance: PlayerDataCheck;

    static get Instance(): PlayerDataCheck {
        if (this._instance == null) {
            this._instance = new PlayerDataCheck();
        }

        return this._instance;
    }

    checkAndInjectData(ret) {
        let getResult = UserInfo.Instance.setDataFromLocal(); //先读取下本地数据, 在读取本地缓存的时候, 有可能读取失败, 这个时候要用服务器数据
        let result = DeviceID.isDeviceIDSame(ret.data.userid, ret.data.deviceId);

         //设备id不一样 或者本地读取的userid无效或者本地读取用户数据失败,
        if (!getResult.success || UserInfo.Instance.UserIdInvalid() || result != true) {
            UserInfo.Instance.setDataFromServer(ret.data);

            if(result != true) {  //设备码不一样, 覆盖本地数据后, 上传设备id给服务器
                let uploadData = {} as any;
                uploadData.userid = ret.data.userid;
                uploadData.deviceId = result;
    
                HttpManager.Instance.get(HttpApi.UpLoadUserInfo, uploadData, ret => {
                });
                errorlog("设备id不同, 生成新设备id并上传");
            }
            else errorlog("读取本地用户数据出现问题");

            errorlog("使用服务器玩家数据");
            log(UserInfo.Instance.__getProperty());
        }
        else {      
            errorlog("使用本地玩家数据");
            log(UserInfo.Instance.__getProperty());
        }

        UserInfo.Instance.SaveData();
        UserInfo.Instance.UpToWx();
    }

}
