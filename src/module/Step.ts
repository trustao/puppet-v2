import {action, ActionInfo, ActionPayload, ActionType} from './Action'
import EventEmitter from 'events'
import {Task} from "./newTask";
import {IPCPayload} from "@/module/Junctor/Render";

let i = 0

export class Step extends EventEmitter {
  private _status: "READY" | "RUNNING" | "SUCCESS" | "ERROR" = 'READY'
  private _nextStep: Step | IfStep | null = null
  key = createKey()
  errorCount = 0
  retryCount = 10
  parentTask: Task | null = null

  get status () {
    return this._status
  }
  set status (status) {
    this._status = status
    this.emit('statusChange', status)
  }
  constructor (
    public state: {[key:string]: {value: any, desc: string}},
    // public actions: (() => Promise<unknown>)[],
    public actions: ActionInfo[],
    public title: string = ''
  ) {
    super()
  }

  async run () {
    this.status = "RUNNING"
    console.log(`[Run] 执行 - ${this.title}`)
    try {
      const actions = [...this.actions]
      while (actions.length) {
        const {type, selector, state, ...others} = <ActionInfo>actions.shift()
        const stateKeys = Object.keys(state ||　{})
        const key = state && stateKeys[0]
        const payload = <ActionPayload>{selector, ...others}
        if (type !== ActionType.Wait)  {
          if (key && [ActionType.Input, ActionType.SetFile, ActionType.Select].includes(type)) {
            const stateVal = (this.state[key] && !isBlank(this.state[key].value) && this.state[key].value) || (state[key] && state[key].default)
            if (!stateVal) console.error(`[${key}] is ${stateVal}。\n 错误：${this.title},${this.state[key] && this.state[key].desc} 值为空。`)
            payload.state = stateVal
          } else {
            payload.state = {}
            stateKeys.forEach(k => {
              payload.state[k] = this.state[k].value
            })
          }
        } else {
          payload.state = state
        }
        const res = await action(type, payload)
        if (!res || res.status === 'FAIL') {
          console.error('操作失败', res)
          this.status = 'ERROR'
        }
        this.stepDone(res, key, type)
      }
      this.status = 'SUCCESS'
    } catch (e) {
      console.error(e)
      this.status = 'ERROR'
    }
  }

  private stepDone (res: IPCPayload, key: string, type: ActionType) {
    console.log('step done', key, res)
    if (key && res) {
      switch (type) {
        case ActionType.GetText:
        case ActionType.GetValue:
        case ActionType.GetAttr:
          if (this.parentTask) {
            this.parentTask.state[key].value = res.state
          } else {
            this.state[key].value = res.state
          }
          break;
        case ActionType.Download:
          if (this.parentTask) {
            this.parentTask.state[key].value = res.state.path
          } else {
            this.state[key].value = res.state.path
          }
          break;
        default:
      }

    }

  }

  setNext (step: Step | IfStep | null) {
    this._nextStep = step
  }

  next = () => this._nextStep
}

export class IfStep extends EventEmitter {
  private _status : "READY" | "RUNNING" | "SUCCESS" | "ERROR" = 'READY'
  private _nextStep: Step | IfStep | null = null
  private defaultStep: Step | IfStep | null = null
  key = createKey()
  errorCount = 0
  retryCount = 10
  parentTask: Task | null = null

  get status () {
    return this._status
  }
  set status (status) {
    this._status = status
    this.emit('statusChange', status)
  }

  constructor (
    public condition: (task: Task | null) => (boolean | Promise<boolean>),
    public title: string,
    public confirmStep: Step | IfStep | null = null
  ) {
    super()
  }

  isTrue () {
    return this.status === 'SUCCESS' && this.confirmStep === this._nextStep
  }

  setSteps (step: Step) {
    this.confirmStep = step
  }

  async run () {
    this.status = "RUNNING"
    if (!this.condition) {
      this.status = "ERROR"
      return
    }
    this._nextStep = this.defaultStep
    try {
      let res = this.condition(this.parentTask)
      if (res instanceof Promise) {
        res = await res
      }
      if (typeof res === "boolean") {
        if (res) {
          this._nextStep = this.confirmStep
        }
      }
      console.log('条件步骤:',  this._nextStep === this.confirmStep)
      this.status = 'SUCCESS'
    } catch (e) {
      this.status = 'ERROR'
    }
  }

  setNext (step: Step | IfStep | null) {
    this.defaultStep = step
  }

  next = () => this._nextStep
}

function createKey() {
  return Date.now().toString(32) + '-' + Math.random().toString(32).slice(3, 6) + i++
}

function isBlank(val: any) {
  return val === undefined || val === null
}
