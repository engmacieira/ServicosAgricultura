const { ipcMain } = require('electron');
const log = require('electron-log'); 

function registerLogHandlers() {

    ipcMain.handle('log:info', (event, ...args) => {
        log.info(...args);
    });

    ipcMain.handle('log:warn', (event, ...args) => {
        log.warn(...args);
    });

    ipcMain.handle('log:error', (event, ...args) => {
        log.error(...args);
    });

    console.log("Handlers de Log registrados.");
}

module.exports = { registerLogHandlers };