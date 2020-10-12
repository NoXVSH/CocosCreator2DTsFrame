import QueueExternalLoader from "../core/loader/QueueExternalLoader";
import QueueLoader from "../core/loader/QueueLoader";
import { BundleName } from "../core/loader/LoaderConst";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('SelfComponent/IconLoader')
export default class IconLoader extends cc.Component {
    _sprite: cc.Sprite;
    url: string;

    @property(cc.Boolean)
    isLoadFromEditor: boolean = false;

    @property(cc.Boolean)
    isPackable: boolean = false;

    @property
    editorUrl: string = "这里填图片路径";

    @property
    isExternal: boolean = false;  //是否外部加载

    type : string | typeof cc.Asset;
    tick: number;

    onLoad() {
        if (this.isLoadFromEditor) this.setIcon(this.editorUrl);
    }

    setIcon(url: string, callback?: Function) {
        if (this.url == url) return;

        if (!this._sprite) {
            this._sprite = this.node.getOrAddComponent(cc.Sprite);
        }

        this.clear();
        this.loadAsset(url, callback);
    }

    loadAsset(url: string, callback: Function) {
        this.url = url;

        let loadCompleteCb = (texture) => {
            if (cc.isValid(this._sprite) && texture) {
                texture.packable = this.isPackable;
                this._sprite.spriteFrame = new cc.SpriteFrame(texture);
                callback && callback();
            }
        };

        if(this.isExternal) {
            this.tick = QueueExternalLoader.Instance.load(url, this.type, (texture : cc.Texture2D) => {
                loadCompleteCb(texture);
            });
        }
        else {
            this.tick = QueueLoader.Instance.load(url, BundleName.RemoteRes, this.type, (texture : cc.Texture2D) => {
                loadCompleteCb(texture);
            });
        }
    }

    private clear() {
        if (this.url != null) {
            this.isExternal ? QueueExternalLoader.Instance.unload(this.tick) : QueueLoader.Instance.unload(this.tick);
            this.tick = null;
            this.url = null;
        }
    }

    recycle() {
        if (!this._sprite) return;

        this._sprite.spriteFrame = null;
        this.clear();
    }

    onDestroy() {
        this.clear();
    }
}


