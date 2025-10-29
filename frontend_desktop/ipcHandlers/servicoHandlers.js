// ipcHandlers/servicoHandlers.js
const { ipcMain } = require('electron');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(args));

const API_URL = 'http://127.0.0.1:5000/api';

/**
 * Registra todos os handlers (manipuladores) de IPC
 * relacionados a Serviços.
 */
function registerServicoHandlers() {

    // --- GET ALL ---
    ipcMain.handle('get-servicos', async () => {
        try {
            const response = await fetch(`${API_URL}/servicos`);
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar serviços:', error);
            return [];
        }
    });

    // --- CREATE (POST) ---
    ipcMain.handle('create-servico', async (event, servicoData) => {
        try {
            const response = await fetch(`${API_URL}/servicos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servicoData),
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao criar serviço:', error);
            return null;
        }
    });

    // --- UPDATE (PUT) ---
    ipcMain.handle('update-servico', async (event, servicoId, servicoData) => {
        try {
            const response = await fetch(`${API_URL}/servicos/${servicoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servicoData),
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Falha ao atualizar serviço ${servicoId}:`, error);
            return null;
        }
    });

    // --- DELETE (DELETE) ---
    ipcMain.handle('delete-servico', async (event, servicoId) => {
        try {
            const response = await fetch(`${API_URL}/servicos/${servicoId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Falha ao deletar serviço ${servicoId}:`, error);
            return null;
        }
    });
}

// Exportamos a nova função de registro
module.exports = { registerServicoHandlers };