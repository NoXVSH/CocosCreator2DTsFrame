export default class PositionConvertUtils {
    private static _instance: PositionConvertUtils;

    static get Instance(): PositionConvertUtils {
        if (this._instance == null) {
            this._instance = new PositionConvertUtils();
        }

        return this._instance;
    }

    /**
     * 从一个节点的局部坐标转换到到另一个节点的局部坐标
     * @param alterNode 改变节点
     * @param targetNode 目标节点
     * @param offsetPos cc.v2 坐标偏移量, 可不传入
     * @returns {Vec2}
     */
    spaceToSpace(alterNode, targetNode, offsetPos = cc.v2(0, 0)) {
        let pos = this.spaceToWorld(targetNode, offsetPos);
        let pos2 = this.worldToSpace(pos, alterNode);

        return cc.v2(pos2.x + offsetPos.x, pos2.y + offsetPos.y);
    }

    /**
     * 从一个节点的局部坐标转换到世界坐标
     * @param targetNode 目标节点
     * @param offsetPos cc.v2 坐标偏移量, 可不传入
     * @returns {Vec2}
     */
    spaceToWorld(targetNode, offsetPos = cc.v2(0, 0)) {

        return targetNode.convertToWorldSpaceAR(offsetPos);
    }

    /**
     * 从世界坐标转换到一个节点的局部坐标
     * @param worldPos 世界坐标
     * @param alterNode 改变节点
     * @param offsetPos cc.v2 坐标偏移量, 可不传入
     * @returns {Vec2}
     */
    worldToSpace(worldPos, alterNode, offsetPos = cc.v2(0, 0)) {
        let pos = alterNode.parent ? alterNode.parent.convertToNodeSpaceAR(worldPos) : cc.v2(0, 0);

        return cc.v2(pos.x + offsetPos.x, pos.y + offsetPos.y);
    }
}

