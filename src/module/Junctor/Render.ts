import {ipcRenderer, WebviewTag, remote} from 'electron'
import path from 'path'
import {ActionTask, ActionType} from "../Action";
import {DOWNLOAD_CHANEL_KEY, DownloadMainPayload, DownloadMsg} from "./Main";
import {getPath, pathExists, mkdir} from '../../utils/readFile'
import moment from 'moment'

class Hook {
  resolve: (payload: any) => void
  reject: (error: any) => void

  constructor(
    public uuid: string,
    resolve: (payload: any) => void,
    reject: (error: any) => void
  ) {
    this.resolve = this.destroyWhenRun(resolve)
    this.reject = this.destroyWhenRun(reject)
  }

  destroyWhenRun(fn: (data: any) => void) {
    return (payload: any) => {
      fn(payload)
      const idx = hooksData.findIndex(i => i.uuid === this.uuid)
      hooksData.splice(idx, 1)
    }
  }
}

const hooksData: Hook[] = []
const downloadTaskList: Hook[] = []
const CHANNEL_KEY = 'ACTION'


export interface IPCPayload {
  uuid: string,
  status: 'SUCCESS' | 'FAIL',
  state?: any
}

let _webView: WebviewTag | null = null

export const renderRegister = (webview: WebviewTag) => {
  _webView = webview
  listenIPCMsg(webview)
  listenM2WIpc()
};

function pushDownloadUuid(uuid: string, resolve: () => void, reject: () => void) {
  const curWindow = remote.getCurrentWindow()
  setHook(uuid, resolve, reject)
  const dPayload: DownloadMainPayload = {
    windowId: curWindow.id,
    uuid,
    timeStamp: Date.now()
  }
  ipcRenderer.send(DOWNLOAD_CHANEL_KEY, dPayload)
}

function listenM2WIpc() {
  ipcRenderer.on(DOWNLOAD_CHANEL_KEY, (events: any, msg: any) => {
      const {uuid, status, ...other} = <DownloadMsg>msg
      consume({uuid, status, state: other })
  })
}


function listenIPCMsg(webview: WebviewTag) {
  webview.addEventListener('ipc-message', (event) => {
    console.log('ipc-message', event)
    const payload = event.args[0] || {}
    consume(payload)
  })
}

export const sendAction = (data: ActionTask) => {
  if (_webView) {
    console.log('webview send', CHANNEL_KEY, data)
    if (data.type === ActionType.SetFile) {
      setFile(data).then(() => {
        consume({uuid: data.uuid, status: 'SUCCESS'})
      }).catch(() => {
        consume({uuid: data.uuid, status: 'FAIL'})
      })
      return
    }
    _webView.send(CHANNEL_KEY, data)
  }
}

export const setPromiseHook = (uuid: string, resolve: () => void, reject: () => void) => setHook(uuid, resolve, reject)
export const setDownloadHook = (uuid: string, resolve: () => void, reject: () => void) => pushDownloadUuid(uuid, resolve, reject)


function setHook(uuid: string, resolve: () => void, reject: () => void) {
  hooksData.push(new Hook(uuid, resolve, reject))
}

function consume(payload: IPCPayload) {
  const hook = hooksData.find(i => i.uuid === payload.uuid)
  if (hook) {
    if (payload.status === 'SUCCESS') {
      hook.resolve(payload)
    } else {
      hook.reject(payload)
    }
  } else {
    console.error('未定义的Action')
  }
}


export function setFile(action: ActionTask) {
  if (!_webView) return Promise.reject()
  const wc = _webView.getWebContents();
  return new Promise((resolve, reject) => {
    try {
      wc.debugger.attach("1.1");
      wc.debugger.sendCommand("DOM.getDocument", {pierce: true, depth: 100}, function (err, res) {
        console.log('doc', res)
        let rootId = res.root.nodeId
        if (action.inFrame) {
          rootId = getIframe(res.root, action.inFrame)
        }
        if (!rootId) {
          reject()
        }
        wc.debugger.sendCommand("DOM.querySelector", {
          nodeId: rootId,
          selector: action.selector  // CSS selector of input[type=file] element
        }, function (err, fileInput) {
          console.log('file', res)
          wc.debugger.sendCommand("DOM.setAttributeValue", {
            nodeId: fileInput.nodeId,
            name: 'style', value: 'outline: 10px solid'
            // selector: "iframe"  // CSS selector of input[type=file] element
          }, function (err, res) {
            console.log(err, res)
            console.log({
              nodeId: fileInput.nodeId,
              files: Array.isArray(action.state) ? action.state : [action.state]  // Actual list of paths
            })
            wc.debugger.sendCommand("DOM.setFileInputFiles", {
              nodeId: fileInput.nodeId,
              files: Array.isArray(action.state) ? action.state : [action.state]
            }, function (err, res) {
              wc.debugger.detach();
              resolve()
            });
          });

        });
      })
    } catch (err) {
      console.error("Debugger attach failed : ", err);
      return reject(err)
    }
    ;
  })
}

function getIframe(node: any, inFrame: string | boolean): any {
  if (node.nodeName === 'HEAD' || !node.children) return
  if (node.nodeName === "IFRAME") {
    if (typeof inFrame === 'string') {
      return node.attributes.includes(inFrame.slice(1)) ? node.contentDocument.nodeId : null
    }
    return node.contentDocument.nodeId
  } else {
    for (let i = 0; i < node.children.length; i++) {
      const argument = node.children[i];
      const res = getIframe(argument, inFrame)
      if (res) {
        return res
      }
    }
  }
}


// 错误：<div style="color:red"> Unexpect： Found EOFRecord before WindowTwoRecord was encountered </div>

//
// function listenDownloadEvent() {
//   const webContent = remote.getCurrentWebContents()
//   console.log(webContent.id)
//   webContent.session.on('will-download', ((event1, item) => {
//     console.log('Render willDownload')
//
//     const hook = downloadTaskList.pop()
//     if (!hook) return
//     item.on('updated', (event, state) => {
//       if (state === 'interrupted') {
//         console.log('Download is interrupted but can be resumed')
//       } else if (state === 'progressing') {
//         if (item.isPaused()) {
//           console.log('Download is paused')
//         } else {
//           console.log(`Received bytes: ${item.getReceivedBytes()}`)
//         }
//       }
//     })
//     item.once('done', (event, state) => {
//       if (state === 'completed') {
//         console.log('Download successfully')
//         hook.resolve({
//           uuid: hook.uuid,
//           status: 'SUCCESS',
//           path: filePath,
//           dirPath,
//           name,
//           type
//         })
//       } else {
//         hook.reject({
//           uuid: hook.uuid,
//           status: 'FAIL',
//           path: filePath,
//           dirPath,
//           name,
//           type
//         })
//       }
//     })
//     item.setSavePath(filePath)
//   }))
// }
