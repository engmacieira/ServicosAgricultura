// ipcHandlers/execucaoHandlers.js
const { ipcMain } = require('electron');
const fetch = require('node-fetch');

// Mark Construtor: CORREÇÃO 1 - URL base (sem /api)
const API_URL = 'http://127.0.0.1:5000'; 

/**
 * Registra os handlers (manipuladores) de IPC
 * relacionados a Execuções (Agendamentos).
 */
function registerExecucaoHandlers() {

    // --- CREATE (POST) ---
    ipcMain.handle('create-execucao', async (event, execucaoData) => {
        try {
            // Mark Construtor: CORREÇÃO 2 - Adicionado /api
            const response = await fetch(`${API_URL}/api/execucoes`, { // Chama POST /api/execucoes
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(execucaoData),
            });
            if (!response.ok) {
                let errorBody = null; try { errorBody = await response.json(); } catch (e) { /* Ignora */ }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            return await response.json();
        } catch (error) {
            console.error('Falha ao criar execução:', error);
            return { error: error.message || 'Erro desconhecido ao criar execução.' };
        }
    });

    // --- GET ALL ---
    ipcMain.handle('get-execucoes', async () => {
        try {
            // Mark Construtor: CORREÇÃO 2 - Adicionado /api
            const response = await fetch(`${API_URL}/api/execucoes`); // Chama GET /api/execucoes
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar execuções:', error);
            return [];
        }
    });

    // --- UPDATE (PUT) - NOVO ---
    ipcMain.handle('update-execucao', async (event, execucaoId, execucaoData) => {
        try {
            // Mark Construtor: CORREÇÃO 2 - Adicionado /api
            const response = await fetch(`${API_URL}/api/execucoes/${execucaoId}`, { // Chama PUT /api/execucoes/:id
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(execucaoData),
            });
             if (!response.ok) {
                let errorBody = null; try { errorBody = await response.json(); } catch (e) { /* Ignora */ }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            return await response.json(); // Retorna a execução atualizada
        } catch (error) {
            console.error(`Falha ao atualizar execução ${execucaoId}:`, error);
             return { error: error.message || 'Erro desconhecido ao atualizar execução.' };
        }
    });

    // --- DELETE (DELETE) - NOVO ---
    ipcMain.handle('delete-execucao', async (event, execucaoId) => {
        try {
            // Mark Construtor: CORREÇÃO 2 - Adicionado /api
            const response = await fetch(`${API_URL}/api/execucoes/${execucaoId}`, { // Chama DELETE /api/execucoes/:id
                method: 'DELETE',
            });
             if (!response.ok) {
                let errorBody = null; try { errorBody = await response.json(); } catch (e) { /* Ignora */ }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            // A API de delete retorna { mensagem: '...' } ou um erro
            return await response.json();
        } catch (error) {
            console.error(`Falha ao deletar execução ${execucaoId}:`, error);
            return { error: error.message || 'Erro desconhecido ao deletar execução.' };
        }
    });

}

// Exporta a função de registro (sem alterações aqui)
module.exports = { registerExecucaoHandlers };