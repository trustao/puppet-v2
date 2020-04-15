import { Step } from "./Step";
import EventEmitter from 'events';
export class Task extends EventEmitter {
    constructor(name = '未命名任务', steps) {
        super();
        this.name = name;
        this._status = 'READY';
        this.taskSteps = [];
        this.state = {};
        if (steps && steps.length) {
            this.taskSteps = steps;
            this.initState(steps);
        }
    }
    set status(val) {
        if (this._status !== val) {
            this._status = val;
            this.emit('statusChange', val);
        }
    }
    get status() {
        return this._status;
    }
    get currentIndex() {
        return this.curStep ? this.taskSteps.indexOf(this.curStep) : 0;
    }
    getStatus() {
        return this.status;
    }
    getCurrentStep() {
        return this.curStep;
    }
    initState(steps) {
        steps.forEach(step => {
            const _step = step;
            step.parentTask = this;
            if (_step.state) {
                Object.keys(_step.state).forEach(key => {
                    this.createObserver(key, _step.state[key]);
                });
            }
        });
    }
    createObserver(key, data) {
        console.log('createOberser');
        let value = data.value;
        if (this.state.hasOwnProperty(key)) {
            console.warn('重复的参数设定');
            this.state[key].watchers.push(data);
        }
        else {
            const state = this.state[key] = { ...data, watchers: [data] };
            Object.defineProperty(state, 'value', {
                get() {
                    return value;
                },
                set(val) {
                    console.log('setVal', val, state.watchers);
                    value = val;
                    state.watchers.forEach(i => i.value = val);
                }
            });
        }
    }
    push(...step) {
        this.taskSteps.push(...step);
        this.initState(step);
    }
    run() {
        this.status = 'RUNNING';
        this.createChain();
        this.runStep();
    }
    pause() {
        this.status = 'PAUSED';
    }
    continue() {
        this.status = 'RUNNING';
        this.runStep();
    }
    stop() {
        this.status = 'STOP';
        this.curStep = undefined;
    }
    createChain() {
        this.taskSteps.reduce((a, b) => {
            a.setNext(b);
            return b;
        });
        this.curStep = this.taskSteps[0];
    }
    reset() {
        this.status = 'READY';
        this.taskSteps.forEach(i => {
            i.status = 'READY';
            i.setNext(null);
        });
    }
    async runStep() {
        while (this.curStep) {
            try {
                console.log('[STATUS] ================> ', this.status);
                // @ts-ignore
                if (this.status === 'PAUSED' || this.status === 'STOP')
                    return;
                const retryCount = typeof this.allowRetryCount === 'number' ? this.allowRetryCount : this.curStep.retryCount;
                if (this.curStep.errorCount > retryCount || 0) {
                    console.log('Task Error', retryCount, this.curStep.errorCount);
                    this.status = 'ERROR';
                    this.curStep.errorCount = 0;
                    this.run();
                    return;
                }
                const nextStep = this.curStep.next();
                if (nextStep && this.curStep instanceof Step)
                    nextStep.status = 'READY';
                await this.curStep.run();
                if (this.curStep.status === 'ERROR') {
                    throw new Error('Step Error');
                }
            }
            catch (e) {
                console.error(e);
                this.curStep && this.curStep.errorCount++;
                await Task.waitMoment(1000)();
                console.log('step error~~~~~~~~~~~~~~~~~~~~~~~~');
                continue;
            }
            console.log('step next~~~~~~~~~~~~~~~~~~~~~~~~~');
            this.curStep = this.curStep && this.curStep.next();
            console.log('[Next]: ' + (this.curStep && this.curStep.title));
            await Task.waitMoment()();
        }
        this.status = 'COMPLETE';
    }
}
Task.MOMENT_TS = 500;
Task.waitMoment = (ts) => () => new Promise(resolve => {
    console.log('wait', ts);
    const t = typeof ts === 'number' ? ts : (Task.MOMENT_TS || 0);
    setTimeout(() => {
        resolve({ uuid: '', status: 'SUCCESS', state: '' });
    }, t);
});
//# sourceMappingURL=newTask.js.map