export default class ItemUtils {
    private static _instance : ItemUtils;

    static get Instance() : ItemUtils {
        if(this._instance == null) {
            this._instance = new ItemUtils();
        }

        return this._instance;
    }

    /**
     * 物品信息字符串解析
     * @param itemStr itemId,itemNum|itemId,itemNum
     * @returns iteminfo {{itemId, num}..}
     */
    strToItemInfo(itemStr : string) {
        let itemInfo = [];

        if(itemStr == "-1") return itemInfo;
        
        let arrs = itemStr.split("|");

        for(let i = 0, len = arrs.length; i < len; i++) {
            let info = arrs[i].split(",");
            let itemId = parseInt(info[0]);
            let num = parseInt(info[1]);
            itemInfo.push({itemId : itemId, num : num});
        }

        return itemInfo;
    }

    singleStrToItemInfo(str) {
        let info = str.split(",");
        let itemId = parseInt(info[0]);
        let num = parseInt(info[1]);

        return {itemId : itemId, num : num};
    }

}
