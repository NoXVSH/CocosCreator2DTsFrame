const {ccclass, property} = cc._decorator;

@ccclass
export default class ModelComponent extends cc.Component {
    model: {};

    onLoad() {
        this.model = {};
    }

    set(key, value) {
        this.model[key] = value;
    }

    get(key) {
        return this.model[key];
    }

    setProperty(key, value, force = false) {
        let oldValue = this.model[key];

        if(oldValue == value) {
            if(force) this.node.emit(key, value);
        }
        else {
            this.model[key] = value;
            this.node.emit(key, value);
        }
    }

    emit(key, value) {
        this.node.emit(key, value);
    }

    clear() {
        for (const key in this.model) {
            this.model[key] = null;
            delete this[key];
        }
    }
}
