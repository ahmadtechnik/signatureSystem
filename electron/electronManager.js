const {
    app,
    BrowserWindow,
    BrowserView,
    ipcMain,
    Menu,
    Tray
} = require('electron')

// to disable https untrust sites 
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

let mainWindow;
let tr;
module.exports.initElectronApp = {
    //
    initAppOnReady: () => {
        app.on("ready", this.initElectronApp.initMainWin);
        return app;
    },
    /** to get main window in case user need to call it again */
    initMainWin: () => {
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false
            },
            show: false
        });
        mainWindow.on("closed", mainWidowEvents.onWindowClosed)
        mainWindow.setMenu(null)
        this.initElectronApp.setTrayMenu()
    },
    mainWinLoadURL: (URL) => {
        mainWindow.loadURL(URL)
    },
    //
    getMainWin: () => {
        return mainWindow;
    },
    //
    setTrayMenu: () => {
        tr = new Tray("./alphaIcon.ico");
        const contextMenu = Menu.buildFromTemplate([{
                label: 'Item1',
                type: 'radio'
            },
            {
                label: 'Item2',
                type: 'radio'
            },
            {
                label: 'Item3',
                type: 'radio',
                checked: true
            },
            {
                label: 'Item4',
                type: 'radio'
            }
        ])
        tr.setToolTip('This is my application.')
        tr.setContextMenu(contextMenu)
    }
}

var mainWidowEvents = {
    onWindowClosed: () => {

    }
}