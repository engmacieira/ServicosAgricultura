// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Mark Construtor: Estamos a expandir o nosso objeto 'api'
// com as novas habilidades que registámos nos handlers.
contextBridge.exposeInMainWorld('api', {
  
  // --- PRODUTORES (Já existiam) ---
  getProdutores: () => {
    return ipcRenderer.invoke('get-produtores');
  },
  createProdutor: (produtorData) => {
    return ipcRenderer.invoke('create-produtor', produtorData); 
  },
  updateProdutor: (produtorId, produtorData) => {
    return ipcRenderer.invoke('update-produtor', produtorId, produtorData);
  },
  deleteProdutor: (produtorId) => {
    return ipcRenderer.invoke('delete-produtor', produtorId);
  },
  
  // --- SERVIÇOS (NOVOS) ---
  getServicos: () => {
    // Invoca o handler 'get-servicos' no main.js (via ipcHandlers)
    return ipcRenderer.invoke('get-servicos');
  },
  createServico: (servicoData) => {
    // Invoca o handler 'create-servico'
    return ipcRenderer.invoke('create-servico', servicoData); 
  },
  updateServico: (servicoId, servicoData) => {
    // Invoca o handler 'update-servico'
    return ipcRenderer.invoke('update-servico', servicoId, servicoData);
  },
  deleteServico: (servicoId) => {
    // Invoca o handler 'delete-servico'
    return ipcRenderer.invoke('delete-servico', servicoId);
  }
  
});