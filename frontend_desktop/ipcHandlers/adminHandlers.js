const { ipcMain } = require('electron');
const fetch = require('node-fetch');
const log = require('electron-log');

const API_URL = 'http://127.0.0.1:5000'; 

function registerAdminHandlers() {

    // Handler para a importação de dados
    ipcMain.handle('admin:importar', async (event, tipo, filePath) => {
        log.info(`[IPC Handler] Recebida solicitação de importação para '${tipo}' do arquivo: ${filePath}`);
        
        try {
            const response = await fetch(`${API_URL}/api/admin/importar/${tipo}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: filePath }),
            });

            if (!response.ok) {
                let errorBody = null; 
                try { 
                    errorBody = await response.json(); 
                } catch (e) { 
                    // Ignora se o corpo não for JSON
                }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            
            return await response.json(); // Espera { "mensagem": "...", "sucesso": true, "total": X }

        } catch (error) {
            log.error(`[IPC Handler] Falha ao importar dados '${tipo}':`, error);
            // Retorna um objeto de erro padronizado para o renderer
            return { sucesso: false, erro: error.message || 'Erro desconhecido no IPC Handler' };
        }
    });

    // (Aqui adicionaremos os handlers de backup/restore/soft-delete depois)
}

module.exports = { registerAdminHandlers };