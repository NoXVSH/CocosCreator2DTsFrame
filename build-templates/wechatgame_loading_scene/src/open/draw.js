
/**
 0	    640x640 的正方形头像
 46	46x46 的正方形头像
 64	64x64 的正方形头像
 96	96x96 的正方形头像
 132	132x132 的正方形头像
 */

function getAvatar(avatarUrl) {
    return avatarUrl.substring(0, avatarUrl.length - 3) + '64';
}

var shortString = function (str, length) {7
    var len = 0;
    var cNum = 0;
    var newStr = '';
    for (var i = 0; i < str.length; i++) {
        if ((str.charCodeAt(i) & 0xff00) != 0) {
            len++;
            cNum++;
        }
        len++;
        if (len === length + 1) {
            newStr += '...';
            break;
        } else if (len === length + 2) {
            newStr += '...';
            break;
        } else {
            newStr += str.charAt(i);
        }
    }
    return newStr;
};

//判断玩家上传数据时间是否过期
function dataOK(uptime, reftime) {
    var dateReg = /\d{4}\-\d{2}\-\d{2}/;
    uptime = dateReg.test(uptime) ? uptime : '2018-04-09';
    return (uptime >= reftime);
}

//分数排序 大-小
function compare(a, b) {//比较函数
    if (a.maxscore < b.maxscore) {
        return 1;
    } else if (a.maxscore > b.maxscore) {
        return -1;
    } else {
        return 0;
    }
}

//分数排序 小-大
function comparesmall(a, b) {//比较函数
    if (a.score > b.score) {
        return 1;
    } else if (a.score < b.score) {
        return -1;
    } else {
        return 0;
    }
}

//段位Id 星星数量 段位分数排序 大-小
function compareLevel(a, b) {//比较函数
    if (parseInt(a.level) != parseInt(b.level)) {
        return parseInt(b.level) - parseInt(a.level);
    }
    else {
        return parseInt(a.userid) - parseInt(b.userid);
    }
}

function mapinfo(d) {
    d.KVDataList.forEach(element => {
        if (element.key === 'level') {
            d["score"] = parseInt(element.value);
        }
        else {
            d[element.key] = element.value;
        }
    });

    //如果玩家上传分数失败
    if (d['userid'] === undefined) {
        d['userid'] = '-1';
    }

    return d;
}
var pagelenMe = 3; //me
var pagelen = 4;    //all
var pageIndex = 0;
var pageIndexMax = 0;
var strLen = 16;

var AllData = null;

var meRankIndex = 0;
var meRankItem = null;
var meRankList = null;

var BeyondIndex = -1;
var BeyondList = null;
var BeyondTimer = null; //显示控制倒计时

var oldotheruserid;


function getMerankList() {

    let tempList = [];
    for(let i = 0; i < AllData.length; i++) {
        if(AllData[i].userid === meRankItem.userid) {
            tempList.push(AllData[i - 1] || null);
            tempList.push(AllData[i]);
            tempList.push(AllData[i + 1] || null);
            break;
        }
    }

    meRankList = tempList;

    // return;

    // if (AllData.length <= pagelenMe) {
    //     meRankList = AllData;
    // } else {
    //     var statrind = 0;
    //     if (meRankIndex == AllData.length - 1) {
    //         statrind = meRankIndex - 2;
    //     }
    //     else {
    //         statrind = meRankIndex - 1;
    //         if (statrind < 0) { statrind = 0 }
    //     }

    //     meRankList = [];
    //     for (let i = statrind; i < statrind + pagelenMe; i++) {
    //         if (i >= 0 && i < AllData.length) {
    //             meRankList.push(AllData[i]);
    //         }
    //         else {
    //             break;
    //         }
    //     }

    // }
}

