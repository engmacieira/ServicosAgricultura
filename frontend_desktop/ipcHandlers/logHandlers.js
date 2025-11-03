const { ipcMain } = require('electron');
const log = require('electron-log'); 

function registerLogHandlers() {

    ipcMain.on('log:info', (event, ...args) => {
        log.info(...args);
    });

    ipcMain.on('log:warn', (event, ...args) => {
        log.warn(...args);
    });

    ipcMain.on('log:error', (event, ...args) => {
        log.error(...args);
    });

    console.log("Handlers de Log registrados.");
}

module.exports = { registerLogHandlers };