// ipcHandlers/index.js
const { registerProdutorHandlers } = require('./produtorHandlers');
const { registerServicoHandlers } = require('./servicoHandlers');
const { registerExecucaoHandlers } = require('./execucaoHandlers');
const { registerPagamentoHandlers } = require('./pagamentoHandlers');

// Mark Construtor: TAREFA 3.1 - Importamos o NOVO registrador de Relatórios
const { registerRelatorioHandlers } = require('./relatorioHandlers');

/**
 * Função principal que registra TODOS os handlers
 * de IPC (API) da nossa aplicação.
 */
function registerIpcHandlers() {
    console.log("Registrando handlers de IPC...");

    registerProdutorHandlers();
    registerServicoHandlers();
    registerExecucaoHandlers();
    registerPagamentoHandlers(); 
    
    // Mark Construtor: TAREFA 3.2 - REGISTRAMOS O NOVO MÓDULO
    registerRelatorioHandlers();

    console.log("Handlers de IPC registrados.");
}

module.exports = { registerIpcHandlers };