function sortRank(data, msgdata) {
    meRankIndex = 0;
    meRankItem = null;
    meRankList = null;
    //数据字段导出
    data.map(mapinfo);

    // //数据过期重置
    // data.forEach(element => {
    //     // if (!dataOK(element.time, msgdata.reftime)) {
    //     //     element.score = 0;
    //     // }
    //     element.score = element.maxscore;
    // });

    // if (msgdata.view == "chaoyue") {
    //     data.forEach(function (element, index) {
    //         if (element.caoyue) {//标记位
    //             element.maxscore = msgdata.score;
    //         }
    //     });
    // }

    let tempDate = [];
    data.forEach(element => {
        (element.userid == msgdata.userid || element.score) && tempDate.push(element);
    });
    data = tempDate;

    //分数排序
    data.sort(comparesmall)//从大到小排序

    // if (msgdata.view == "initchaoyue") {
    //     //在第一位加上一个用于超越排行的假数据
    //     let mecurrentscore = []
    //     data.forEach(function (element, index) {
    //         if (element.userid == msgdata.userid) {
    //             //玩家自己的数据
    //             for (let k in element) {
    //                 mecurrentscore[k] = element[k];
    //             }
    //         }
    //     });
    //     mecurrentscore.maxscore = 0;
    //     mecurrentscore.caoyue = true;
    //     data.unshift(mecurrentscore);
    // }

    //排名
    if (data.length > 0) {

        data.forEach(function (element, index) {

            element.rank = index + 1;

            // console.log("element.userid: "+element.userid);
            // console.log("element.nickname: "+element.nickname);
            // console.log("element.maxscore: "+element.maxscore);


            if (msgdata.view == "chaoyue") {
                if (element.caoyue) {
                    //玩家自己的排名
                    meRankItem = element;
                    meRankIndex = index;
                }
                // } else if (element.userid == msgdata.userid) {
            } else if (element.userid == msgdata.userid) {
                //玩家自己的排名
                meRankItem = element;
                meRankIndex = index;
            }
        });

    }

    // console.log('rank = ', data)
    return data;
}

//超越检测排序
function sortBeyond(data, msgdata) {
    //数据字段导出
    data.map(mapinfo);
    //数据过期重置
    data.forEach(element => {
        if (!dataOK(element.time, msgdata.reftime)) {
            element.maxscore = 0;
        }
    });
    BeyondList = []
    data.forEach(element => {
        if (element.maxscore > 0 && element.userid != msgdata.userid) {
            BeyondList.push(element)
        }
    });
    BeyondList.sort(comparesmall)
    console.log('超越检测排序数据 = ', BeyondList)
}

function getPageRankList() {
    var ranklist = [];

    for (let i = pageIndex; i < pageIndex + pagelen; i++) {
        if (i >= 0 && i < AllData.length) {
            ranklist.push(AllData[i]);
        }
        else {
            break;
        }
    }
    //...
    return ranklist
}


var CupPath = 'res/resources/';
var Cups = [
    'Sign_3.png',
    'Sign_4.png',
    'Sign_5.png',
];

var itemh = 122; //每行高度
var offY = -6; //第一行距离顶部的间隔
var textOffY = 70;//文字偏移
var iconsz = 80;//头像大小

var wxImages = []

function drawView(rankList, rankMe, offYY) {
    //处理图片加载慢导致的异常
    wxImages.forEach(img => {
        img.onload = function () { };
    })
    wxImages = [];
    let sharedCanvas = wx.getSharedCanvas();
    let context = sharedCanvas.getContext('2d');
    console.log('开始绘制 shareCanvas size = ', sharedCanvas.width, sharedCanvas.height);
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);

    if (rankMe) {//好友总排行
        // drawItem(context, rankMe, 0, offYY - itemh - 5);
    }

    if (rankList) {
        for (let i = 0; i < rankList.length; i++) {
            drawItem(context, rankList[i], i, offYY);
        }

        if (meRankItem) drawItem(context, meRankItem, 4, offYY); //画玩家自己的排行榜
    }

    //page
    context.textAlign = 'center';
    context.fillStyle = '#3bb085';
    context.font = "30px 汉仪中圆简";
    let max = AllData.length > 0 ? Math.floor((AllData.length - 1) / pagelen) + 1 : 0
    let mix = AllData.length > 0 ? Math.floor(pageIndex / pagelen) + 1 : 0
    // context.fillText(mix + "/" + max, 300, 788);
}

