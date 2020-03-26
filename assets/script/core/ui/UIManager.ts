import { UILayer } from "./UILayer";
import { EventType } from "../event/EventType";
import EventManager from "../event/EventManager";
import LoaderManager from "../loader/LoaderManager";;
import ModuleManager from "../module/ModuleManager";
import ResClearManager from "../loader/ResClearManager";
import LoaderConst from "../loader/LoaderConst";
import { UINameEnum } from "./UINameEnum";
import { ModuleName } from "../module/ModuleName";
import ModuleBase from "../module/ModuleBase";
import BaseView from "./BaseView";

export interface UIInfoStruct {
    name: string;
    layer: UILayer;
    showBanner: boolean;
    showMask: boolean;
    maskOpacity: number;
    node: cc.Node;
    viewData: any;

    isCloseWhenLoad: boolean; //当加载中被调用了关闭
    isShowLoadingWhenLoad: boolean; //在加载过程中是否显示了loading界面
    forbidShowSmallLoading: boolean; //当ui在加载时, 是否 禁止显示小loading界面

    isClosePreUI: boolean; //打开该界面时, 是否关闭该层级已经打开的所有界面
    closeTime: number; //界面关闭时间

    manager : ModuleBase; 
}

export default class UIManager {
    private static _instance: UIManager;

    static get Instance(): UIManager {
        if (this._instance == null) {
            this._instance = new UIManager();
        }

        return this._instance;
    }

    private nodeParent: cc.Node = null;
    private layerNodeMap: { [key: number]: cc.Node } = {};
    private layerRecord: { [key: number]: string[] } = {};
    private prefabLoadUrls: { [key: string]: string } = {};
    private uiMap: { [key: string]: UIInfoStruct } = {};
    private loadingRecord: { [key: string]: boolean } = {};
    private maskPrefab: cc.Prefab = null;
    private __isClearing: boolean;

    init(): void {
        this.nodeParent = cc.find("Canvas/UIManager");
        this.layerNodeMap = {};

        this.layerRecord = {}; //记录各层级显示的ui
        for (const layerName in UILayer) {
            if (!isNaN(parseInt(layerName))) continue;
            this.layerRecord[UILayer[layerName]] = [];
        }

        this.prefabLoadUrls = {};
        this.uiMap = {};
        this.loadingRecord = {};

        this.initLayer(); //层级节点初始化
    }

    initLayer(): void {
        let node = null;
        for (const layerName in UILayer) {
            if (!isNaN(parseInt(layerName))) continue;

            node = new cc.Node(layerName + "UI");
            this.nodeParent.addChild(node);
            this.layerNodeMap[UILayer[layerName]] = node;
        }
    }

    registerUIInfo(info: UIInfoStruct): void {
        this.uiMap[info.name] = info;
    }

    openUIWithInfo(info: UIInfoStruct, callback: Function): void {
        this.openUI(info.name, callback);
    }

    openUI(uiName: string, callback: Function): void {
        let uiInfo = this.uiMap[uiName];

        if (uiInfo.node != null) {
            this.__openUI(uiName, callback);

            if (uiInfo.layer == UILayer.Main) { //当主界面层发生变动(一个界面跳转另一个界面, 纯粹打开不会触发)时, 会关闭所有弹窗
                let recordList = this.layerRecord[uiInfo.layer];
                if (recordList.length == 1) {
                    this.closeUIByLayer(UILayer.Activity);
                    this.closeUIByLayer(UILayer.Pop);
                }
            }
        }
        else {
            this.__loadUI(uiName, callback);
        }
    }

    private __openUI(uiName: string, callback: Function) {
        let uiInfo = this.uiMap[uiName];

        let isShow = this.checkUIIsShow(uiName);
        let layer = this.getUILayer(uiName);
        let recordList = this.layerRecord[layer];
        let isSingle = uiInfo.isClosePreUI || this.checkLayerIsSingle(layer);

        if (!isShow) {
            for (let i = 0, len = recordList.length; i < len; i++) {
                let name = recordList[i];
                if (isSingle) this.closeUI(name);
                else {
                    let tempUiInfo = this.uiMap[name];
                    tempUiInfo.node.active = false;
                }
            }

            let parent = this.getUILayerParent(uiName);
            uiInfo.node.active = false;
            parent.addChild(uiInfo.node);
            recordList.push(uiName);
            uiInfo.node.active = true;

            if (uiInfo.viewData != null) { //临时界面数据, 派发完成后断开引用
                uiInfo.node.emit("setData", uiInfo.viewData);
                uiInfo.viewData = null;
            }

            log(uiName + "开启");

            EventManager.Instance.emit(EventType.UIChange); //派发ui变换事件
            EventManager.Instance.emit(EventType.UIOpen + `_${uiName}`);

            callback && callback();
        }
        else {
            errorlog(uiName + "已经打开或正在加载中!!!, 请勿重复调用开启" + uiName);
        }
    }

