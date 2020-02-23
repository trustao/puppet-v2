import { action, ActionType } from './Action';
import EventEmitter from 'events';
let i = 0;
export class Step extends EventEmitter {
    constructor(state, 
    // public actions: (() => Promise<unknown>)[],
    actions, title = '') {
        super();
        this.state = state;
        this.actions = actions;
        this.title = title;
        this._status = 'READY';
        this._nextStep = null;
        this.key = createKey();
        this.errorCount = 0;
        this.retryCount = 10;
        this.parentTask = null;
        this.next = () => this._nextStep;
    }
    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
        this.emit('statusChange', status);
    }
    async run() {
        this.status = "RUNNING";
        console.log(`[Run] 执行 - ${this.title}`);
        try {
            const actions = [...this.actions];
            while (actions.length) {
                const { type, selector, state, ...others } = actions.shift();
                const stateKeys = Object.keys(state || {});
                const key = state && stateKeys[0];
                const payload = { selector, ...others };
                if (key && [ActionType.Input, ActionType.SetFile].includes(type)) {
                    const stateVal = (this.state[key] && !isBlank(this.state[key].value) && this.state[key].value) || (state[key] && state[key].default);
                    if (!stateVal)
                        console.error(`[${key}] is ${stateVal}。\n 错误：${this.title},${this.state[key] && this.state[key].desc} 值为空。`);
                    payload.state = stateVal;
                }
                else {
                    payload.state = {};
                    stateKeys.forEach(k => {
                        payload.state[k] = this.state[k].value;
                    });
                }
                const res = await action(type, payload);
                console.log(this.parentTask, res);
                if (!res || res.status === 'FAIL') {
                    console.error('操作失败', res);
                    this.status = 'ERROR';
                }
                this.stepDone(res, key, type);
            }
            this.status = 'SUCCESS';
        }
        catch (e) {
            console.error(e);
            this.status = 'ERROR';
        }
    }
    stepDone(res, key, type) {
        if (key && res) {
            switch (type) {
                case ActionType.GetText:
                case ActionType.GetValue:
                case ActionType.GetAttr:
                case ActionType.Download:
                    if (this.parentTask) {
                        this.parentTask.state[key].value = res.state.path;
                    }
                    else {
                        this.state[key].value = res.state.path;
                    }
                    break;
                default:
            }
        }
    }
    setNext(step) {
        this._nextStep = step;
    }
}
export class IfStep extends EventEmitter {
    constructor(condition, title, confirmStep = null) {
        super();
        this.condition = condition;
        this.title = title;
        this.confirmStep = confirmStep;
        this._status = 'READY';
        this._nextStep = null;
        this.defaultStep = null;
        this.key = createKey();
        this.errorCount = 0;
        this.retryCount = 10;
        this.parentTask = null;
        this.next = () => this._nextStep;
    }
    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
        this.emit('statusChange', status);
    }
    isTrue() {
        return this.status === 'SUCCESS' && this.confirmStep === this._nextStep;
    }
    setSteps(step) {
        this.confirmStep = step;
    }
    async run() {
        this.status = "RUNNING";
        if (!this.condition) {
            this.status = "ERROR";
            return;
        }
        this._nextStep = this.defaultStep;
        try {
            let res = this.condition(this.parentTask);
            if (res instanceof Promise) {
                res = await res;
            }
            if (typeof res === "boolean") {
                if (res) {
                    this._nextStep = this.confirmStep;
                }
            }
            console.log('条件步骤:', this._nextStep === this.confirmStep);
            this.status = 'SUCCESS';
        }
        catch (e) {
            this.status = 'ERROR';
        }
    }
    setNext(step) {
        this.defaultStep = step;
    }
}
function createKey() {
    return Date.now().toString(32) + '-' + Math.random().toString(32).slice(3, 6) + i++;
}
function isBlank(val) {
    return val === undefined || val === null;
}
//# sourceMappingURL=Step.js.map