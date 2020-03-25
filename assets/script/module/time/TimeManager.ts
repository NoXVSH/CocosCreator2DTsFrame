import ModuleBase from "../../core/module/ModuleBase";
import EventManager from "../../core/event/EventManager";
import {EventType} from "../../core/event/EventType";
import TimeUtils from "../../core/utils/TimeUtils";
import UserInfo, { UserInfoJsonKey } from "../../config/UserInfo";
import MyGlobal from "../../config/MyGlobal";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TimeManager extends ModuleBase {
    // 当前时间/s
    private nowTimestamp: number;

    init(){
        super.init();

        this.nowTimestamp = Math.round(new Date().getTime() / 1000); //先赋值下
        log("启动游戏，初始化时间：", TimeUtils.Instance.secToYMDHMS(this.nowTimestamp));
    }

    addEvent() {
        EventManager.Instance.on(EventType.PreloadComplete, this.initManager, this); //PreloadComplete时机 保证各模块数据已经初始化完成
        EventManager.Instance.on(EventType.GetNowTimesStamp, this.getNowTimestamp, this);
    }

    initManager() {
        this.nowTimestamp = Math.round(MyGlobal.Instance.getLoginTime() / 1000);
        this.updateTime();
        this.checkNewDay();
        this.checkNextNewDay();
    }

    // 获取当前时间戳/s
    getNowTimestamp(e : cc.Event.EventCustom) {
        e.setUserData(this.__getNowTimestamp());
    }

    __getNowTimestamp() {
        return this.nowTimestamp;
    }
    
    private updateTime() {
        setInterval( () => {
            this.nowTimestamp++;
            EventManager.Instance.emit(EventType.TimestampUpdate, this.nowTimestamp);
        }, 1000)
    }

    private checkNewDay() {
        let dailyDate = UserInfo.Instance.getUserjson(UserInfoJsonKey.dailyTaskDate);
        let nowDate = TimeUtils.Instance.secToYMD(this.__getNowTimestamp());
        
        if(dailyDate !== nowDate) {
            UserInfo.Instance.setUserjson(UserInfoJsonKey.dailyTaskDate, nowDate);
            EventManager.Instance.emit(EventType.NewDay);
        }
        else {
            EventManager.Instance.emit(EventType.NowDay);
        }

    }

    private checkNextNewDay() {
        let time = TimeUtils.Instance.secToTomorrow(this.nowTimestamp, 0);
        let diffTime = time - this.nowTimestamp;

        setTimeout(() => {
            let nowDate = TimeUtils.Instance.secToYMD(this.__getNowTimestamp());
            UserInfo.Instance.setUserjson(UserInfoJsonKey.dailyTaskDate, nowDate);
            EventManager.Instance.emit(EventType.NewDay);
        }, (diffTime + 1) * 1000); //延迟一秒
    }
}