    private __loadUI(uiName: string, callback: Function) {
        if (this.loadingRecord[uiName] == true) {
            errorlog(uiName + "的预制体正在加载中!!!, 请勿重复调用开启" + uiName);
        }
        else if (this.prefabLoadUrls[uiName] == null) {
            let uiInfo = this.uiMap[uiName];
            this.prefabLoadUrls[uiName] = uiName;
            this.loadingRecord[uiName] = true;

            let t = this.setSmallLoadingTimeout(uiInfo);

            let checkLoadingOpen = () => {
                t && clearTimeout(t);
                if (uiInfo.isShowLoadingWhenLoad) {
                    uiInfo.isShowLoadingWhenLoad = false;
                    ModuleManager.Instance.closeUI(ModuleName.Loading, UINameEnum.Loading, {key : `UILoad_${uiInfo.name}`});
                }
            }

            let errorback = () => {
                this.loadingRecord[uiName] = false;
                LoaderManager.Instance.unload(this.prefabLoadUrls[uiName], true);
                this.prefabLoadUrls[uiName] = null;
                checkLoadingOpen();
                EventManager.Instance.emit(EventType.TipShow, { str: "网络不稳定, 请检查网络后重试" });
            }

            LoaderManager.Instance.load(uiName, cc.Prefab, (res) => {
                this.loadingRecord[uiName] = false;
                checkLoadingOpen();
                this.createNodeAndOpen(uiName, res, callback);
            }, errorback);

        }
        else {
            let res = LoaderManager.Instance.getResByUrl(this.prefabLoadUrls[uiName]);

            if(res == null) { //线上存在res拿到为空 导致的报错(概率低) 未查明原因 暂时以此代码保护下
                LoaderManager.Instance.unload(this.prefabLoadUrls[uiName], true);
                this.prefabLoadUrls[uiName] = null;
                this.__loadUI(uiName, callback);
                return;
            }

            this.createNodeAndOpen(uiName, res, callback);
        }
    }

    private setSmallLoadingTimeout(uiInfo: UIInfoStruct) {
        let func = null;
        if (!uiInfo.forbidShowSmallLoading) {
            func = setTimeout(() => { //加载时间超过0.5秒才显示
                ModuleManager.Instance.openUI(ModuleName.Loading, UINameEnum.Loading, {key : `UILoad_${uiInfo.name}`});
                uiInfo.isShowLoadingWhenLoad = true;
            }, 500);
        }
        return func;
    }

    createNodeAndOpen(uiName: string, res: cc.Prefab, callback: Function): void {
        let node = cc.instantiate(res);
        let urlInfo = this.uiMap[uiName];

        urlInfo.node = node;

        let createMask = (maskPrefab) => {
            let maskNode: cc.Node = cc.instantiate(maskPrefab);
            if (urlInfo.maskOpacity != null) maskNode.opacity = urlInfo.maskOpacity;
            node.insertChild(maskNode, 0);
        }

        if (urlInfo.showMask) {
            if (this.maskPrefab == null) {
                LoaderManager.Instance.load("internal/prefab/base/mask", cc.Prefab, (prefab) => {
                    this.maskPrefab = prefab;
                    createMask(this.maskPrefab);
                })
            }
            else {
                createMask(this.maskPrefab);
            }
        }

        node.getComponentsInChildren(BaseView).forEach((view) => view.init(urlInfo.manager)); //注册下manager

        if (urlInfo.isCloseWhenLoad) { //加载过程中调用了关闭
            urlInfo.isCloseWhenLoad = false;
            return;
        }

        this.openUI(uiName, callback);
    }

    closeUIWithInfo(info, isDestroy: boolean = false, isUnLoad: boolean = false): void {
        this.closeUI(info.name, isDestroy, isUnLoad);
    }

    closeUI(uiName: string, isDestroy: boolean = false, isUnLoad: boolean = false): void {
        if (!this.checkUIExist(uiName)) return;
        let isShow = this.checkUIIsShow(uiName);
        let layer = this.getUILayer(uiName);
        let recordList = this.layerRecord[layer];
        let uiInfo = this.uiMap[uiName];

        if (!isShow) return;

        let index = recordList.indexOf(uiName);
        if (index != -1) {
            recordList.splice(index, 1);

            uiInfo.node.active = false;
            uiInfo.node.removeFromParent(false); //removeFromParent 通常需要传入一个 false，否则默认会清空节点上绑定的事件和 action等。
            uiInfo.closeTime = Date.now();

            log(uiName + "关闭");
            EventManager.Instance.emit(EventType.UIClose + `_${uiName}`);
        }
        else {
            warnlog("关闭UI出错", uiInfo);
            if (this.loadingRecord[uiName] == true) {
                warnlog(`${uiName}在加载中被调用了close`);
                uiInfo.isCloseWhenLoad = true;
            }
        }

        if (recordList.length > 0) {
            let name = recordList[recordList.length - 1];
            this.uiMap[name].node.active = true;
        }

        isDestroy && this.destroyUI(uiName, isUnLoad);

        EventManager.Instance.emit(EventType.UIChange); //派发ui变换事件
        ResClearManager.Instance.clearRes();
    }

