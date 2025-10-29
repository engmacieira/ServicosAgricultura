// main.js
const { app, BrowserWindow } = require('electron'); // Note: ipcMain não é mais necessário aqui
const path = require('path');

// Mark Construtor: Importamos nosso NOVO "registrador" de handlers
const { registerIpcHandlers } = require('./ipcHandlers');

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js') 
    }
  });

  win.loadFile('index.html');
  win.webContents.openDevTools(); 
}

// Quando o Electron estiver pronto...
app.whenReady().then(() => {
  
  // 1. Registra todos os nossos handlers da API (get, create, update, delete)
  registerIpcHandlers();
  
  // 2. Cria a janela principal
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ... (o resto do arquivo 'window-all-closed' é o mesmo) ...
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});