function drawItem(context, item, i, itemOffY) {
    context.font = "24px 汉仪中圆简";
    context.fillStyle = '#FFFFFF';//名次颜色
    context.textAlign = 'center';

    //rank//奖杯
    if (item.rank <= 3) {
        let cup = wx.createImage();
        wxImages.push(cup);
        cup.src = CupPath + Cups[item.rank - 1];
        cup.onload = function () {
            context.drawImage(cup, 38, itemOffY + i * itemh + (itemh - cup.height) / 2, cup.width, cup.height);
        }
    } else {
        let cup = wx.createImage();
        wxImages.push(cup);
        cup.src = CupPath + "Sign_6.png";
        cup.onload = function () {
            context.drawImage(cup, 38, itemOffY + i * itemh + (itemh - cup.height) / 2, cup.width, cup.height);
            context.fillStyle = '#FFFFFF';
            context.font = "24px 汉仪中圆简";
            context.fillText(item.rank, 60, itemOffY + textOffY + i * itemh);
        }
    }

    //icon
    let iconsi = 80;
    let icon = wx.createImage();
    wxImages.push(icon);
    icon.src = getAvatar(item.avatarUrl);
    icon.onload = function () {
        context.drawImage(icon, 115, itemOffY + i * itemh + (itemh - iconsi) / 2, iconsi, iconsi);
    }

    ///name
    context.font = "30px 汉仪中圆简";
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'left';
    context.fillText(shortString(item.nickname, strLen), 225, itemOffY + textOffY + i * itemh);

    //level
    let levelName = `第${item.level}关`;
    context.font = "24px 汉仪中圆简";
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'right';
    context.fillText(levelName, 550, itemOffY + textOffY + i * itemh);

}

//计算字符串长度包含中文，中文算两个
function getByteLen(val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        len += a.match(/[^\x00-\xff]/ig) != null ? 2 : 1;
    }
    return len;
}

//------------------------------------------------
function DrawOver(rankList) {
    console.log('rankList ==', rankList);
    //处理图片加载慢导致的异常
    wxImages.forEach(img => {
        img.onload = function () { };
    });
    wxImages = [];
    let sharedCanvas = wx.getSharedCanvas();
    let context = sharedCanvas.getContext('2d');
    // console.log('开始绘制 shareCanvas size = ', sharedCanvas.width, sharedCanvas.height);
    context.fillStyle = 'red';

    let ofx = 105;
    let headPoxList = [62, 266, 470];
    for (let i = 0; i < rankList.length; i++) {
        if(!rankList[i]){
            continue;
        }

        let item = rankList[i];
        let ofy = i === 1 ? 26 : 56;
        let itemOffX = 180 * i

        // context.fillStyle = '#3bb085';//名次颜色
        // context.textAlign = 'center';
        // context.font = "30px 汉仪中圆简 加粗";
        // //rank
        // context.fillText(item.rank, itemOffX + ofx, 92 - ofy);

        let iconsize = 114, frameOff = 8;
        let headDi = wx.createImage();
        wxImages.push(headDi);
        headDi.src = CupPath + "singleColor.png";
        headDi.onload = function () {
            context.drawImage(headDi, headPoxList[i] - frameOff / 2, ofy - frameOff / 2, iconsize + frameOff, iconsize + frameOff);

            let icon = wx.createImage();
            wxImages.push(icon);
            icon.src = getAvatar(item.avatarUrl);
            icon.onload = function () {
                context.drawImage(icon, headPoxList[i], ofy, iconsize, iconsize);
            }
        }


        // name
        // context.font = "34px 微软雅黑";
        // context.fillText(shortString(item.nickname, strLen), itemOffX + ofx, 227 - ofy);

        //score
        // let di = wx.createImage();
        // wxImages.push(di);
        // di.src = CupPath + "ToXiang-Di1.png";
        // di.onload = function () {
        //     context.drawImage(di, itemOffX + ofx - di.width / 2, 263 - di.height / 2 - ofy, di.width, di.height);
        //     context.fillStyle = '#ffffff';
        //     context.fillText(item.maxscore, itemOffX + ofx, 270 - ofy);
        // }

        let levelStr = `第${item.score}关`, wordSize = 32;
        context.font = wordSize + "px 微软雅黑";
        context.fillStyle = '#655C3A';
        context.textAlign = 'center';
        context.fillText(levelStr, headPoxList[i] + iconsize / 2, ofy + iconsize + 44);
    }
}

