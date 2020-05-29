import QueueExternalLoader from "../core/loader/QueueExternalLoader";
import QueueLoader from "../core/loader/QueueLoader";
import QueueLoaderBase from "../core/loader/QueueLoaderBase";

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
    isExternal: boolean = false;  //是否外部加载(通过cc.loader.load)

    loader : QueueLoaderBase;
    type : string | typeof cc.Asset;
    tick: number;

    onLoad() {
        if (this.isLoadFromEditor) this.setIcon(this.editorUrl);
    }

    setLoader() {
        if(this.loader != null)return;
        
        if(this.isExternal) {
            this.loader = QueueExternalLoader.Instance;
            this.type = ``;
        }
        else {
            this.loader = QueueLoader.Instance;
            this.type = cc.Texture2D;
        }
    }

    setIcon(url: string, callback?: Function) {
        if (this.url == url) return;
        
        this.setLoader();

        if (!this._sprite) {
            this._sprite = this.node.getOrAddComponent(cc.Sprite);
        }

        this.clear();
        this.loadAsset(url, callback);
    }

    loadAsset(url: string, callback: Function) {
        this.url = url;
        this.tick = this.loader.load(url, this.type, (texture : cc.Texture2D) => {
            if (cc.isValid(this._sprite) && texture) {
                texture.packable = this.isPackable;
                this._sprite.spriteFrame = new cc.SpriteFrame(texture);
                callback && callback();
            }
        });
    }

    private clear(force : boolean = false) {
        if (this.url != null) {
            this.loader.unload(this.tick, force);
            this.tick = null;
            this.url = null;
        }
    }

    recycle(force : boolean = false) {
        if (!this._sprite) return;

        this._sprite.spriteFrame = null;
        this.clear(force);
    }

    onDestroy() {
        this.clear();
    }
}


