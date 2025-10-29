// ipcHandlers/pagamentoHandlers.js
const { ipcMain } = require('electron');
const fetch = require('node-fetch');

// Mark Construtor: CORREÇÃO 1 - URL base (sem /api)
const API_URL = 'http://127.0.0.1:5000'; 

/**
 * Registra os handlers (manipuladores) de IPC
 * relacionados a Pagamentos.
 */
function registerPagamentoHandlers() {

    // --- GET Pagamentos por Execução (Rota Aninhada) ---
    ipcMain.handle('get-pagamentos-por-execucao', async (event, execucaoId) => {
        try {
            // Mark Construtor: CORREÇÃO 2 - Adicionado /api
            // Chama GET /api/execucoes/:execucaoId/pagamentos
            const response = await fetch(`${API_URL}/api/execucoes/${execucaoId}/pagamentos`);
            if (!response.ok) {
                // Se a execução não for encontrada (404), a API do backend já trata
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar pagamentos para execução ${execucaoId}:`, error);
            return []; // Retorna lista vazia em caso de erro
        }
    });

    // --- CREATE Pagamento para Execução (Rota Aninhada) ---
    ipcMain.handle('create-pagamento', async (event, execucaoId, pagamentoData) => {
        try {
             // Mark Construtor: CORREÇÃO 2 - Adicionado /api
             // Chama POST /api/execucoes/:execucaoId/pagamentos
            const response = await fetch(`${API_URL}/api/execucoes/${execucaoId}/pagamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pagamentoData), // Ex: { valor_pago: 100.50, data_pagamento: '2025-11-01' }
            });
            if (!response.ok) {
                let errorBody = null; try { errorBody = await response.json(); } catch (e) { /* Ignora */ }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            return await response.json(); // Retorna o pagamento criado
        } catch (error) {
            console.error(`Falha ao criar pagamento para execução ${execucaoId}:`, error);
            return { error: error.message || 'Erro desconhecido ao criar pagamento.' };
        }
    });

    // --- UPDATE Pagamento (Rota Direta) ---
    ipcMain.handle('update-pagamento', async (event, pagamentoId, pagamentoData) => {
        try {
            // Mark Construtor: CORREÇÃO 2 - Adicionado /api
            // Chama PUT /api/pagamentos/:pagamentoId
            const response = await fetch(`${API_URL}/api/pagamentos/${pagamentoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pagamentoData), // Ex: { execucao_id: 5, valor_pago: 110.00, data_pagamento: '2025-11-02' }
            });
             if (!response.ok) {
                let errorBody = null; try { errorBody = await response.json(); } catch (e) { /* Ignora */ }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            return await response.json(); // Retorna o pagamento atualizado
        } catch (error) {
            console.error(`Falha ao atualizar pagamento ${pagamentoId}:`, error);
             return { error: error.message || 'Erro desconhecido ao atualizar pagamento.' };
        }
    });

    // --- DELETE Pagamento (Rota Direta) ---
    ipcMain.handle('delete-pagamento', async (event, pagamentoId) => {
        try {
             // Mark Construtor: CORREÇÃO 2 - Adicionado /api
             // Chama DELETE /api/pagamentos/:pagamentoId
            const response = await fetch(`${API_URL}/api/pagamentos/${pagamentoId}`, {
                method: 'DELETE',
            });
             if (!response.ok) {
                let errorBody = null; try { errorBody = await response.json(); } catch (e) { /* Ignora */ }
                const errorMessage = errorBody?.erro || `Erro na API: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            return await response.json(); // Retorna { mensagem: '...' }
        } catch (error) {
            console.error(`Falha ao deletar pagamento ${pagamentoId}:`, error);
            return { error: error.message || 'Erro desconhecido ao deletar pagamento.' };
        }
    });

}

// Exporta a função de registro
module.exports = { registerPagamentoHandlers };