import { ipcMain } from 'electron';
import path from "path";
import { getPath, mkdir, pathExists } from "../../utils/readFile";
import moment from "moment";
// @ts-ignore
const DOC_PATH = global.__docPath;
export const DOWNLOAD_CHANEL_KEY = 'MAIN_DOWNLOAD';
export const DOWNLOAD_CLICK_KEY = 'DOWNLOAD_CLICK';
const downloadMSGMap = {};
export const mainWindowRegister = (mainWindow, webContents) => {
    return new MainJunctor(mainWindow, webContents);
};
class MainJunctor {
    constructor(browserWindow, webContents) {
        this.browserWindow = browserWindow;
        this.webContents = webContents;
        this.listenDownLoad();
    }
    listenDownLoad() {
        this.webContents.session.on('will-download', (event, item, webContents) => {
            try {
                console.log('开始下载');
                const msg = getDownloadPayload(this.browserWindow.id);
                if (!msg) {
                    console.error('下载错误');
                    return;
                }
                const dirPath = getPath('download');
                if (!pathExists(dirPath))
                    mkdir(dirPath);
                const name = item.getFilename().replace(/(\.\w+$)|\b$/, (w) => `_${moment().format('YYYYMMDDHHmmss')}${w}`);
                const filePath = path.join(dirPath, name);
                const type = item.getMimeType();
                const data = {
                    uuid: msg.uuid,
                    status: 'SUCCESS',
                    path: filePath,
                    dirPath,
                    name,
                    type
                };
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
                        this.sendMsg(data);
                    }
                    else {
                        this.sendMsg({ ...data, status: 'FAIL' });
                    }
                });
                item.setSavePath(filePath);
            }
            catch (e) {
                console.log('出错~!~!~!~!~!~');
                console.error(e);
            }
        });
    }
    sendMsg(state) {
        this.browserWindow.webContents.send(DOWNLOAD_CHANEL_KEY, state);
    }
}
function initIpcMain() {
    ipcMain && ipcMain.on(DOWNLOAD_CHANEL_KEY, (_, msg) => {
        console.log('收到下载通知', msg);
        saveMainPayload(msg);
    });
}
function saveMainPayload(data) {
    downloadMSGMap[data.windowId] = downloadMSGMap[data.windowId] || [];
    downloadMSGMap[data.windowId].push(data);
}
function getDownloadPayload(windowId) {
    const msg = downloadMSGMap[windowId].shift();
    if (Date.now() - msg.timeStamp < 5000) {
        return msg;
    }
    else {
        return null;
    }
}
initIpcMain();
//# sourceMappingURL=Main.js.map