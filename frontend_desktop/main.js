const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const fetch = require('node-fetch');

const { registerIpcHandlers } = require('./ipcHandlers');

log.transports.file.resolvePath = () => path.join(__dirname, 'logs/main.log');
log.info('Aplicação iniciada (main.js)');

const DB_PATH = path.join(__dirname, '../backend_api/gestao.db');
const BACKUP_DIR = path.join(__dirname, 'backups');
const MAX_BACKUPS = 10; 

function getTimestamp() {
    return new Date().toISOString().split('.')[0].replace(/:/g, '-');
}

function runBackupRoutine() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            log.info('Pasta de backup criada:', BACKUP_DIR);
        }

        const backupFileName = `gestao_backup_${getTimestamp()}.db`;
        const backupFilePath = path.join(BACKUP_DIR, backupFileName);

        fs.copyFileSync(DB_PATH, backupFilePath);
        log.info(`Backup realizado com sucesso: ${backupFileName}`);

        pruneOldBackups();

    } catch (error) {
        log.error('Falha grave ao realizar o backup:', error);
    }
}

function pruneOldBackups() {
    try {
        const allBackups = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.endsWith('.db') && file.startsWith('gestao_backup_'))
            .sort(); 
        
        if (allBackups.length > MAX_BACKUPS) {
            log.info(`Rotacionando backups. Limite de ${MAX_BACKUPS} excedido.`);
            const filesToDelete = allBackups.length - MAX_BACKUPS;
            
            const oldBackups = allBackups.slice(0, filesToDelete);
            
            for (const oldFile of oldBackups) {
                fs.unlinkSync(path.join(BACKUP_DIR, oldFile));
                log.info(`Backup antigo removido: ${oldFile}`);
            }
        }
    } catch (error) {
        log.error('Erro ao limpar backups antigos:', error);
    }
}


const PURGE_TRACKER_FILE = path.join(log.transports.file.resolvePath(), '../last_purge.txt');
const API_URL = 'http://127.0.0.1:5000'; 

async function runPurgeRoutine() {
    const today = new Date().toISOString().split('T')[0]; 
    let lastPurgeDate = '';

    if (fs.existsSync(PURGE_TRACKER_FILE)) {
        lastPurgeDate = fs.readFileSync(PURGE_TRACKER_FILE, 'utf-8');
    }

    if (lastPurgeDate === today) {
        log.info('[Purge] Rotina de limpeza já executada hoje. Pulando.');
        return;
    }

    log.warn('[Purge] Rotina de limpeza diária iniciada...');
    
    try {
        const response = await fetch(`${API_URL}/api/admin/purge`, {
            method: 'POST'
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.erro || response.statusText);
        }

        const result = await response.json();
        log.info(`[Purge] Sucesso: ${result.mensagem}`);
        
        fs.writeFileSync(PURGE_TRACKER_FILE, today, 'utf-8');

    } catch (error) {
        log.error(`[Purge] Falha grave ao rodar a rotina de limpeza: ${error.message}`);
    }
}

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

app.whenReady().then(() => {
  
  log.info("Iniciando aplicação, rodando rotina de backup...");
  runBackupRoutine();
  
  runPurgeRoutine();

  registerIpcHandlers();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});