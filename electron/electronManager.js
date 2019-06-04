const {
    app,
    BrowserWindow,
    BrowserView,
    ipcMain,
    Menu,
} = require('electron')

// to disable https untrust sites 
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

let mainWindow;

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
    },
    mainWinLoadURL: (URL) => {
        mainWindow.loadURL(URL)
    },
    //
    getMainWin: () => {
        return mainWindow;
    },
    // on main on show

}