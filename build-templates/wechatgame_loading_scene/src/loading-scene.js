var loadingBg = `res/resources/logo.png`;

var scene = new cc.Scene();
//1.新增Canvas组件
var root = new cc.Node();
var canvas = root.addComponent(cc.Canvas);
root.parent = scene;

var logo = new cc.Node();
logo.parent = root;
logo.x = 0, logo.y = 113;

var logoSp = logo.addComponent(cc.Sprite);
var createImage = function(sprite, url) {
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        let image = wx.createImage();
        image.onload = function () {
            let texture = new cc.Texture2D();
            texture.initWithElement(image);
            texture.handleLoadedTexture();
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        };
        image.src = url;
    }
}
createImage(logoSp, loadingBg);

var labelNode = new cc.Node();
labelNode.parent = root;
labelNode.x = 0, labelNode.y = 15;

var labelCom = labelNode.addComponent(cc.Label);
labelCom.fontSize = 24;
labelCom.string = "正在加载中... 0%";

//3.预加载场景
scene.loadinglaunchScene = function(launchScene){
    cc.director.preloadScene(launchScene, (completedCount, totalCount, item)=>{
        labelCom.string = "正在加载中..." + parseInt((completedCount / totalCount) * 100)  + "%";
        // console.log("加载中..."+ parseInt((completedCount/totalCount)*100) + "%");
    }, (error)=>{
        if(error){
            console.log('==preloadScene error==', launchScene, error)
        }
        cc.director.loadScene(launchScene, null,function () {
                cc.loader.onProgress = null;
                console.log('Success to load scene: ' + launchScene);
            }
        );
    })
}

module.exports = scene;