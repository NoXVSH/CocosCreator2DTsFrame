import RapidItem from "./RapidItem";
import callFunc = cc.callFunc;

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("SelfComponent/RapidScrollView")
export default class RapidScrollView extends cc.Component {

    _isInit: boolean = false;

    _itemWidth: number = 0;
    _itemHeight: number = 0;
    _dataLength: number = 0;
    _viewItemNum: number = 0;
    _lineItemNum: number = 0;
    _loadItemIndex: number = 0;
    _viewTop: number = 0;
    _viewBottom: number = 0;
    _lastRollPos: number = 0;
    _rowItemNum: number = 0;

    loadItemCallfunc: Function = null;
    _itemChangeCallFunc: Function = null;
    _updateViewFinishCallFunc: Function = null;
    _itemCallfunc: (eventName: string, data: any) => {} = null;
    _outerPoolPushFunc: Function = null;
    _outerPoolPopFunc: Function = null;
    _scrollEndedCallFunc: Function = null;

    _layer0Layout: cc.Layout = null;

    _scrollView: cc.ScrollView = null;

    _rapidItemPre: cc.Node = null;
    layer0Node: cc.Node = null;
    _content: cc.Node = null;

    _itemList: cc.Node[] = null;
    _layerList: cc.Node[] = null;
    itemChildPreList: cc.Node[] = null;

    _itemChildList: cc.Node[] = null;

    _childPool: cc.Node[][] = null;

    _outerPoolIndexList: number[] = null;

    _dataList: any[] = null;

    start() {
        if (!this._isInit) {
            cc.warn("组件未初始化, 请调用init()初始化！");
            debugger;
        }
        this.node.on('scroll-ended', function (event) {
            this._scrollEndedCallFunc && this._scrollEndedCallFunc();
        }, this);
    }

    onDisable() {
        this._itemRemoveAllChildren();
    }

    onDestroy() {
        this.loadItemCallfunc = null;
        this._childPoolClear();
    }

