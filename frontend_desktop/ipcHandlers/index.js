const { registerProdutorHandlers } = require('./produtorHandlers');
const { registerServicoHandlers } = require('./servicoHandlers');
const { registerExecucaoHandlers } = require('./execucaoHandlers');
const { registerPagamentoHandlers } = require('./pagamentoHandlers');
const { registerLogHandlers } = require('./logHandlers');
const log = require('electron-log');

const { registerRelatorioHandlers } = require('./relatorioHandlers');

function registerIpcHandlers() {
    console.log("Registrando handlers de IPC...");

    registerProdutorHandlers();
    registerServicoHandlers();
    registerExecucaoHandlers();
    registerPagamentoHandlers(); 
    
    registerRelatorioHandlers();

    registerLogHandlers();

    console.log("Handlers de IPC registrados.");
}

module.exports = { registerIpcHandlers };