import {BrowserWindow, ipcMain} from 'electron'
import path from "path";
import {getPath, mkdir, pathExists} from "../../utils/readFile";
import moment from "moment";

// @ts-ignore
const DOC_PATH = global.__docPath
export const DOWNLOAD_CHANEL_KEY = 'MAIN_DOWNLOAD'
export const DOWNLOAD_CLICK_KEY = 'DOWNLOAD_CLICK'

export interface DownloadMainPayload {
    windowId: number,
    uuid: string,
    timeStamp: number
}

export interface DownloadMsg {
    status: 'SUCCESS' | 'FAIL',
    uuid: string,
    path: string,
    dirPath: string,
    name: string,
    type: string
}

const downloadMSGMap: {[k: string]: DownloadMainPayload[]} = {}

export const mainWindowRegister = (mainWindow: BrowserWindow) =>　{
    return new MainJunctor(mainWindow)
}

class MainJunctor {
    constructor (
        public browserWindow: BrowserWindow
    ) {
        this.listenDownLoad()
    }

    listenDownLoad () {
        this.browserWindow.webContents.session.on('will-download', (event, item, webContents) => {
            const msg = getDownloadPayload(this.browserWindow.id)
            if (!msg) {
                console.error('下载错误')
                return
            }
            const dirPath = getPath('download')
            if (!pathExists(dirPath)) mkdir(dirPath)
            const name = item.getFilename().replace(/(\.\w+$)|\b$/, (w) => `_${moment().format('YYYYMMDDHHmmss')}${w}`)
            const filePath = path.join(dirPath, name)
            const type = item.getMimeType()
            const data: DownloadMsg = {
                uuid: msg.uuid,
                status: 'SUCCESS',
                path: filePath,
                dirPath,
                name,
                type
            }
            item.on('updated', (event, state) => {
                if (state === 'interrupted') {
                    console.log('Download is interrupted but can be resumed');
                }
                else if (state === 'progressing') {
                    if (item.isPaused()) {
                        console.log('Download is paused');
                    }
                    else {
                        console.log(`Received bytes: ${item.getReceivedBytes()}`);
                    }
                }
            });
            item.once('done', (event, state) => {
                if (state === 'completed') {
                    console.log('Download successfully');
                    this.sendMsg(data)
                }
                else {
                    this.sendMsg({...data, status: 'FAIL'})
                }
            });
            item.setSavePath(filePath);
        })
    }

    sendMsg (state: DownloadMsg) {
        this.browserWindow.webContents.send(DOWNLOAD_CHANEL_KEY, state)
    }
}

function initIpcMain () {
    console.log('初始化监听事件', DOWNLOAD_CHANEL_KEY)
    ipcMain && ipcMain.on(DOWNLOAD_CHANEL_KEY, (_: any, msg: DownloadMainPayload) => {
        console.log('收到下载通知', msg)
        saveMainPayload(msg)
    })
}

function saveMainPayload(data: DownloadMainPayload) {
    downloadMSGMap[data.windowId] =  downloadMSGMap[data.windowId] || []
    downloadMSGMap[data.windowId].push(data)
}

function getDownloadPayload(windowId: number): DownloadMainPayload | null {
    const msg = downloadMSGMap[windowId].shift() as DownloadMainPayload
    if (Date.now() - msg.timeStamp < 500) {
        return msg
    } else {
        return null
    }
}

initIpcMain()
