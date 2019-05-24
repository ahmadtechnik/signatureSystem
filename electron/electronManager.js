const {
    app,
    BrowserWindow,
    BrowserView,
    ipcMain,
    Menu,
} = require('electron')


let mainWindow

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })


    mainWindow.loadFile('./views/server_side/index.html')

    serverOption.startServerListening((arrayIndexNumber) => {
        console.log(arrayIndexNumber)
    });

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

/**
 * on app reader
 */
app.on('ready', createWindow)

/**
 * on windows close all
 */
app.on('window-all-closed', function () {

    if (process.platform !== 'darwin') app.quit()
})

/**
 * on active
 * if the app was active
 */
app.on('activate', function () {

    if (mainWindow === null) createWindow()
})