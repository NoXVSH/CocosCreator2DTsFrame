// 设备码，解决更换设备问题
export default class DeviceID {
    static deviceKey = "__deviceid__";
    static isUploadDeviceId = false;

    /**
     * 设备ID是否一致
     * @param severId 服务器记录的用户设备ID
     */
    static isDeviceIDSame(userId, serverId, isCreateNew = true) {
        let localId = cc.sys.localStorage.getItem(this.deviceKey);
        cc.log(`服务器设备码: ${serverId}  本地设备码：${localId}`)
        if (localId === serverId && serverId !== "") {
            cc.log("设备码相同");
            return true;
        } else {
            this.isUploadDeviceId = true;
            return isCreateNew ? this.createDeviceID(userId) : false;
        }
    }

    // 生成设备码：（userId-当前时间戳-随机数）
    static createDeviceID(userId) {
        let ran = parseInt((Math.random() * 8999 + 1000) + "");
        let id = `${userId}-${new Date().getTime()}-${ran}`;
        cc.log("createDeviceID >>>> ", id);
        cc.sys.localStorage.setItem(this.deviceKey, id);

        return id;
    }

    static clearDeviceID(userId) {
        cc.sys.localStorage.removeItem(this.deviceKey);
    }

    static getDeviceID(userId) {
        cc.sys.localStorage.getItem(this.deviceKey);
    }


}

