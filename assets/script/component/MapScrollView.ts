const {ccclass, property} = cc._decorator;

@ccclass
export default class MapScrollView extends cc.ScrollView {

    _stopPropagationIfTargetIsMe(event) { //取消掉触摸阻挡

    }

    _onTouchEnded (event, captureListeners) {
        let self = this as any;

        if (!self.enabledInHierarchy) return;
        if (self._hasNestedViewGroup(event, captureListeners)) return;

        self._dispatchEvent('touch-up');

        let touch = event.touch;
        if (self.content) {
            self._handleReleaseLogic(touch);
        }
        if (self._touchMoved) {
            // event.stopPropagation();
        } else {
            self._stopPropagationIfTargetIsMe(event);
        }
    }
}
