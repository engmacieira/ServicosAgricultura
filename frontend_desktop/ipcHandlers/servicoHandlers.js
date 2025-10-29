// ipcHandlers/servicoHandlers.js
const { ipcMain } = require('electron');
const fetch = require('node-fetch');

// CORREÇÃO 1: Remover '/api' daqui
const API_URL = 'http://127.0.0.1:5000';

function registerServicoHandlers() {

    // --- GET ALL ---
    ipcMain.handle('get-servicos', async () => {
        try {
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/servicos`);
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
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/servicos`, {
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
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/servicos/${servicoId}`, {
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
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/servicos/${servicoId}`, {
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

module.exports = { registerServicoHandlers };