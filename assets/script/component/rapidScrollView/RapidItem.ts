
const {ccclass, property} = cc._decorator;

@ccclass
export default class RapidItem extends cc.Component {
    _itemIndex: number = 0;
    _layer: number = 0;

    // onLoad () {},

    start () {

    }

    // onEnable() {
    // },

    /**
     * 进入mask视图内显示时调用一次
     * 显示Item的子节点
     * @param data type: Object 对象类型，数据内容自定
     */
    onShow(data, callfunc) {
        // cc.log("Show RapidItem");
    }

    /**
     * 进入mask视图外隐藏时调用一次
     * 显示Item的子节点
     */
    onHide() {
        // cc.log("Hide RapidItem");
    }

    setItemIndex(index){
        this._itemIndex = index;
    }

    getItemIndex(){
        return this._itemIndex;
    }

    setLayer(layer){
        this._layer = layer;
    }

    beforeDestroy() {
        
    }
}