    /////////////////////////////////////// 私有函数 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    _createRapidItem() {
        this._rapidItemPre = new cc.Node();
        this._rapidItemPre.name = "itemParent";
        this._rapidItemPre.addComponent(RapidItem);
        this._rapidItemPre.setContentSize(this._itemWidth, this._itemHeight);
    }

    _createAllItem() {
        if (this._dataLength > this._itemList.length) {
            let len = Math.max(this._dataLength - this._itemList.length), i = 0;
            while (i++ < len) {
                this._loadItem(false);
            }
        }
    }

    _initView() {
        let len = this._viewItemNum + this._lineItemNum;
        let i = 0;
        while (i++ < len) {
            this._loadItem(true);
        }
        this.loadItemCallfunc && this.loadItemCallfunc(i);
    }

    // 初始化layer层
    _initLayer(childList, content, layoutData) {
        this.layer0Node = new cc.Node();
        this.layer0Node.parent = content;
        this.layer0Node.setAnchorPoint(cc.v2(0.5, 1));
        this.layer0Node.name = "layer0";
        this.layer0Node.width = content.width;
        let layout = this.layer0Node.addComponent(cc.Layout);
        layout.type = layoutData.type || cc.Layout.Type.GRID;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.startAxis = layout.type === cc.Layout.Type.VERTICAL ? cc.Layout.AxisDirection.VERTICAL : cc.Layout.AxisDirection.HORIZONTAL;
        layout.paddingLeft = layoutData.paddingLeft || 0;
        layout.paddingRight = layoutData.paddingRight || 0;
        layout.paddingTop = layoutData.paddingTop || 0;
        layout.paddingBottom = layoutData.paddingBottom || 0;
        layout.spacingX = layoutData.spacingX || 0;
        layout.spacingY = layoutData.spacingY || 0;

        let i = 1, len = childList.length;
        while (i < len) {
            let node = cc.instantiate(this.layer0Node);
            node.name = "layer" + i;
            node.getComponent(cc.Layout).destroy();
            node.parent = content;
            node.zIndex = i;
            node.setPosition(this.layer0Node.getPosition());
            this._layerList.push(node);
            i++;
        }
    }

    _childPoolPush(index, node) {
        if (this._outerPoolIndexList && this._outerPoolIndexList.indexOf(index) > -1) {
            this._outerPoolPushFunc(index, node);

            return;
        }
        node.active = false;
        node.parent = null;
        this._childPool[index].push(node);
    }

    _childPoolPop(index) {
        if (this._outerPoolIndexList && this._outerPoolIndexList.indexOf(index) > -1) {

            return this._outerPoolPopFunc(index);
        }
        let node;
        // cc.log("_childPoolPop child节点池数量", this._childPool.length);
        if (this._childPool[index].length === 0) {
            node = cc.instantiate(this._itemChildList[index]);
        } else {
            node = this._childPool[index][this._childPool[index].length - 1];
            this._childPool[index].splice(this._childPool[index].length - 1, 1);
        }

        return node;
    }

    _childPoolClear() {
        for (let i = 0; i < this._childPool.length; i++) {
            let len = this._childPool[i].length;
            for (let j = 0; j < len; j++) {
                this._childPool[i][j].destroy();
            }
        }
    }

    _loadItem(isInit) {
        if ((this._loadItemIndex < this._dataLength && this._loadItemIndex >= this._itemList.length) || isInit) {
            let node = cc.instantiate(this._rapidItemPre);
            node.setContentSize(this._itemWidth, this._itemHeight);
            this.layer0Node.addChild(node);
            this._itemList.push(node);
            this._loadItemIndex++;
            this._updateContentSize();
            this.loadItemCallfunc && this.loadItemCallfunc(this._loadItemIndex);
        }
    }

    _getItemPosition(index, layerNode) {
        let pox = 0, poy = 0;
        if (this._layer0Layout.verticalDirection === cc.Layout.VerticalDirection.TOP_TO_BOTTOM) {
            pox = this._layer0Layout.paddingLeft + this._itemWidth / 2 + index % this._lineItemNum * (this._itemWidth + this._layer0Layout.spacingX) - layerNode.width / 2;
            poy = -(this._layer0Layout.paddingTop + this._itemHeight / 2 + Math.floor(index / this._lineItemNum) * (this._itemHeight + this._layer0Layout.spacingY));
        } else {
            let len = Math.max(this._dataList.length, this._viewItemNum);
            if (len % this._lineItemNum !== 0) {
                len = len + (this._lineItemNum - len % this._lineItemNum);
            }
            pox = this._layer0Layout.paddingLeft + this._itemWidth / 2 + (this._lineItemNum - 1 - index % this._lineItemNum) * (this._itemWidth + this._layer0Layout.spacingX) - layerNode.width / 2;
            if (this._dataList.length <= this._viewItemNum) {
                poy = this._layer0Layout.paddingBottom + this._itemHeight / 2 + Math.round(index / this._lineItemNum) * (this._itemHeight + this._layer0Layout.spacingY) - this.node.height + 1;
            } else {
                poy = -(this._layer0Layout.paddingTop + this._itemHeight / 2 + Math.round((len - 1 - index) / this._lineItemNum) * (this._itemHeight + this._layer0Layout.spacingY));
            }
        }

        return cc.v2(pox, poy);
    }

    _getItemPosition2(index, layerNode) {

    }

    _getItemListHeight() {

    }

    _updateContentSize(isUpdateItemFinish?: boolean) {
        // 同一帧layout宽高不会刷新，需要延迟
        this.scheduleOnce(function () {
            this._content.height = this.layer0Node.height;
            this._layerList.forEach(element => {
                element.height = this.layer0Node.height;
            });

            isUpdateItemFinish && this._updateViewFinishCallFunc && this._updateViewFinishCallFunc();

        }, 0);
    }

    // 更新item，把多余数据长度的item隐藏
    _updateItem() {
        let len = this._itemList.length;
        let len2 = this._dataList.length;
        let showNum = this._layer0Layout.verticalDirection === cc.Layout.VerticalDirection.TOP_TO_BOTTOM ? len2 : Math.max(len2, this._viewItemNum);
        this._layer0Layout.enabled = false;
        let updateIndexList = [];
        for (let i = 0; i < len; i++) {
            this._itemList[i].active = i < showNum;
            let pos = this._itemList[i].convertToWorldSpaceAR(cc.v2(0, 0));
            let pos2 = this._content.parent.convertToNodeSpaceAR(pos);
            let childrenLength = this._itemList[i].children.length;
            if (pos2.y < this._viewTop && pos2.y > this._viewBottom) {
                if (i < len2) {
                    if (childrenLength === 0) {
                        this._itemAddChild(i);
                    } else {
                        this._itemUpdateChild(this._itemList[i].children[0], i);
                        updateIndexList.push(i);
                    }
                } else {
                    this._itemRemoveChild(i);
                }
            } else if (childrenLength > 0) {
                this._itemRemoveChild(i);
            }
        }
        if (updateIndexList.length > 0) {
            for (let k = 0; k < this._layerList.length; k++) {
                let layerChildren = this._layerList[k].children;
                let len = layerChildren.length;
                for (let j = 0; j < len; j++) {
                    let itemIndex = layerChildren[j].getComponent(RapidItem).getItemIndex();
                    updateIndexList.indexOf(itemIndex) > -1 && this._itemUpdateChild(layerChildren[j], itemIndex);
                    layerChildren[j].setPosition(this._getItemPosition(itemIndex, this._layerList[k]));
                }
            }
        }
        if (this._layer0Layout.verticalDirection === cc.Layout.VerticalDirection.BOTTOM_TO_TOP && len2 <= this._viewItemNum) {
            this._layer0Layout.resizeMode = cc.Layout.ResizeMode.NONE;
            this.layer0Node.height = this.node.height - 1;
            this._content.height = this.layer0Node.height;
        } else {
            this._layer0Layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        }
        this._layer0Layout.enabled = true;
        this._updateContentSize(true);
    }

    // 刷新单个Item
    _updateItemOne(index) {
        // 如果还没实例出来，不用刷新
        if (index >= this._itemList.length) {

            return;
        }
        let childrenLength = this._itemList[index].children.length;
        childrenLength && this._itemUpdateChild(this._itemList[index].children[0], index);
        for (let k = 0; k < this._layerList.length; k++) {
            let layerChildren = this._layerList[k].children;
            let len = layerChildren.length;
            for (let j = 0; j < len; j++) {
                let itemIndex = layerChildren[j].getComponent(RapidItem).getItemIndex();
                if (index === itemIndex) {
                    this._itemUpdateChild(layerChildren[j], itemIndex);

                    break;
                }
            }
        }
    }

    _itemAddChild(index) {
        if (index < this._dataList.length) {
            for (let i = 0; i < this._itemChildList.length; i++) {
                let node = this._childPoolPop(i);
                if (i === 0) {
                    this._itemList[index].addChild(node);
                    node.setPosition(0, 0);
                    this._layer0Layout.updateLayout();
                } else {
                    this._layerList[i - 1].addChild(node);
                    node.setPosition(this._getItemPosition(index, this._layerList[i - 1]));
                }
                node.active = true;
                this._itemUpdateChild(node, index, i);
            }
        }
    }

    _itemUpdateChild(node, index, layer?) {
        let script = node.getComponent(RapidItem);
        this._dataList && index < this._dataList.length && script.onShow(this._dataList[index], this._itemCallfunc);
        script.setItemIndex(index);
        layer && script.setLayer(layer);
    }

    _itemRemoveChild(index) {
        let nodeChildren = this._itemList[index].children;
        if (nodeChildren.length > 0) {
            let node = nodeChildren[0];
            node.getComponent(RapidItem).onHide();
            this._childPoolPush(0, node);
        }
        for (let i = 0; i < this._layerList.length; i++) {
            let layerChildren = this._layerList[i].children;
            let len = layerChildren.length;
            for (let j = 0; j < len; j++) {
                let rapidItem = layerChildren[j].getComponent(RapidItem);
                if (rapidItem.getItemIndex() === index) {
                    rapidItem.onHide();
                    this._childPoolPush(i + 1, layerChildren[j]);

                    break;
                }
            }
        }
        this._updateContentSize();
    }

    _itemRemoveAllChildren() {
        let i = 0;
        for (; i < this._itemList.length; i++) {
            let nodeChildren = this._itemList[i].children;
            if (nodeChildren.length > 0) {
                let node = nodeChildren[0];
                node.getComponent(RapidItem).onHide();
                this._childPoolPush(0, node);
            }
        }

        for (i = 0; i < this._layerList.length; i++) {
            let layerChildren = this._layerList[i].children;
            let len = layerChildren.length, j = len - 1;
            while (j >= 0) {
                layerChildren[j].getComponent(RapidItem).onHide();
                this._childPoolPush(i + 1, layerChildren[j]);
                j--;
            }
        }
    }

    // 滚动回调
    _onRollEvent() {
        let contentPoy = this._content.y;
        let diffPos = contentPoy - this._lastRollPos;
        if (this._dataList && Math.abs(diffPos) > this._itemHeight / 2) {
            this._lastRollPos = this._content.y;

            if (diffPos > 0 && this._loadItemIndex < this._dataList.length) {
                let j = 0;
                while (j++ < this._lineItemNum) {
                    this._loadItem(false);
                }
            }

            let len = this._itemList.length;
            let orientationType = diffPos > 0 ? "runDown" : "runUp";
            // 下一次滑动的起始位置
            let i = 0, removeIndex = null, addIndex = null;
            while (i < len) {
                let pos = this._itemList[i].convertToWorldSpaceAR(cc.v2(0, 0));
                let pos2 = this._content.parent.convertToNodeSpaceAR(pos);
                let childrenLength = this._itemList[i].children.length;
                // 移除节点
                if (childrenLength > 0 && ((diffPos > 0 && pos2.y > this._viewTop) || (diffPos < 0 && pos2.y < this._viewBottom))) {
                    // cc.log(`${diffPos > 0 ? "上拉" : "下拉"} 移除节点`, i, pos2, this._itemList[i]);
                    this._itemRemoveChild(i);
                    removeIndex = i;
                }
                // 增加节点
                else if (childrenLength === 0 && pos2.y < this._viewTop && pos2.y > this._viewBottom) {
                    // cc.log(`${diffPos > 0 ? "上拉" : "下拉"} 增加节点`, i, pos2, this._itemList[i]);
                    this._itemAddChild(i);
                    addIndex = i;
                }
                i++;
            }
            this._itemChangeCallFunc && this._itemChangeCallFunc(orientationType, addIndex, removeIndex);
        }
    }

    // update (dt) {}

    /////////////////////////////////////// 公有接口 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    /**
     * 初始化
     * 注意：需要监听[addListen]事件监听必须放在init之前
     * @param childList type：[cc.Node] 如果使用挂节点方式，childList 可不传入
     * @param layoutData layout组建参数：
     * let layoutData = {
            //布局类型, 只支持GRID和VERTICAL,必传参数
            type: cc.Layout.Type.GRID,
            //X、Y轴间距，可不传，默认为0
            spacingX: 0,
            spacingY: 0,
            //上下左右边距，可不传，默认为0
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0
        };
     */
    init(layoutData, childList) {
        this._isInit = true;
        // item节点列表
        this._itemList = [];
        this._layerList = [];
        // 滚动回调上一次标记的位置
        this._lastRollPos = -100;
        this._loadItemIndex = 0;
        this._itemChildList = childList ? childList : [];
        this._childPool = [];
        let childLen = childList ? childList.length : this.itemChildPreList.length;
        for (let i = 0; i < childLen; i++) {
            this._childPool.push([]);
            let node: cc.Node = cc.instantiate(childList[i]);
            !childList && this._itemChildList.push(node);
        }

        if (!this._itemChildList[0].getComponent(RapidItem)) {
            cc.warn("_itemChildList item没有RapidItem组件!!!");
            debugger;
        }
        this._scrollView = this.node.getComponent(cc.ScrollView);
        if (!this._scrollView) {
            cc.warn("错误：ScrollViewRoll.js 需要添加在ScrollView节点上");
            debugger;
            return;
        }
        this._scrollView.node.on("scrolling", this._onRollEvent, this);
        this._content = this._scrollView.content;
        let contentLayout = this._content.getComponent(cc.Layout);
        if (contentLayout) {
            contentLayout.enabled = false;
            contentLayout.destroy();
        }
        this._initLayer(this._itemChildList, this._content, layoutData);
        this._layer0Layout = this.layer0Node.getComponent(cc.Layout);
        this._itemWidth = this._itemChildList[0].width;
        this._itemHeight = this._itemChildList[0].height;
        this.updateSize(this.node.width, this.node.height);
        // 边距扩充范围值
        let amplifyScope = this._itemHeight;
        this._viewBottom = -(this._scrollView.node.height + amplifyScope);
        this._viewTop = 0 + amplifyScope;
        // cc.log("视图item行列数:", this._rowItemNum, this._lineItemNum);
        this._createRapidItem();
        this._initView();
    }

    updateSize(width, height) {
        this.node.width = width;
        this.node.height = height;
        let nodeView = cc.find("view", this.node);
        nodeView && nodeView.setContentSize(width, height);

        let paddingRight = this._layer0Layout.paddingRight;
        this._rowItemNum = Math.floor((this.node.height - (this._layer0Layout.paddingTop + this._layer0Layout.paddingBottom) - this._layer0Layout.spacingY) / this._itemHeight);
        this._lineItemNum = Math.floor((this.node.width - (this._layer0Layout.paddingLeft + this._layer0Layout.paddingRight) - this._layer0Layout.spacingX) / this._itemWidth);
        this._viewItemNum = this._rowItemNum * this._lineItemNum;
    }

    /**
     * 更新视图数据
     * @param datas 类型：array [object]
     * @param scrollType 滚动位置："top"：滚动到顶部；"bottom"：滚动到底部；非此两种类型则停留在当前位置只刷新数据
     */
    updateView(datas, scrollType) {
        this._dataList = datas;
        this._dataLength = datas.length;
        if (scrollType === "top") {
            this.toTop();
        } else if (scrollType === "bottom") {
            this.toBottom();
        } else {
            this._updateItem();
        }
    }

    /**
     * 仅更新数据
     * @param dataList
     */
    updateDataList(dataList) {
        this._dataList = dataList;
        this._dataLength = dataList.length;
        this._updateItem();
    }

    /**
     * 刷新单个item数据
     * @param index
     * @param data
     */
    updateIndex(index, data) {
        this._dataList[index] = data;
        this._updateItemOne(index);
    }

    toTop() {
        if (!this._scrollView) {
            return;
        }
        this._scrollView.stopAutoScroll();
        this._layer0Layout.updateLayout();
        this.scheduleOnce(function () {
            this._scrollView.scrollToTop(0);
            this._updateItem();
        }, 0);
    }

    toBottom() {
        if (!this._scrollView) {
            return;
        }
        this._scrollView.stopAutoScroll();
        this._createAllItem();
        this._updateItem();
        this._layer0Layout.updateLayout();
        this.scheduleOnce(function () {
            this._scrollView.scrollToBottom(0.01);
            this.scheduleOnce(function () {
                this._updateItem();
            }, 0.02);
        }, 0);
    }

    /**
     * 滚动至指定位置
     */
    toScrollPos(targetPos) {
        if (!this._scrollView) {
            return;
        }
        this._scrollView.stopAutoScroll();
        this._createAllItem();
        this.scheduleOnce(function () {
            this._scrollView.setContentPosition(targetPos);
            this._updateItem();
        }, 0);
    }

    /**
     * 获取道具Item列表
     * @param layerIndex 层级索引
     * @returns {Array|null|*}
     */
    getItemList(layerIndex) {
        if (layerIndex === 0) {
            return this._itemList;
        } else {
            return this._layerList[layerIndex - 1].children;
        }
    }

    /**
     * 获层级节点
     * @param layerIndex 层级索引
     * @returns {Array|null|*}
     */
    getLayerNode(layerIndex) {
        return this._content.children[layerIndex];
    }

    /**
     * 垂直方向布局方式
     * @param type cc.Layout.VerticalDirection
     */
    setVerticalDirection(type) {
        this._layer0Layout.verticalDirection = type;
    }

    /**
     * 水平排列子节点的方向
     * @param type cc.Layout.HorizontalDirection
     */
    setHorizontalDirection(type) {
        this._layer0Layout.horizontalDirection = type;
    }

    // 设置布局为左上
    setLeftTopDirection() {
        this._itemRemoveAllChildren();
        this.setVerticalDirection(cc.Layout.VerticalDirection.TOP_TO_BOTTOM);
        this.setHorizontalDirection(cc.Layout.HorizontalDirection.LEFT_TO_RIGHT);
        this.toTop();
    }

    // 设置布局为右下
    setRightBottomDirection() {
        this._itemRemoveAllChildren();
        this.setVerticalDirection(cc.Layout.VerticalDirection.BOTTOM_TO_TOP);
        this.setHorizontalDirection(cc.Layout.HorizontalDirection.RIGHT_TO_LEFT);
        this.toBottom();
    }

    // 设置垂直滚动开启
    setScrollViewVertical(enable) {
        if (!this._scrollView) {
            return;
        }
        this._scrollView.vertical = enable;
    }

    //在界面销毁前
    beforeDestroy() {
        let coms = this.node.getComponentsInChildren(RapidItem);
        coms.forEach((com) => {
            com.beforeDestroy();
        }, this);
    }

    /////////////////////////////////////// 事件监听 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    /**
     * 添加监听加载新的Item
     * 注意：监听事件监听必须放在init之前
     * @param callfunc 回调参数:(this._loadItemIndex: 加载item的进度)
     */
    addListenLoadItem(callfunc) {
        this.loadItemCallfunc = callfunc;
    }

    //添加item监听事件
    addListenItemCallFunc(callfunc: (eventName: string, data: any) => {}) {
        this._itemCallfunc = callfunc;
    }

    //添加视图滚动结束事件
    addListenScrollEndedCallFunc(callfunc) {
        this._scrollEndedCallFunc = callfunc;
    }

    /**
     * Item增加移除改变回调
     * @param callfunc（"runUp"/"runDown", 增加item的index, 移除item的index）index可能为null
     */
    addListenItemChange(callfunc) {
        this._itemChangeCallFunc = callfunc;
    }

    /**
     * 添加外部对象池
     * 注意：监听事件监听必须放在init之前
     * @param layerIndexList
     * @param pushFunction (index: layerIndexList下标, node)
     * @param popFunction (index: layerIndexList下标)
     */
    addListenOuterNodePool(layerIndexList, pushFunction, popFunction) {
        this._outerPoolIndexList = layerIndexList;
        this._outerPoolPushFunc = pushFunction;
        this._outerPoolPopFunc = popFunction;
    }

    addListenUpdateViewFinish(callFunc) {
        this._updateViewFinishCallFunc = callFunc;
    }

}
