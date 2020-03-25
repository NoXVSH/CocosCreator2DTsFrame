var show = require('draw');

var klist = ['userid', 'score', 'maxscore', 'time', 'playerIocn', 'level'];

wx.onMessage(msgdata => {
    // console.log('open data cmd = ', msgdata)
    var cmd = msgdata.cmd;

    if (cmd === 'friendrank') {
        wx.getFriendCloudStorage({
            keyList: klist,
            success: function (res) {
                show.setData(res.data, msgdata);
                show.draw(msgdata.view);
            },
            fail: (data) => {
                console.log("获取好友排行榜数据失败");
                console.log(data);
            },
            complete: () => {
                console.log("获取排行榜数据结束");
            },
        })

    }
    else if (cmd === 'grouprank') {
        wx.getGroupCloudStorage({
            shareTicket: msgdata.shareTicket,
            keyList: klist,
            success: function (res) {
                show.setData(res.data, msgdata);
                show.draw(msgdata.view);
            },
            fail: (data) => {
                console.log("获取群排行榜数据失败");
                console.log(data);
            },
            complete: () => {
                console.log("获取排行榜数据结束");
            },
        })
    }
    else if (cmd === "chaoyue") {
        show.draw('chaoyue', msgdata);
    }
    else if (cmd === 'clear') {
        let sharedCanvas = wx.getSharedCanvas();
        let context = sharedCanvas.getContext('2d');
        context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    }
    else if (cmd === 'page') {
        if (msgdata.index == 1) {
            show.draw('nextPage');
        }
        else if (msgdata.index == -1) {
            show.draw('prePage');
        }
    }
    else if (cmd === 'beyondinit') {
        if (msgdata.datasource === 'friendrank') {
            wx.getFriendCloudStorage({
                keyList: klist,
                success: function (res) {
                    show.setBeyondData(res.data, msgdata);
                }
            })
        }
        else if (msgdata.datasource === 'grouprank') {
            wx.getGroupCloudStorage({
                shareTicket: msgdata.shareTicket,
                keyList: klist,
                success: function (res) {
                    show.setBeyondData(res.data, msgdata);
                }
            })
        }
    }
    else if (cmd === 'beyondcheck') {
        show.BeyondCheck(msgdata.score);
    }
    else if (cmd === 'beyondlist') {
        show.DrawBeyondList();
    }
    else if (cmd === 'myhead') {
        wx.getFriendCloudStorage({
            keyList: klist,
            success: function (res) {
                show.setData(res.data, msgdata);
                show.draw(msgdata.view);
            },
            fail: (data) => {
                console.log("获取好友排行榜数据失败");
                console.log(data);
            },
            complete: () => {
                console.log("获取排行榜数据结束");
            },
        })
    }
});
