import {Step, IfStep} from "./Step";
import EventEmitter from 'events'
import {IPCPayload} from "./Junctor/Render";

export interface StateInfo {
  value: any,
  desc: string,
  type?: string
}

export class Task extends EventEmitter{
  static MOMENT_TS = 500
  private _status: 'READY' | 'RUNNING' | 'COMPLETE' | 'ERROR' | 'PAUSED' | 'STOP' = 'READY'
  private curStep?: Step | IfStep | null
  private set status (val) {
    if (this._status !== val) {
      this._status = val
      this.emit('statusChange', val)
    }
  }
  private get status () {
    return this._status
  }
  taskSteps: Array<Step | IfStep> = []
  allowRetryCount?: number
  state: {[key: string]: any} = {}
  get currentIndex ()　{
    return this.curStep ? this.taskSteps.indexOf(this.curStep) : 0
  }

  constructor (
    public name = '未命名任务',
    steps?: Array<Step | IfStep>
  ) {
    super()
    if (steps && steps.length) {
      this.taskSteps = steps
      this.initState(steps)
    }
  }

  getStatus () {
    return this.status
  }
  getCurrentStep () {
    return this.curStep
  }

  initState (steps:  Array<Step | IfStep>) {
    steps.forEach(step => {
      const _step = <Step>step
      step.parentTask = this
      if (_step.state) {
        Object.keys(_step.state).forEach(key =>　{
          this.createObserver(key, _step.state[key])
        })
      }
    })
  }

  createObserver (key: string, data: StateInfo) {
    console.log('createOberser')
    let value = data.value
    if (this.state.hasOwnProperty(key)) {
      console.warn('重复的参数设定')
      this.state[key].watchers.push(data)
    } else {
      const state = this.state[key] =  {...data, watchers: [data]}
      Object.defineProperty(state, 'value', {
        get () {
          return value
        },
        set (val) {
          console.log('setVal', val, state.watchers)
          value = val
          state.watchers.forEach(i => i.value = val)
        }
      })
    }
  }

  push (...step: Array<Step | IfStep>) {
    this.taskSteps.push(...step)
    this.initState(step)
  }

  run () {
    this.status = 'RUNNING'
    this.createChain()
    this.runStep()
  }

  pause () {
    this.status = 'PAUSED'
  }

  continue () {
    this.status = 'RUNNING'
    this.runStep()
  }

  stop () {
    this.status = 'STOP'
    this.curStep = undefined
  }

  createChain () {
    this.taskSteps.reduce((a, b) => {
      a.setNext(b)
      return b
    })
    this.curStep = this.taskSteps[0]
  }

  reset ()　{
    this.status = 'READY'
    this.taskSteps.forEach(i => {
      i.status = 'READY'
      i.setNext(null)
    })
  }

  private async runStep (): Promise<void> {
    while (this.curStep) {
      try {
        console.log('[STATUS] ================> ', this.status)
        // @ts-ignore
        if (this.status === 'PAUSED' || this.status === 'STOP') return
        const retryCount = typeof this.allowRetryCount === 'number' ? this.allowRetryCount : this.curStep.retryCount
        if (this.curStep.errorCount > retryCount || 0) {
          console.log('Task Error', retryCount, this.curStep.errorCount)
          this.status = 'ERROR'
          this.curStep.errorCount = 0
          this.run()
          return
        }
        const nextStep = this.curStep.next()
        if (nextStep && this.curStep instanceof Step) nextStep.status = 'READY'
        await this.curStep.run()
        if (this.curStep.status === 'ERROR') {
          throw new Error('Step Error')
        }
      } catch (e) {
        console.error(e)
        this.curStep && this.curStep.errorCount++
        await Task.waitMoment(1000)()
        console.log('step error~~~~~~~~~~~~~~~~~~~~~~~~')
        continue
      }
      console.log('step next~~~~~~~~~~~~~~~~~~~~~~~~~')
      this.curStep = this.curStep && this.curStep.next()
      console.log('[Next]: ' + (this.curStep &&　this.curStep.title))
      await Task.waitMoment()()
    }
    this.status = 'COMPLETE'
  }

  static waitMoment = (ts?: number) => (): Promise<IPCPayload> => new Promise(resolve => {
    console.log('wait', ts)
    const t = typeof ts === 'number' ? ts : (Task.MOMENT_TS || 0)
    setTimeout(() => {
      resolve({uuid: '', status: 'SUCCESS', state: ''})
    }, t)
  })
}

