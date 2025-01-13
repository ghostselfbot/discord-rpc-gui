const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./server');
const renderer = path.join(__dirname, '../renderer');

function createWindow() {
    const win = new BrowserWindow({
        titleBarStyle: 'hidden',
        titleBarOverlay: true ? process.platform === 'darwin' : false,
        minWidth: 800,
        minHeight: 700,
        width: 800,
        height: 700,
    })

    win.loadFile(path.join(renderer, 'index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
})