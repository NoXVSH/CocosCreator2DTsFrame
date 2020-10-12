import LoaderManager from "../loader/LoaderManager";
import { BundleName } from "../loader/LoaderConst";

let pako_Inflate = require("../../plugins/pako_inflate");

export default class ConfigManager {
    private static _instance: ConfigManager;

    static get Instance(): ConfigManager {
        if (this._instance == null) {
            this._instance = new ConfigManager();
        }

        return this._instance;
    };

    public startLoad(cb: Function): void {
        this.loadAll(cb);
    }

    private loadAll(cb: Function): void {
        let completeCallback = cb;

        this.loadGameData()
        .then(() =>  {
            completeCallback && completeCallback();
        })
        .catch((e) => {
            errorlog("加载游戏配置表出错", e);
        });
    }

    private loadGameData(): Promise<any> {
        let p = new Promise<any>((resolve, reject) => {
            log("开始加载游戏配置表");
            LoaderManager.Instance.load("config/data", BundleName.LocalRes, cc.BufferAsset, (res) => {
                this.analyData(res._nativeAsset);
                resolve();
            });

        });

        return p;
    }

    analyData(text) {
        let jsonObj = this.__turnToJson(text);
        let tableCount = jsonObj.length;

        let list;
        let tableData;
        let rowCount;
        let colCount;

        for (let k = 0; k < tableCount; k++) {
            list = {};
            tableData = jsonObj[k];
            rowCount = tableData.data.length;
            colCount = tableData.data[0].length;

            for (let i = 1; i < rowCount; i++) {
                let data = {};
                for (let j = 0; j < colCount; j++) {
                    data[tableData.data[0][j]] = tableData.data[i][j];

                }
                list[data[tableData.data[0][0]]] = data;
            }

            ConfigManager.Instance[tableData.tableName] = list;
        }
    }

    __turnToJson(binData) {
        let jsonStr = pako_Inflate.inflate(binData, {to: 'string'});

        let jsonObj = JSON.parse(jsonStr);
        return jsonObj;
    }
}


window.regVar("ConfigManager", ConfigManager);