function DrawInitChaoyue(rankList) {
    // console.log('DrawInitChaoyue-------- rankList ==', rankList);
    //处理图片加载慢导致的异常
    wxImages.forEach(img => {
        img.onload = function () { };
    })
    wxImages = [];
    let sharedCanvas = wx.getSharedCanvas();
    let context = sharedCanvas.getContext('2d');
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    if (AllData.length > 0) {
        // let di = wx.createImage();
        // wxImages.push(di);
        // di.src = CupPath + "cyToXiang-Kuang.png";
        // di.onload = function () {
        //     context.drawImage(di, 18, 36, 64, 64);

        //     let icon2 = wx.createImage();
        //     wxImages.push(icon2);
        //     icon2.src = getAvatar(AllData[AllData.length - 1].avatarUrl);
        //     icon2.onload = function () {
        //         context.drawImage(icon2, 20, 38, 60, 60);
        //     }
        // }

        let icon2 = wx.createImage();
        wxImages.push(icon2);
        icon2.src = getAvatar(AllData[AllData.length - 1].avatarUrl);
        icon2.onload = function () {
            context.drawImage(icon2, 20, 38, 60, 60);
        }

        oldotheruserid = AllData[AllData.length - 1].userid;
        context.font = "26px 汉仪中圆简";
        context.fillStyle = '#ffaa25';
        context.textAlign = 'center';
        context.fillText(`${AllData[AllData.length - 1].maxscore}`, 50, 125);
        context.font = "22px 汉仪中圆简";
        context.fillStyle = '#3bb085';
        context.fillText(`即将超越`, 50, 23);
    }
}

