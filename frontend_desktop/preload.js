// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  // --- PRODUTORES ---
  getProdutores: () => ipcRenderer.invoke('get-produtores'),
  createProdutor: (produtorData) => ipcRenderer.invoke('create-produtor', produtorData),
  updateProdutor: (produtorId, produtorData) => ipcRenderer.invoke('update-produtor', produtorId, produtorData),
  deleteProdutor: (produtorId) => ipcRenderer.invoke('delete-produtor', produtorId),

  // --- SERVIÇOS ---
  getServicos: () => ipcRenderer.invoke('get-servicos'),
  createServico: (servicoData) => ipcRenderer.invoke('create-servico', servicoData),
  updateServico: (servicoId, servicoData) => ipcRenderer.invoke('update-servico', servicoId, servicoData),
  deleteServico: (servicoId) => ipcRenderer.invoke('delete-servico', servicoId),

  // --- EXECUÇÕES ---
  createExecucao: (execucaoData) => ipcRenderer.invoke('create-execucao', execucaoData),
  getExecucoes: () => ipcRenderer.invoke('get-execucoes'),
  updateExecucao: (execucaoId, execucaoData) => ipcRenderer.invoke('update-execucao', execucaoId, execucaoData),
  deleteExecucao: (execucaoId) => ipcRenderer.invoke('delete-execucao', execucaoId),

  // --- PAGAMENTOS ---
  getPagamentosPorExecucao: (execucaoId) => {
    return ipcRenderer.invoke('get-pagamentos-por-execucao', execucaoId);
  },
  createPagamento: (execucaoId, pagamentoData) => {
    return ipcRenderer.invoke('create-pagamento', execucaoId, pagamentoData);
  },
  updatePagamento: (pagamentoId, pagamentoData) => {
    return ipcRenderer.invoke('update-pagamento', pagamentoId, pagamentoData);
  },
  deletePagamento: (pagamentoId) => {
    return ipcRenderer.invoke('delete-pagamento', pagamentoId);
  },
  
  // --- Mark Construtor: TAREFA 4 ---
  // --- RELATÓRIOS (NOVO) ---
  getRelatorioDividas: (produtorId) => {
    // Invoca o handler 'get-relatorio-dividas'
    return ipcRenderer.invoke('get-relatorio-dividas', produtorId);
  }

});