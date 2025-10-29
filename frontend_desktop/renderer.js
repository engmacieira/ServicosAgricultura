// renderer.js (Nosso Módulo "Controlador" Principal)

// Mark Construtor: Importamos TODAS as funções da nossa "View" (ui.js)
// Damos a elas o apelido 'ui'
import * as ui from './ui.js';

// Pegamos a "api" segura que o preload.js expôs
const api = window.api;

// ======================================================
// 1. HANDLERS DE LÓGICA - PRODUTORES
// ======================================================

/**
 * Busca os produtores na API e manda a UI desenhá-los.
 */
async function carregarProdutores() {
    try {
        const produtores = await api.getProdutores();
        // Passamos os "callbacks" (o que fazer ao clicar)
        ui.desenharListaProdutores(produtores, handleEditProdutor, handleDeleteProdutor);
    } catch (error) {
        console.error("Erro ao carregar produtores:", error);
        alert("Falha grave ao buscar produtores.");
    }
}

/**
 * Lógica de Salvar (Criar ou Atualizar) um Produtor.
 */
async function handleSaveProdutor(event) {
    event.preventDefault(); // Impede o formulário de recarregar a página
    
    const id = ui.getIdProdutor();
    const dadosProdutor = ui.coletarDadosProdutor();
    
    try {
        if (id) {
            // Atualizar (Update)
            const atualizado = await api.updateProdutor(id, dadosProdutor);
            if (!atualizado) throw new Error("API não retornou o produtor atualizado.");
            alert(`Produtor "${atualizado.nome}" atualizado!`);
        } else {
            // Criar (Create)
            const novo = await api.createProdutor(dadosProdutor);
            if (!novo) throw new Error("API não retornou o novo produtor.");
            alert(`Produtor "${novo.nome}" criado com ID: ${novo.id}`);
        }
        
        ui.limparFormularioProdutor();
        await carregarProdutores(); // Recarrega a lista
        
    } catch (error) {
        console.error("Erro ao salvar produtor:", error);
        alert("Falha ao salvar produtor.");
    }
}

/** Lógica de "Limpar" o formulário de Produtor. */
function handleClearProdutor() {
    ui.limparFormularioProdutor();
}

/** Lógica de "Editar" um Produtor (chamado pela UI). */
function handleEditProdutor(produtor) {
    ui.preencherFormularioProdutor(produtor);
}

/** Lógica de "Excluir" um Produtor (chamado pela UI). */
async function handleDeleteProdutor(id) {
    if (confirm(`Tem certeza que deseja excluir o produtor ID ${id}?`)) {
        try {
            await api.deleteProdutor(id);
            alert(`Produtor ID ${id} excluído com sucesso.`);
            await carregarProdutores(); // Recarrega a lista
            ui.limparFormularioProdutor(); // Limpa o form (caso estivesse em edição)
        } catch (error) {
            console.error(`Erro ao excluir produtor ${id}:`, error);
            alert("Falha ao excluir. (Verifique se o produtor não possui execuções de serviço.)");
        }
    }
}

// ======================================================
// 2. HANDLERS DE LÓGICA - SERVIÇOS (NOVOS)
// ======================================================

/**
 * Busca os serviços na API e manda a UI desenhá-los.
 */
async function carregarServicos() {
    try {
        const servicos = await api.getServicos();
        ui.desenharListaServicos(servicos, handleEditServico, handleDeleteServico);
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        alert("Falha grave ao buscar serviços.");
    }
}

/**
 * Lógica de Salvar (Criar ou Atualizar) um Serviço.
 */
async function handleSaveServico(event) {
    event.preventDefault();
    
    const id = ui.getIdServico();
    const dadosServico = ui.coletarDadosServico();
    
    try {
        if (id) {
            // Atualizar (Update)
            const atualizado = await api.updateServico(id, dadosServico);
            if (!atualizado) throw new Error("API não retornou o serviço atualizado.");
            alert(`Serviço "${atualizado.nome}" atualizado!`);
        } else {
            // Criar (Create)
            const novo = await api.createServico(dadosServico);
            if (!novo) throw new Error("API não retornou o novo serviço.");
            alert(`Serviço "${novo.nome}" criado com ID: ${novo.id}`);
        }
        
        ui.limparFormularioServico();
        await carregarServicos(); // Recarrega a lista
        
    } catch (error) {
        console.error("Erro ao salvar serviço:", error);
        alert("Falha ao salvar serviço. (Verifique se o nome já existe)");
    }
}

/** Lógica de "Limpar" o formulário de Serviço. */
function handleClearServico() {
    ui.limparFormularioServico();
}

/** Lógica de "Editar" um Serviço (chamado pela UI). */
function handleEditServico(servico) {
    ui.preencherFormularioServico(servico);
}

/** Lógica de "Excluir" um Serviço (chamado pela UI). */
async function handleDeleteServico(id) {
    if (confirm(`Tem certeza que deseja excluir o serviço ID ${id}?`)) {
        try {
            await api.deleteServico(id);
            alert(`Serviço ID ${id} excluído com sucesso.`);
            await carregarServicos(); // Recarrega a lista
            ui.limparFormularioServico(); // Limpa o form
        } catch (error) {
            console.error(`Erro ao excluir serviço ${id}:`, error);
            alert("Falha ao excluir. (Verifique se o serviço não está sendo usado em uma execução.)");
        }
    }
}

// ======================================================
// 3. INICIALIZAÇÃO DO APP
// ======================================================

/**
 * Função principal que "liga" o app.
 */
function inicializar() {
    // 1. Liga a lógica das Abas
    ui.inicializarAbas(handleTabChange);
    
    // 2. "Amarra" os eventos do painel PRODUTORES
    document.getElementById('produtor-form').addEventListener('submit', handleSaveProdutor);
    document.getElementById('produtor-btn-limpar').addEventListener('click', handleClearProdutor);
    
    // 3. "Amarra" os eventos do painel SERVIÇOS
    document.getElementById('servico-form').addEventListener('submit', handleSaveServico);
    document.getElementById('servico-btn-limpar').addEventListener('click', handleClearServico);
    
    // 4. Carrega os dados da primeira aba (Produtores)
    carregarProdutores();
}

/**
 * Função chamada pela UI (via callback) quando o usuário troca de aba.
 */
function handleTabChange(tabId) {
    console.log("Trocando para a aba:", tabId);
    // Otimização: Carrega os dados da aba *somente* quando ela é clicada
    if (tabId === 'painel-produtores') {
        carregarProdutores();
    } else if (tabId === 'painel-servicos') {
        carregarServicos();
    }
}

// "Liga" o app
inicializar();