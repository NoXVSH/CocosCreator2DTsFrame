const {ccclass, property} = cc._decorator;

@ccclass
export default class CullingListItem extends cc.Component {
    _container: cc.Node;
    _parent: cc.Node;
    _listPosition: cc.Vec2;
    _maskRect: cc.Rect;
    
    start() {
        let children = [];
        for (let i = 0, len = this.node.childrenCount; i < len; i++) {
            children.push(this.node.children[i]);
        }

        this.node.removeAllChildren();

        this._container = new cc.Node();
        this.node.addChild(this._container);

        for (let j = 0, len = children.length; j < len; j++) {
            this._container.addChild(children[j]);
        }

        this.checkShow();
    }

    onEnable() {
        this.scheduleOnce(() => {
            if (cc.isValid(this.node)) {
                this.checkShow();
            }
        }, 0);
    }

    onDisable() {
        if (cc.isValid(this._container)){
            this._container.active = true;
        }
    }

    setParent(parent : cc.Node) {
        if (!parent) {
            parent = this.node.parent;
        }

        this._parent = parent;

        if (this._parent) {
            this._listPosition = this._parent.position;
            this._parent.on('position-changed', function () {
                if (this._parent) {
                    let offsetX = Math.abs(this._parent.x - this._listPosition.x);
                    if (offsetX >= this.node.width / 4) {
                        this.checkShow();
                        this._listPosition.x = this._parent.x;
                    }

                    let offsetY = Math.abs(this._parent.y - this._listPosition.y);
                    if (offsetY >= this.node.height / 4) {
                        this.checkShow();
                        this._listPosition.y = this._parent.y;
                    }
                }
            }.bind(this), this);
        }
    }

    setMask(rect : cc.Rect) {
        this._maskRect = rect;

        this.checkShow();
    }

    checkShow() {
        if (!this._container) {
            return;
        }

        let rect1 = this.node._getSelfBoundingWorldBox();
        let rect2 = this._maskRect;
        
        if (rect2.intersects(rect1)) {
            // this._container.active = true;
            this._container.opacity = 255;
        } else {
            // this._container.active = false;
            this._container.opacity = 0;
        }
    }
}
