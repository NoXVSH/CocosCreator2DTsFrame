import SelectBase from "./SelectBase";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
@menu('selectedGroupButton/SelectBtnGroup')
export default class SelectBtnGroup extends cc.Component {

    btnItems: any[];
    btnNodes: any[];
    _isInit: boolean;

    @property(cc.Integer)
    _selectedIndex: number;

    @property
    defaultSelectIndex: number = -1;

    @property({
        type: cc.Component.EventHandler,
        tooltip: CC_DEV && "页签改变事件, 返回参数：变换的节点selectIndex",
    })
    private selectAlertEvent: cc.Component.EventHandler = new cc.Component.EventHandler();

    @property([cc.Node])
    pageNode : cc.Node[] = [];

    get selectedIndex() {
        return this._selectedIndex;
    }

    set selectedIndex(value) {
        if (value == this._selectedIndex)
            return;
        if (!this._isInit) {
            this.defaultSelectIndex = value;
            return;
        }
        let item = this.getSelectedItem(); //old
        if (item) item.isChecked = false;

        this._selectedIndex = value;
        item = this.getSelectedItem(); //new
        if (item) {
            item.isChecked = true;
            this.node.emit("selectedIndex", this._selectedIndex);
            this.selectAlertEvent && cc.Component.EventHandler.emitEvents([this.selectAlertEvent], this._selectedIndex);
            this.setPageNode();
        }
    }

    constructor() {
        super();

        this.btnItems = [];
        this.btnNodes = [];
        this._selectedIndex = -1;
        this._isInit = false;
    }

    onLoad() {
        let index = 0;
        this._isInit = true;
        for (let i = 0; i < this.node.childrenCount; i++) {
            let child = this.node.children[i];
            let item = child.getComponent(SelectBase);
            if (item == null) continue;
            this.btnItems.push(item);
            this.btnNodes.push(child);
            item.isChecked = index == this.defaultSelectIndex;
            item.isSingleton = false;
            child.on("toggle", this.onClickItem, this);
            index++;
        }
        this._selectedIndex = this.defaultSelectIndex;
        this.setPageNode();
    }

    onClickItem(event) {
        this.setSelectedNode(event);
    }

    getSelectedItem() {
        if (this._selectedIndex == -1 || this.btnItems.length <= this._selectedIndex) return null;
        return this.btnItems[this._selectedIndex];
    }

    setSelectedItem(item) {
        this.selectedIndex = this.btnItems.indexOf(item);
    }

    setSelectedNode(node) {
        this.selectedIndex = this.btnNodes.indexOf(node);
    }

    getIndexByItem(item) {
        return this.btnItems.indexOf(item);
    }

    getIndexByNode(node) {
        return this.btnNodes.indexOf(node);
    }

    getNodeByIndex(index) {
        return this.btnNodes[index];
    }

    getItemByIndex(index) {
        return this.btnItems[index];
    }

    addChildNode(node) {
        if (this.getIndexByNode(node) >= 0) return;

        this.node.addChild(node);

        let item = node.getComponent(selfComponent.SelectBase);
        if (item == null) return;

        this.btnItems.push(item);
        this.btnNodes.push(node);
        item.isSingleton = false;
        node.on("toggle", this.onClickItem, this);
    }

    removeChildNode(node) {
        let index = this.getIndexByNode(node);
        this.node.removeChild(node);
        if (index < 0) return;
        this.btnItems.splice(index, 1);
        this.btnNodes.splice(index, 1);
        node.off("toggle", this.onClickItem, this);
    }

    removeAllChildren(isDestroy = true, isCleanup = true) {
        for (let i = 0; i < this.btnNodes.length; i++) {
            const child = this.btnNodes[i];
            if (isDestroy) {
                if (cc.isValid(child)) child.destroy();
                continue;
            } else if (isCleanup) {
                child.cleanup();
            } else {
                child.off("toggle", this.onClickItem, this);
            }
            this.node.removeChild(child);
        }
        this._selectedIndex = -1;
        this.btnItems = [];
        this.btnNodes = [];
    }

    setPageNode() {
        for(let i = 0, len = this.pageNode.length; i < len; i++) {
            let node = this.pageNode[i];
            node.active = i == this._selectedIndex;
        }
    }
}
