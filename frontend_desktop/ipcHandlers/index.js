// ipcHandlers/index.js
const { registerProdutorHandlers } = require('./produtorHandlers');
// Mark Construtor: Importamos o NOVO registrador
const { registerServicoHandlers } = require('./servicoHandlers');

/**
 * Função principal que registra TODOS os handlers
 * de IPC (API) da nossa aplicação.
 */
function registerIpcHandlers() {
    console.log("Registrando handlers de IPC...");
    
    registerProdutorHandlers();
    registerServicoHandlers(); // <-- REGISTRAMOS O NOVO MÓDULO
    // Em breve: registerExecucaoHandlers();
    
    console.log("Handlers de IPC registrados.");
}

module.exports = { registerIpcHandlers };