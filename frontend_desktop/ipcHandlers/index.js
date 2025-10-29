// ipcHandlers/index.js
const { registerProdutorHandlers } = require('./produtorHandlers');
const { registerServicoHandlers } = require('./servicoHandlers');
const { registerExecucaoHandlers } = require('./execucaoHandlers');
// Mark Construtor: Importamos o NOVO registrador de Pagamentos
const { registerPagamentoHandlers } = require('./pagamentoHandlers');

/**
 * Função principal que registra TODOS os handlers
 * de IPC (API) da nossa aplicação.
 */
function registerIpcHandlers() {
    console.log("Registrando handlers de IPC...");

    registerProdutorHandlers();
    registerServicoHandlers();
    registerExecucaoHandlers();
    registerPagamentoHandlers(); // <-- REGISTRAMOS O NOVO MÓDULO

    console.log("Handlers de IPC registrados.");
}

module.exports = { registerIpcHandlers };