    destroyUIWithInfo(info: UIInfoStruct, isUnLoad: boolean = false) {
        return this.destroyUI(info.name, isUnLoad);
    }

    destroyUI(uiName: string, isUnLoad: boolean = false): boolean {
        if (!this.checkUIExist(uiName)) return;
        let isShow = this.checkUIIsShow(uiName);
        if (isShow) return;

        let uiInfo = this.uiMap[uiName];
        if (uiInfo.node) {
            uiInfo.node.emit("beforeDestroy");
            uiInfo.node.destroy();
            uiInfo.node = null;
            uiInfo.closeTime = null;

            warnlog(uiName + "销毁");

            if (isUnLoad) {
                LoaderManager.Instance.unload(this.prefabLoadUrls[uiName], true);
                this.prefabLoadUrls[uiName] = null;
                warnlog(uiName + "卸载unload");
            }

            return true;
        }

        return false;
    }

    checkUIExist(uiName: string): boolean {
        if (this.uiMap[uiName] == null) {
            log(uiName + "不存在!!!");
            return false;
        }
        return true;
    }

    getUILayerParent(uiName: string): cc.Node {
        let parent = this.layerNodeMap[this.getUILayer(uiName)];
        return parent;
    }

    getUILayer(uiName: string): UILayer {
        let info = this.uiMap[uiName];
        if (info == null) {
            log(uiName + "不存在!!!");
        }

        return info.layer;
    }

    checkUIIsShowWithInfo(info: UIInfoStruct): boolean {
        return this.checkUIIsShow(info.name);
    }

    checkUIIsShow(uiName: string): boolean {
        let isLoading = this.loadingRecord[uiName] == true;
        let layer = this.getUILayer(uiName);
        let recordList = this.layerRecord[layer];

        return isLoading || recordList.indexOf(uiName) != -1;
    }

    checkUIIsLoadingWithInfo(info : UIInfoStruct) {
        return this.checkUIIsLoading(info.name);
    }

    checkUIIsLoading(uiName) {
        return this.loadingRecord[uiName] == true;
    }

    getLayerShowUINum(layer: UILayer): number {
        return this.layerRecord[layer].length;
    }

    //检测是否有弹窗层模块打开
    checkHaveFrameOpen(): boolean {
        let popNum = this.getLayerShowUINum(UILayer.Pop);
        let activityNum = this.getLayerShowUINum(UILayer.Activity);

        return popNum > 0 || activityNum > 0;
    }

    //获取显示在当前最上层的ui信息, activity -> bottom层
    getForwardUIInfo(): UIInfoStruct {
        for (let layer = UILayer.Activity; layer >= UILayer.Bottom; layer--) {
            let recordList = this.layerRecord[layer];
            if (recordList.length != 0) {
                return this.uiMap[recordList[recordList.length - 1]];
            }
        }
    }

    //关闭该层级所有UI
    closeUIByLayer(layer: UILayer | string, isDestroy: boolean = false, isUnLoad: boolean = false): void {
        let recordList = this.layerRecord[layer];
        let tempList = recordList.slice(); //复制下

        for (let i = tempList.length - 1; i >= 0; i--) {
            let uiName = tempList[i];
            this.closeUI(uiName, isDestroy, isUnLoad);
        }
    }

    //关闭所有UI
    closeAllUI(isDestroy: boolean = false, isUnLoad: boolean = false): void {
        for (const key in UILayer) {
            if (!isNaN(parseInt(key))) continue;
            this.closeUIByLayer(UILayer[key], isDestroy, isUnLoad);
        }
    }

    checkLayerIsSingle(layer: UILayer | string): boolean {
        if (layer == UILayer.Activity || layer == UILayer.Tip || layer == UILayer.Load) return false;
        else return true;
    }

    clearUnuseUI() {
        if (this.__isClearing) return;

        this.__isClearing = true;
        for (const key in this.uiMap) {
            let uiInfo = this.uiMap[key];
            if (uiInfo.layer == UILayer.Activity && !this.checkUIIsShowWithInfo(uiInfo) && uiInfo.closeTime != null) { //目前只处理位于activity层的界面
                let offset = Date.now() - uiInfo.closeTime;
                if (offset >= LoaderConst.UIUnloadWaitTime * 1000) this.destroyUIWithInfo(uiInfo, true);
            }
        }

        this.__isClearing = false;
    }
}

window.regVar("UIManager", UIManager);
