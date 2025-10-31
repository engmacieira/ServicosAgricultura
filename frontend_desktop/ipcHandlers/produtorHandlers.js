// ipcHandlers/produtorHandlers.js
const { ipcMain } = require('electron');
const fetch = require('node-fetch'); // <-- CORREÇÃO 1: Mudar para 'require'

// A URL base da nossa API (SEM /api)
const API_URL = 'http://127.0.0.1:5000';

function registerProdutorHandlers() {

    // --- GET ALL ---
    ipcMain.handle('get-produtores', async (event, page) => {
        try {
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/produtores?page=${page || 1}&per_page=10`);
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar produtores:', error);
            return [];
        }
    });

    // --- CREATE (POST) ---
    ipcMain.handle('create-produtor', async (event, produtorData) => {
        try {
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/produtores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produtorData),
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao criar produtor:', error);
            return null;
        }
    });

    // --- UPDATE (PUT) ---
    ipcMain.handle('update-produtor', async (event, produtorId, produtorData) => {
        try {
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/produtores/${produtorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produtorData),
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Falha ao atualizar produtor ${produtorId}:`, error);
            return null;
        }
    });

    // --- DELETE (DELETE) ---
    ipcMain.handle('delete-produtor', async (event, produtorId) => {
        try {
            // CORREÇÃO 2: Adicionar '/api' aqui
            const response = await fetch(`${API_URL}/api/produtores/${produtorId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Falha ao deletar produtor ${produtorId}:`, error);
            return null;
        }
    });
}

module.exports = { registerProdutorHandlers };