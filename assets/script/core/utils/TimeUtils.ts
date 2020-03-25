const DAY_SEC = 3600 * 24;
//服务器时区， 默认为东八区
const TIME_ZONE = 8;
export default class TimeUtils {
    private static _instance: TimeUtils;

    static get Instance(): TimeUtils {
        if (this._instance == null) {
            this._instance = new TimeUtils();
        }

        return this._instance;
    }

    secondToDate(value: number): Date {
        return new Date(value * 1000);
    }

    //天:时:分:秒:毫秒
    msToTimeStr(msTime: number): string {
        if (msTime < 0) msTime = 0;
        let d = Math.floor(msTime / 1000 / 60 / 60 / 24);
        let h = Math.floor(msTime / 1000 / 60 / 60 % 24);
        let m = Math.floor(msTime / 1000 / 60 % 60);
        let s = Math.floor(msTime / 1000 % 60);
        let ms: number | string = Math.floor(msTime % 1000);

        let str = "";
        if (ms < 10) {
            ms = "00" + ms;
        }
        else if (ms >= 10 && ms < 100) {
            ms = "0" + ms;
        }
        else {
            ms = "" + ms;
        }

        ms = ms.substring(0, ms.length - 1);
        str = ms + str;

        if (s < 10) {
            str = "0" + s + ":" + str;
        }
        else {
            str = s + ":" + str;
        }

        if (m < 10) {
            str = "0" + m + ":" + str;
        }
        else {
            str = m + ":" + str;
        }

        if (h != 0) {
            if (h < 10) {
                str = "0" + h + ":" + str;
            }
            else {
                str = h + ":" + str;
            }
        }

        if (d != 0) {
            str = d + ":" + str;
        }

        return str;
    }

    //时:分:秒
    parseTimeStr(time: number, h: boolean = true): string {
        if (time < 0) time = 0;
        let ret: string | number = "";
        //s
        let value = parseInt((time % 60).toString());
        ret = value < 10 ? "0" + value : value;
        //m
        time = parseInt((time / 60).toString());
        value = time % 60;
        ret = (value < 10 ? "0" + value : value) + ":" + ret;
        //h
        if (!h) return ret;
        time = parseInt((time / 60).toString());
        value = time;
        ret = (value < 10 ? "0" + value : value) + ":" + ret;
        return ret;
    }

    //天:时:分:秒
    parseDateTimeStr(time: number): string {
        let minute = 60;
        let hour = minute * 60;
        let day = hour * 24;
        let dayC = parseInt((time / day).toString());
        let hourC = parseInt(((time - dayC * day) / hour).toString());
        let minC = parseInt(((time - dayC * day - hourC * hour) / minute).toString());
        let ret = "";
        //s
        let value = time % 60;
        ret = value < 10 ? ":0" + value : ":" + value;
        //m
        ret = (minC < 10 ? ":0" + minC : ":" + minC) + ret;
        //h
        ret = (hourC < 10 ? "0" + hourC : hourC) + ret;
        //day
        ret = (dayC > 0 ? dayC : "") + ret;
        return ret;
    }

    // 年月日
    parseTimeToDate(time: number): any {
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        return {year: year, month: month, day: day};
    }

    //帧数转毫秒
    frameToMSec(frame: number, fps: number): number {
        if (fps == null) fps = 15;
        return parseInt((1 / fps * frame * 1000).toString());
    }

    //毫秒转帧数
    msecToFrame(ms: number, fps: number) {
        return parseInt((fps * ms / 1000).toString());
    }

    //与本地时间判断，是否在本地时间的前一天
    chickeTimeToDayByLocalTime(times: number): boolean {
        let d1 = new Date(times * 1000);
        let d2 = new Date();
        return this.isOverDay(d1, d2);
    }

    //判断两个date, date1是否在date2前面一天或者以上
    isOverDay(date1: Date, date2: Date): boolean {
        return (date1.getFullYear() < date2.getFullYear() ||
            date1.getMonth() < date2.getMonth() ||
            date1.getDate() < date2.getDate());
    }

    //判断times1与times2两个时间戳相差多少天, 传入的时间为毫秒级别(以到0点算为一天)
    calculateDifferenceDayByTime(time1: number, time2: number): number {
        let day1 = time1 / 86400000;
        let day2 = time2 / 86400000;
        let offset = parseInt((day1 - day2).toString());
        return Math.abs(offset); //24 * 60 * 60 * 1000
    }

