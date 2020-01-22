import { app, screen, BrowserWindow } from 'electron'
import path from "path";
import {mainWindowRegister} from '../module/Junctor/Main'

// global.__docPath = path.resolve(__dirname,process.env.NODE_ENV === 'development' ? './static/doc' : '../../../doc')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    useContentSize: true,
    width,
    height: height - 60,
    // show: false,
    x: 0,
    y: 0
  })
  mainWindowRegister(mainWindow)
  mainWindow.loadURL(winURL + '#/taskManage')

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // setTimeout(createNewWindow, 3000)
  // const welcome = showWelcome(() => {
  //   mainWindow.show()
  //   setTimeout(() => {
  //     welcome.close()
  //   },100)
  // })

}

function createNewWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const window = new BrowserWindow({
    useContentSize: true,
    width,
    height,
    // show: false,
    x: 0,
    y: 0
  })
  mainWindowRegister(mainWindow)

  window.loadURL(winURL + '#/taskManage')

  return window
}

function showWelcome (callback) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const welcome = new BrowserWindow({
    useContentSize: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    width,
    height,
    x: 0,
    y: 0
  })
  welcome.loadURL(winURL + '#/welcome')
  setTimeout( () => {
    callback()
  }, 4000)
  return welcome
}

app.on('ready', () => {
  console.log('ready')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  console.log('activate')
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