function DrawChaoyue(rankList) {
    // console.log('DrawChaoyue-------- rankList ==', rankList);


    let mescore = 0;
    if (rankList.length == 1) {

        mescore = rankList[0].maxscore
        if (oldotheruserid) {
            // 将“即将超越”替换为“独孤求败”并去掉别人的头像和分数
            //处理图片加载慢导致的异常
            wxImages.forEach(img => {
                img.onload = function () { };
            })
            wxImages = [];

            let sharedCanvas = wx.getSharedCanvas();
            let context = sharedCanvas.getContext('2d');
            context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);

            // console.log('开始绘制 shareCanvas size = ', sharedCanvas.width, sharedCanvas.height);
            // 头像
            // let di = wx.createImage();
            // wxImages.push(di);
            // di.src = CupPath + "cyToXiang-Kuang.png";
            // di.onload = function () {
            //     context.drawImage(di, 18, 36, 64, 64);

            //     let icon2 = wx.createImage();
            //     icon2.src = getAvatar(rankList[0].avatarUrl);
            //     icon2.onload = function () {
            //         context.drawImage(icon2, 20, 38, 60, 60);
            //     }
            // }

            let icon2 = wx.createImage();
            wxImages.push(icon2);
            icon2.src = getAvatar(rankList[0].avatarUrl);
            icon2.onload = function () {
                context.drawImage(icon2, 20, 38, 60, 60);
            }


            // 分数
            context.font = "26px 汉仪中圆简";
            context.textAlign = 'center';
            context.fillStyle = '#ffaa25';
            context.fillText(`${rankList[0].maxscore}`, 50, 125);
            // 排名
            context.font = "22px 汉仪中圆简";
            context.fillStyle = '#3bb085';
            context.fillText(`独孤求败`, 50, 23);
        }
    } else {
        mescore = rankList[1].maxscore
        // 检测是否超过一个新的玩家
        if (oldotheruserid !== rankList[0].userid) {
            //处理图片加载慢导致的异常
            wxImages.forEach(img => {
                img.onload = function () { };
            })
            wxImages = [];

            let sharedCanvas = wx.getSharedCanvas();
            let context = sharedCanvas.getContext('2d');
            context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
            oldotheruserid = rankList[0].userid
            // // 刷新别人的头像
            // let di = wx.createImage();
            // wxImages.push(di);
            // di.src = CupPath + "cyToXiang-Kuang.png";
            // di.onload = function () {
            //     context.drawImage(di, 18, 36, 64, 64);

            //     let icon2 = wx.createImage();
            //     wxImages.push(icon2);
            //     icon2.src = getAvatar(rankList[0].avatarUrl);
            //     icon2.onload = function () {
            //         context.drawImage(icon2, 20, 38, 60, 60);
            //     }
            // }

            let icon2 = wx.createImage();
            wxImages.push(icon2);
            icon2.src = getAvatar(rankList[0].avatarUrl);
            icon2.onload = function () {
                context.drawImage(icon2, 20, 38, 60, 60);
            }

            oldotheruserid = rankList[0].userid
            // 刷新别人的分数
            context.font = "26px 汉仪中圆简";
            context.textAlign = 'center';
            context.fillStyle = '#FFFFFF';
            context.fillText(`${rankList[0].maxscore}`, 50, 125);
            context.font = "22px 汉仪中圆简";
            context.fillText(`即将超越`, 50, 23);
        }
    }
}

function drawWxHead(meRankItem) {
    if (meRankItem == null) {
        console.log("未获取到玩家自身排行信息");
        return;
    }

    wxImages.forEach(img => {
        img.onload = function () { };
    })
    wxImages = [];
    let sharedCanvas = wx.getSharedCanvas();
    let context = sharedCanvas.getContext('2d');
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    console.log('开始绘制 shareCanvas size = ', sharedCanvas.width, sharedCanvas.height);

    let icon = wx.createImage();
    wxImages.push(icon);
    icon.src = getAvatar(meRankItem.avatarUrl);
    icon.onload = function () {
        context.drawImage(icon, 0, 0, 100, 100);
    }
}

exports.setData = function (data, msg) {
    AllData = sortRank(data, msg);
    getMerankList();
    pageIndexMax = AllData.length > 0 ? Math.floor((AllData.length - 1) / pagelen) * pagelen : 0;
}

function getChaoyue() {
    var statrind = meRankIndex - 1;
    if (statrind < 0) { statrind = 0 }
    var list = [];
    for (let i = statrind; i <= meRankIndex; i++) {
        if (i >= 0 && i < AllData.length) {
            list.push(AllData[i]);
        }
        else {
            break;
        }
    }
    return list;
}