    //分:秒
    parseMinuteStr(time: number, separ: string = ":"): string {
        let ret = "";
        //s
        let value = parseInt((time % 60).toString());
        ret = value < 10 ? separ + "0" + value : separ + value;
        //m
        value = parseInt(((time - value) / 60).toString());
        ret = (value < 10 ? "0" + value : value) + ret;
        return ret;
    }

    //当天凌晨时间 时间戳 秒
    getNowDayStartTime(): number {
        let nowDate = new Date(Date.now());
        let nowDayStartDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0);
        return nowDayStartDate.getTime() / 1000;
    }

    /**秒转时分秒, 格式：00:00
     *
     */
    secToMS(time) {
        let m = Math.round((time) / 60);
        let s = Math.round((time - (m * 60)));
        return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    /**
     * 秒转时分秒, 格式：00:00:00
     */
    secToHMS(s) {
        if (s < 0)
            s = 0;
        let h = Math.round(s / 3600);
        let m = Math.round((s - h * 3600) / 60);
        let sec = Math.round(s - (h * 3600 + m * 60));

        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
    }

    /**
     * 秒转时分, 格式：00:00  忽略秒数
     */
    secToHM(s) {
        if (s < 0)
            s = 0;
        let h = Math.round(s / 3600);
        let m = Math.round((s - h * 3600) / 60);
        let sec = Math.round(s - (h * 3600 + m * 60));

        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
    }

    /**秒转年月日, 格式：0000-00-00
     * s不传参则转化当前本地时间
     */
    secToYMD(s = 0) {
        let now = this.getAbsTime(s * 1000),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate();

        return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
    }

    secToYMDHMS(s = 0) {
        let now = this.getAbsTime(s * 1000),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate(),
            h = now.getHours(),
            min = now.getMinutes(),
            sec = now.getSeconds();

        return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + (h < 10 ? "0" + h : h) + ":" + (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
    }

    //获取时间串，日期加小时，单位秒：2018-01-01 9
    getDateHoursStamp(s = 0, splitStr = "-") {
        let now = this.getAbsTime(s * 1000),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate(),
            h = now.getHours();
        return y + splitStr + (m < 10 ? "0" + m : m) + splitStr + (d < 10 ? "0" + d : d) + " " + h;
    }

    /**秒转日, 格式：0天
     * s不传参则转化当前本地时间
     */
    secToD(s = 0) {
        let now = this.getAbsTime(s * 1000),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate() - 1;

        return (d < 10 ? "0" + d : d) + "天";
    }

    //获取当天结束时间，单位毫秒
    leftTodayEndTime(s, endHours = 0) {
        let now = this.getAbsTime(s);
        let next = this.getAbsTime(s);
        if (endHours > 0) {
            if (next.getHours() >= endHours) {
                next.setHours(24 + endHours);
            } else {
                next.setHours(endHours);
            }
        } else {
            next.setHours(24);
        }
        next.setMinutes(0);
        next.setSeconds(0);
        return next.getTime() - now.getTime();
    }

    //获取当天开始时间，单位毫秒
    leftTodayOpenTime(s) {
        let now = this.getAbsTime(s);
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now.getTime();
    }

    //获取当前的小时数，单位毫秒
    getAbsHour(s) {
        let now = this.getAbsTime(s);
        return now.getHours();
    }

    /**
     * 获取绝对时间
     * 即无论你在哪个时区，得到的时间和京8区的时间一致
     * @param {Date} time
     * @returns {Date}
     */
    getAbsTime(time) {
        let currentZoneTime;
        if (time) {
            currentZoneTime = new Date(time);
        } else {
            currentZoneTime = new Date();
        }

        let currentZoneHours = currentZoneTime.getHours();
        let offsetZone = currentZoneTime.getTimezoneOffset() / 60;

        if (offsetZone > 0) {
            // 大于0的是西区（西区晚） 西区应该用时区绝对值加京八区 重新设置时间
            // 西区时间比东区时间晚 所以加时区间隔
            offsetZone = offsetZone + TIME_ZONE;
            currentZoneTime.setHours(currentZoneHours + offsetZone)
        } else {
            // 小于0的是东区（东区早）  东区时间直接跟京八区相加
            offsetZone += TIME_ZONE;
            currentZoneTime.setHours(currentZoneHours + offsetZone);
        }
        return currentZoneTime;
    }

    /**
     * 日期解析，字符串转日期
     * @param dateString 可以为2017-02-16，2017/02/16，2017.02.16
     * @returns {Date} 返回对应的日期对象
     */
    dateParse(dateString) {
        let SEPARATOR_BAR = "-";
        let SEPARATOR_SLASH = "/";
        let SEPARATOR_DOT = ".";
        let dateArray;
        if (dateString.indexOf(SEPARATOR_BAR) > -1) {
            dateArray = dateString.split(SEPARATOR_BAR);
        } else if (dateString.indexOf(SEPARATOR_SLASH) > -1) {
            dateArray = dateString.split(SEPARATOR_SLASH);
        } else {
            dateArray = dateString.split(SEPARATOR_DOT);
        }
        return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
    }

    /**
     * 秒转倒计时
     */
    secToLeftFormat(sec) {
        if (sec < DAY_SEC) {
            return this.secToHMS(sec);
        }
        else {
            let day = Math.floor(sec / DAY_SEC);
            let leftSec = sec % DAY_SEC;
            let hour = Math.floor(leftSec / 3600);
            leftSec = leftSec % 3600;
            let minute = Math.floor(leftSec / 60);
            return day.toString().concat("天", String(hour), "小时", String(minute), "分钟");
        }
    }

    setZeroMSMI(date) {
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    }

    /**
     * 明天个整点时间戳
     * @param sec 当前时间戳
     * @param hour 小时
     * @returns {number}
     */
    secToTomorrow(sec, hour) {
        let date = new Date(sec * 1000);
        date.setDate(new Date(sec * 1000 - hour * 3600000).getDate() + 1);
        date.setHours(hour);
        this.setZeroMSMI(date);
        return date.getTime() * 0.001;
    }

    /**
     * 下周几某个整点时间戳
     * @param sec 当前时间戳
     * @param week 下周几 range：1~7
     * @param hour 小时
     * @returns {number}
     */
    secToNextWeek(sec, week, hour) {
        let date = new Date(sec * 1000);
        let offsetTime = new Date(sec * 1000 - hour * 3600000);
        let nowDay = offsetTime.getDay();
        date.setHours(hour);
        this.setZeroMSMI(date);
        date.setDate(offsetTime.getDate() + (7 - nowDay) % 7 + week);
        return date.getTime() * 0.001;
    }

    /**
     * 下个月第几天某个整点时间戳
     * @param sec 当前时间戳
     * @param day 下个月第几天
     * @param hour 小时
     * @returns {number}
     */
    secToNextMonth(sec, day, hour) {
        let date = new Date(sec * 1000);
        date.setDate(day);
        date.setHours(hour);
        this.setZeroMSMI(date);
        date.setMonth(new Date(sec * 1000 - hour * 3600000).getMonth() + 1);
        return date.getTime() * 0.001;
    }

    /**
     * xxx时间前
     */
    getProTime(sec) {
        let curTime = (new Date().getTime()) / 1000; //秒
        let lostTime = (curTime - sec) / 60; //分
        if (lostTime > 24 * 60) {
            //xx天前
            let day = Math.floor(lostTime / (24 * 60));
            day = day > 30 ? 30 : day;
            return day + "天前";
        } else if (lostTime > 60) {
            //xx小时前
            let hour = Math.floor(lostTime / 60);
            return hour + "小时前";
        } else {
            //xx分钟前
            let min = Math.floor(lostTime);
            if (min < 1) {
                return "刚刚";
            }
            return min + "分钟前";
        }
    }

    /**
     * xxx倒计时，大于一天返回n天，小于一天显示00:00:00
     * @param sec 剩余时间/s
     * @returns {string}
     */
    getCountDownTime(sec) {
        if (sec > 24 * 3600) {
            let day = Math.ceil(sec / (24 * 3600));
            return day + "天";
        } else if (sec >= 0) {
            let h = Math.floor(sec / 3600);
            let m = Math.floor((sec - h * 3600) / 60);
            let s = sec - (h * 3600 + m * 60);
            return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`
        }
    }

    //获取时分秒时间戳，单位毫秒
    getHoursTime(timestamp, hours = 0, min = 0, sec = 0, msc = 0) {
        let now = this.getAbsTime(timestamp);
        now.setHours(hours);
        now.setMinutes(min);
        now.setSeconds(sec);
        now.setMilliseconds(msc);
        return now.getTime();
    }

}

window.regVar("TimeUtils", TimeUtils);
