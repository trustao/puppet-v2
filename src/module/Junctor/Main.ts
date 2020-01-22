import {BrowserWindow} from 'electron'
import path from "path";

// @ts-ignore
const DOC_PATH = global.__docPath
export const DOWNLOAD_CHANEL_KEY = 'MAIN_DOWNLOAD'
export const DOWNLOAD_CLICK_KEY = 'DOWNLOAD_CLICK'

export const mainWindowRegister = (mainWindow: BrowserWindow) =>　{
    return new MainJunctor(mainWindow)
}

export interface DownloadMsg {
    status: 'PROCESSING' | 'SUCCESS' | 'FAILED',
    path: string,
    dirPath: string,
    name: string,
    type: string
}

class MainJunctor {
    constructor (
        public browserWindow: BrowserWindow
    ) {
        this.listenDownLoad()
    }

    listenIPC ()　{
        // this.browserWindow.webContents.on(DOWNLOAD_CHANEL_KEY, () => {
        //
        // })
    }

    listenDownLoad () {
        this.browserWindow.webContents.session.on('will-download', (event, item, webContents) => {

        })
    }

    sendMsg (state: DownloadMsg) {
        this.browserWindow.webContents.send(DOWNLOAD_CHANEL_KEY, state)
    }
}