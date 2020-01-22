import {sendAction, setPromiseHook, setDownloadHook, IPCPayload} from './Junctor/Render'
import {Task} from "./newTask";

let uid = 0

export enum ActionType {
  Click = 'CLICK',
  Input = 'INPUT',
  SetFile = 'SET_FILE',
  Select = 'SELECT',
  GetAttr = 'GET_ATTR',
  GetText = 'GET_TEXT',
  GetValue = 'GET_VALUE',
  Download = 'DOWNLOAD',
  Blur = 'BLUR',
  Check = 'CHECK',
  CheckExist = 'EXIST',
  HasAttr = 'HAS_ATTR',
  Wait = 'WAIT',
  Navigate = 'NAVIGATE',
  Promise = 'PROMISE'
}

export interface ActionPayload {
  selector: string,
  state?: any,
  inFrame?: boolean | string,
  promiseFn?: (payload: ActionPayload) => Promise<any>
}

export interface ActionInfo extends ActionPayload {
  type: ActionType
}

export interface ActionTask extends ActionInfo {
  uuid: string
}

export const action = async (actionType: ActionType, payload: ActionPayload) => {
  console.log(actionType)
  switch (actionType) {
    case ActionType.Wait:
      return await Task.waitMoment(payload.state && payload.state.time)()
    case ActionType.Promise:
      return await promiseAction(payload)
    case ActionType.Download:
      const res = await downLoadAction(payload.selector)
      console.log('download', res)
      return res.reduce((a, b) => ({...a, ...b})) as IPCPayload
      break
    case ActionType.Blur:
    case ActionType.Click:
    case ActionType.GetText:
    case ActionType.Input:
    case ActionType.Select:
    case ActionType.Check:
    case ActionType.HasAttr:
    case ActionType.CheckExist:
    case ActionType.GetAttr:
    case ActionType.SetFile:
    default:
      return await baseAction({
        uuid: createKey(actionType),
        type: actionType,
        ...payload
      })
  }
}

async function promiseAction(payload: ActionPayload): Promise<IPCPayload> {
  if (!payload.promiseFn) return Promise.reject()
  try {
    const state = await payload.promiseFn(payload)
    return {uuid: '', status: 'SUCCESS', state}
  } catch (err) {
    return {uuid: '', status: 'FAIL', state: err}
  }
}

function clickAction(selector: string) {
  return baseAction({
    uuid: createKey(ActionType.Click),
    type: ActionType.Click,
    selector
  })
}

function downLoadAction(selector: string) : Promise<[IPCPayload, IPCPayload]> {
  return Promise.all([
    createDownloadAction(),
    clickAction(selector)
  ])
}

function createDownloadAction(): Promise<IPCPayload> {
  return new Promise((resolve, reject) => {
    setDownloadHook(createKey(ActionType.Download), resolve, reject)
  })
}


function baseAction(payload: ActionTask): Promise<IPCPayload> {
  return new Promise((resolve, reject) => {
    sendAction(payload)
    setPromiseHook(payload.uuid, resolve, reject)
  })
}

function createKey(actionType: ActionType) {
  // 32进制时间戳-uid-4随机串-ActionType
  return `${Date.now().toString(32)}-${uid++}-${Math.random().toString(32).slice(2, 6)}-${actionType}`
}