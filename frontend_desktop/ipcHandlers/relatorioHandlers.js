// ipcHandlers/relatorioHandlers.js
const { ipcMain } = require('electron');
const fetch = require('node-fetch');

// URL Base da API (padronizada, sem /api)
const API_URL = 'http://127.0.0.1:5000';

function registerRelatorioHandlers() {

    // --- GET Relatório de Dívidas por Produtor ---
    ipcMain.handle('get-relatorio-dividas', async (event, produtorId) => {
        try {
            // Chama GET /api/relatorios/produtor/:produtorId/dividas
            const response = await fetch(`${API_URL}/api/relatorios/produtor/${produtorId}/dividas`);
            
            if (!response.ok) {
                let errorBody = null; try { errorBody = await response.json(); } catch (e) { /* Ignora */ }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            return await response.json(); // Retorna a lista de dívidas
            
        } catch (error) {
            console.error(`Falha ao buscar relatório de dívidas para produtor ${produtorId}:`, error);
            return { error: error.message || 'Erro desconhecido ao buscar relatório.' };
        }
    });

}

// Exporta a função de registro
module.exports = { registerRelatorioHandlers };