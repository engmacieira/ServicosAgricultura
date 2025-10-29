// ipcHandlers/produtorHandlers.js
const { ipcMain } = require('electron');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(args));

// A URL base da nossa API
const API_URL = 'http://127.0.0.1:5000/api';

// Mark Construtor: Esta função "registra" todos os handlers
// relacionados a Produtor.
function registerProdutorHandlers() {

    // --- GET ALL ---
    ipcMain.handle('get-produtores', async () => {
        try {
            const response = await fetch(`${API_URL}/produtores`);
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
            const response = await fetch(`${API_URL}/produtores`, {
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
            const response = await fetch(`${API_URL}/produtores/${produtorId}`, {
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
            const response = await fetch(`${API_URL}/produtores/${produtorId}`, {
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

// "Exportamos" a função de registro para que o 'index.js' possa chamá-la.
module.exports = { registerProdutorHandlers };