import path from "path";
// @ts-ignore
const DOC_PATH = global.__docPath;
export const DOWNLOAD_CHANEL_KEY = 'MAIN_DOWNLOAD';
export const mainWindowRegister = (mainWindow) => {
    return new MainJunctor(mainWindow);
};
class MainJunctor {
    constructor(browserWindow) {
        this.browserWindow = browserWindow;
        this.listenDownLoad();
    }
    listenDownLoad() {
        this.browserWindow.webContents.session.on('will-download', (event, item, webContents) => {
            const dirPath = DOC_PATH;
            const filePath = path.join(dirPath, item.getFilename());
            const name = item.getFilename();
            const type = item.getMimeType();
            this.sendMsg({
                status: 'PROCESSING',
                path: filePath,
                dirPath,
                name,
                type
            });
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
                        this.sendMsg({
                            status: 'PROCESSING',
                            path: filePath,
                            dirPath,
                            name,
                            type
                        });
                    }
                }
            });
            item.once('done', (event, state) => {
                if (state === 'completed') {
                    console.log('Download successfully');
                    this.sendMsg({
                        status: 'SUCCESS',
                        path: filePath,
                        dirPath,
                        name,
                        type
                    });
                }
                else {
                    this.sendMsg({
                        status: 'FAILED',
                        path: filePath,
                        dirPath,
                        name,
                        type
                    });
                }
            });
            item.setSavePath(filePath);
        });
    }
    sendMsg(state) {
        this.browserWindow.webContents.send(DOWNLOAD_CHANEL_KEY, state);
    }
}
//# sourceMappingURL=Main.js.map