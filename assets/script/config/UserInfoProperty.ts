let property = {
    userid: 0,
    imgindex: 0,
    score: 0,
    maxscore: 0,
    userjson: {
        gold: 100, //初始金币
        energy: 0,
        energyRecoverTime: 0,

        watchVideoCount: 0,
        
        dailyTaskDate: "2019-01-01",

        isGM: false,

        dataVersion: "",
    },
    //////////////////////
    reftime: 0, // 分数刷新时间
    phone_brand: "",//手机品牌
    phone_model: "",//手机型号
    wx_version: "",//微信版本号
    platform: "ios",//"android",
    name: "", //平台用户名称
    imgpath: "", //平台用户头像
};

export default property;
