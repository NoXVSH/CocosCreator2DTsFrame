import ModuleManager from "../core/module/ModuleManager";

const {ccclass, property} = cc._decorator;
let _textureIdMapDataContainer = {}

@ccclass
export default class MatrixHitTest extends cc.Component {

    onLoad() {
        let spriteComp = this.node.getComponent(cc.Sprite)
        if (spriteComp.type !== cc.Sprite.Type.SIMPLE || spriteComp.sizeMode !== cc.Sprite.SizeMode.RAW){
            throw "目前仅支持sprite SizeMode 为RAW, type 为SIMPLE的方式"
        }
        (<any>this.node)._hitTest = this.hitTest.bind(this);
    }

    hitTest(location) {
        let spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame
        if (spriteFrame == null) {
            return false;
        }

        let camera : cc.Camera = cc.Camera.main;
        location = camera.getScreenToWorldPoint(location);

        let posInNode = this.node.convertToNodeSpaceAR(location);
        let rect = spriteFrame.getRect();
        let offset = spriteFrame.getOffset();

        // cc.log("--", "posInNode", this.node.convertToNodeSpaceAR(cc.v2(0, 0)))

        if ((posInNode.x < offset.x - rect.width / 2) || (posInNode.y < offset.y - rect.height / 2)
            || (posInNode.x > (offset.x + rect.width / 2)) || (posInNode.y > (offset.y + rect.height / 2))) {
            return false;
        }
        else {
            let posInRect = cc.v2(parseInt(posInNode.x - offset.x + rect.width / 2 + ""), parseInt(posInNode.y - offset.y + rect.height / 2 + ""))

            let tex = spriteFrame.getTexture()
            let data

            if (tex instanceof cc.RenderTexture) {
            // if (false) {  // 细图(width <= 512 && height <= 512) 被引擎自动打包了
                if (cc.sys.platform === cc.sys.QQ_PLAY) { // 玩一玩平台
                    throw "在玩一玩平台，请确保你的SpriteFrame 的宽高至少有一个大于512, 这样不会被Atlas, 不然被引擎自动Atlas之后，因为玩一玩不支持gl.readPixels 或 getImageData这样的接口，像素就读不出来了"
                }

                // data就是这个texture的rgba值数组
                if (spriteFrame.isRotated()) {
                    data = tex.readPixels(null, rect.x + posInRect.y, rect.y + posInRect.x, 1, 1)
                }
                else {
                    data = tex.readPixels(null, rect.x + posInRect.x, rect.y + rect.height - posInRect.y, 1, 1)
                }
            }
            else {
                var dataContainer = _textureIdMapDataContainer[(<any>tex).getId()]

                if (cc.sys.platform === cc.sys.QQ_PLAY) { // 针对玩一玩的特殊方式
                    if (!dataContainer) {
                        (<any>tex).getHtmlElementObj().bkImage || (<any>tex).getHtmlElementObj()._generateBKImage()
                        dataContainer = (<any>tex).getHtmlElementObj().bkImage
                        _textureIdMapDataContainer[(<any>tex).getId()] = dataContainer
                    }

                    var buffer = dataContainer.buffer
                    buffer.rewind()

                    if (spriteFrame.isRotated()) {
                        buffer.jumpBytes(((rect.x + posInRect.y) + (rect.y + posInRect.x) * tex.width) * 4)
                    } else {
                        buffer.jumpBytes(((rect.x + posInRect.x) + (rect.y + rect.height - posInRect.y) * tex.width) * 4)
                    }

                    data = [buffer.readUint8Buffer(), buffer.readUint8Buffer(), buffer.readUint8Buffer(), buffer.readUint8Buffer()]
                }
                else {
                    //Canvas 方式
                    var scale = 8
                    var cvs = dataContainer
                    if (!cvs) {
                        cvs = document.createElement("canvas")
                        var ctx = cvs.getContext('2d')
                        cvs.width = tex.width
                        cvs.height = tex.height
                        ctx.drawImage(tex.getHtmlElementObj(), 0, 0, tex.width, tex.height, 0, 0, tex.width / scale, tex.height / scale)
                        _textureIdMapDataContainer[(<any>tex).getId()] = cvs
                    }

                    var ctx = cvs.getContext('2d')
                    if (spriteFrame.isRotated()) {
                        data = ctx.getImageData((rect.x + posInRect.y) / scale, (rect.y + posInRect.x) / scale, 1, 1).data
                    }
                    else {
                        data = ctx.getImageData((rect.x + posInRect.x) / scale, (rect.y + rect.height - posInRect.y) / scale, 1, 1).data
                    }

                    /*
                    //RenderTexture 方式
                    var rt = dataContainer
                    if (!rt){
                        rt = new cc.RenderTexture()
                        rt.initWithSize(tex.width, tex.height)
                        rt.drawTextureAt(tex, 0, 0)
                        _textureIdMapDataContainer[tex.getId()] = rt
                    }
        
                    // data就是这个texture的rgba值数组
                    if (spriteFrame.isRotated()) {
                        data = rt.readPixels(null, rect.x + posInRect.y, rect.y + posInRect.x, 1, 1)
                        //cc.log(type + "--", "data", data, rect.x + posInRect.y, rect.y + posInRect.x)
                    }
                    else {
                        data = rt.readPixels(null, rect.x + posInRect.x, rect.y + rect.height - posInRect.y, 1, 1)
                        //cc.log(type + "--", "data", data, rect.x + posInRect.x, rect.y + rect.height - posInRect.y)
                    }
                    */
                }
            }

            if (data[3] <= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    onDisable() {
        // log("DecorateHitTest onDisable")

        let spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame
        if (spriteFrame == null) {
            return false
        }

        var tex = spriteFrame.getTexture()
        if (cc.sys.platform === cc.sys.QQ_PLAY) { // 针对玩一玩的特殊方式
            var img = _textureIdMapDataContainer[(<any>tex).getId()]
            if (img) {
                log("DecorateHitTest onDisable QQ bkImage")
                img.dispose()
                _textureIdMapDataContainer[(<any>tex).getId()] = null
            }
        }
        else {
            var dataContainer = _textureIdMapDataContainer[(<any>tex).getId()]
            if (dataContainer) {
                if (dataContainer instanceof cc.RenderTexture) { // RenderTexture 方式
                    log("DecorateHitTest onDisable renderTexture")
                    dataContainer.destroy()
                }
                else { // Canvas 方式
                    log("DecorateHitTest onDisable canvas")
                }
            }

            _textureIdMapDataContainer[(<any>tex).getId()] = null
        }
    }

}