exports.draw = function (view, msgdata) {
    if (view === 'me') {
        pageIndex = 0;
        DrawOver(meRankList);
    }
    else if (view === 'initchaoyue') {
        pageIndex = 0;
        // DrawInitChaoyue(getChaoyue());
        DrawInitChaoyue();
    }
    else if (view === 'chaoyue') {
        AllData = sortRank(AllData, msgdata);
        pageIndex = 0;
        DrawChaoyue(getChaoyue());
    }
    else if (view === 'all') {
        pageIndex = 0;
        drawView(getPageRankList(), meRankItem, offY);
    }
    else if (view === 'prePage') {
        pageIndex -= pagelen;
        if (pageIndex < 0) { pageIndex = 0; }
        drawView(getPageRankList(), meRankItem, offY);
    }
    else if (view === 'nextPage') {
        pageIndex += pagelen;
        if (pageIndex > pageIndexMax) { pageIndex = pageIndexMax; }
        drawView(getPageRankList(), meRankItem, offY);
    }
    else if (view === 'myhead') {
        drawWxHead(meRankItem);
    }

    exports.setBeyondData = function (data, msg) {
        let sharedCanvas = wx.getSharedCanvas();
        let context = sharedCanvas.getContext('2d');
        context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);

        BeyondIndex = -1;
        sortBeyond(data, msg)
    }

    exports.BeyondCheck = function (jumpscore) {
        var beyondUser = null;
        if (!BeyondList) return;
        for (let index = 0; index < BeyondList.length; index++) {
            //console.log('check = ', index, BeyondList[index].score, BeyondIndex)
            if (BeyondList[index].score >= jumpscore) {
                if (BeyondIndex != index - 1) {
                    BeyondIndex = index - 1;
                    //beyondUser = BeyondList[BeyondIndex];
                    console.log('超越================')
                }
                break;
            }
        }

        if (beyondUser) {
            console.log('超越玩家 = ', beyondUser)

            //处理图片加载慢导致的异常
            wxImages.forEach(img => {
                img.onload = function () { };
            })
            wxImages = [];
            if (BeyondTimer) {
                clearTimeout(BeyondTimer);
            }

            let sharedCanvas = wx.getSharedCanvas();
            let context = sharedCanvas.getContext('2d');
            console.log('开始绘制 shareCanvas size = ', sharedCanvas.width, sharedCanvas.height);
            context.fillStyle = 'red';

            //icon
            let icon = wx.createImage();
            wxImages.push(icon);
            icon.src = getAvatar(beyondUser.avatarUrl);
            let iconsz = 68;
            icon.onload = function () {
                context.drawImage(icon, 0, 32, iconsz, iconsz);

                context.textAlign = 'left';
                context.font = "24px 汉仪中圆简";
                context.fillStyle = 'black';
                context.fillText('超越', 2, 24);
                context.fillStyle = 'white';
                context.fillText('超越', 0, 22);

                //-----显示一段时间后隐藏
                BeyondTimer = setTimeout(function () {
                    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
                }, 1000);

            }

        }

    }

    exports.DrawBeyondList = function () {
        //处理图片加载慢导致的异常
        wxImages.forEach(img => {
            img.onload = function () { };
        });
        wxImages = [];
        let sharedCanvas = wx.getSharedCanvas();
        let context = sharedCanvas.getContext('2d');
        console.log('开始绘制 shareCanvas size = ', sharedCanvas.width, sharedCanvas.height);
        context.fillStyle = 'red';

        if (BeyondIndex >= 0) {
            var startind = -1;
            if (BeyondIndex >= 4) {
                startind = BeyondIndex - 4;
            }
            else {
                startind = 0;
            }
            var beyond = BeyondIndex - startind + 1;
            var msg = `排名新超越 ${beyond} 位好友`;
            context.textAlign = 'center';
            context.font = "26px 汉仪中圆简";
            context.fillStyle = 'white';
            context.fillText(msg, sharedCanvas.width / 2, 30);

            var x = (sharedCanvas.width - beyond * 68 - (beyond - 1) * 10) / 2;
            for (let i = startind; i <= BeyondIndex; i++) {
                //画出每个超越玩家
                let icon = wx.createImage();
                wxImages.push(icon);
                icon.src = getAvatar(BeyondList[i].avatarUrl);
                let iconsz = 68;
                icon.onload = function () {
                    context.drawImage(icon, x + (i - startind) * 78, 65, iconsz, iconsz);
                }


            }

        }
        else {
            console.log('没有超越玩家')
        }

    }
}

