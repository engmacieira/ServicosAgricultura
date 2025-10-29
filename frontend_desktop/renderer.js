// renderer.js (Nosso Módulo "Controlador" Principal)

// Importamos TODAS as funções da nossa "View" (ui.js)
import * as ui from './ui.js';

// Pegamos a "api" segura que o preload.js expôs
const api = window.api;

// Variáveis de estado/cache
let agendamentoDropdownsCarregados = false;
let historicoCarregadoPrimeiraVez = false;
let pagamentosDropdownCarregado = false; 
let relatorioProdutoresCarregado = false; 
let cacheProdutores = []; 
let cacheServicos = [];
let cacheExecucoes = [];

// ======================================================
// 1. HANDLERS DE LÓGICA - PRODUTORES
// ======================================================
async function carregarProdutores() {
    try {
        cacheProdutores = await api.getProdutores(); 
        ui.desenharListaProdutores(cacheProdutores, handleEditProdutor, handleDeleteProdutor);
    } catch (error) {
        console.error("Erro ao carregar produtores:", error);
        alert("Falha grave ao buscar produtores.");
    }
}
async function handleSaveProdutor(event) {
    event.preventDefault(); 
    const id = ui.getIdProdutor();
    const dadosProdutor = ui.coletarDadosProdutor();
    try {
        if (id) {
            const atualizado = await api.updateProdutor(id, dadosProdutor);
            if (!atualizado) throw new Error("API não retornou o produtor atualizado.");
            alert(`Produtor "${atualizado.nome}" atualizado!`);
        } else {
            const novo = await api.createProdutor(dadosProdutor);
            if (!novo) throw new Error("API não retornou o novo produtor.");
            alert(`Produtor "${novo.nome}" criado com ID: ${novo.id}`);
        }
        ui.limparFormularioProdutor();
        await carregarProdutores(); 
        relatorioProdutoresCarregado = false;
    } catch (error) {
        console.error("Erro ao salvar produtor:", error);
        alert("Falha ao salvar produtor.");
    }
}
function handleClearProdutor() {
    ui.limparFormularioProdutor();
}
function handleEditProdutor(produtor) {
    ui.preencherFormularioProdutor(produtor);
}
async function handleDeleteProdutor(id) {
    if (confirm(`Tem certeza que deseja excluir o produtor ID ${id}?`)) {
        try {
            await api.deleteProdutor(id);
            alert(`Produtor ID ${id} excluído com sucesso.`);
            await carregarProdutores(); 
            ui.limparFormularioProdutor();
            relatorioProdutoresCarregado = false;
        } catch (error) {
            console.error(`Erro ao excluir produtor ${id}:`, error);
            alert("Falha ao excluir. (Verifique se o produtor não possui execuções de serviço.)");
        }
    }
}

// ======================================================
// 2. HANDLERS DE LÓGICA - SERVIÇOS
// ======================================================
async function carregarServicos() {
     try {
        cacheServicos = await api.getServicos(); 
        ui.desenharListaServicos(cacheServicos, handleEditServico, handleDeleteServico);
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        alert("Falha grave ao buscar serviços.");
    }
}
async function handleSaveServico(event) {
    event.preventDefault();
    const id = ui.getIdServico();
    const dadosServico = ui.coletarDadosServico();
    try {
        if (id) {
            const atualizado = await api.updateServico(id, dadosServico);
            if (!atualizado) throw new Error("API não retornou o serviço atualizado.");
            alert(`Serviço "${atualizado.nome}" atualizado!`);
        } else {
            const novo = await api.createServico(dadosServico);
            if (!novo) throw new Error("API não retornou o novo serviço.");
            alert(`Serviço "${novo.nome}" criado com ID: ${novo.id}`);
        }
        ui.limparFormularioServico();
        await carregarServicos(); 
    } catch (error) {
        console.error("Erro ao salvar serviço:", error);
        alert("Falha ao salvar serviço. (Verifique se o nome já existe)");
    }
}
function handleClearServico() {
    ui.limparFormularioServico();
}
function handleEditServico(servico) {
    ui.preencherFormularioServico(servico);
}
async function handleDeleteServico(id) {
    if (confirm(`Tem certeza que deseja excluir o serviço ID ${id}?`)) {
        try {
            await api.deleteServico(id);
            alert(`Serviço ID ${id} excluído com sucesso.`);
            await carregarServicos(); 
            ui.limparFormularioServico();
        } catch (error) {
            console.error(`Erro ao excluir serviço ${id}:`, error);
            alert("Falha ao excluir. (Verifique se o serviço não está sendo usado em uma execução.)");
        }
    }
}


// ======================================================
// 3. HANDLERS DE LÓGICA - AGENDAMENTO
// ======================================================
async function carregarDadosAgendamento() {
    if (agendamentoDropdownsCarregados) return;
    console.log("Carregando dados para dropdowns de agendamento...");
    try {
        if (cacheProdutores.length === 0) cacheProdutores = await api.getProdutores();
        if (cacheServicos.length === 0) cacheServicos = await api.getServicos();
        ui.popularDropdownProdutores(cacheProdutores);
        ui.popularDropdownServicos(cacheServicos);
        agendamentoDropdownsCarregados = true;
        console.log("Dropdowns de agendamento populados.");
    } catch (error) {
        console.error("Erro ao carregar dados para agendamento:", error);
        alert("Falha ao carregar dados para agendamento. Verifique o console.");
    }
}
async function handleSaveExecucao(event) {
    event.preventDefault();
    const id = ui.getIdAgendamento(); 
    const dadosExecucao = ui.coletarDadosAgendamento();
    if (!dadosExecucao) return;
    try {
        let resultado;
        if (id) {
            console.log(`Atualizando execução ID: ${id}`);
            resultado = await api.updateExecucao(id, dadosExecucao);
            if (resultado && resultado.error) throw new Error(resultado.error);
            if (!resultado) throw new Error("API não retornou a execução atualizada.");
            alert(`Agendamento ID ${resultado.id} atualizado com sucesso!`);
        } else {
            console.log("Criando nova execução...");
            resultado = await api.createExecucao(dadosExecucao);
            if (resultado && resultado.error) throw new Error(resultado.error);
            if (!resultado) throw new Error("API não retornou a nova execução.");
            alert(`Agendamento criado com sucesso! ID: ${resultado.id}`);
        }
        ui.limparFormularioAgendamento();
        historicoCarregadoPrimeiraVez = false; 
        pagamentosDropdownCarregado = false; 
    } catch (error) {
        console.error("Erro ao salvar agendamento:", error);
        alert(`Falha ao salvar agendamento: ${error.message}`);
    }
}
function handleClearAgendamento() {
    ui.limparFormularioAgendamento();
}


// ======================================================
// 4. HANDLERS DE LÓGICA - HISTÓRICO
// ======================================================
async function carregarExecucoes() {
    if (historicoCarregadoPrimeiraVez) return; 
    console.log("Carregando histórico de execuções...");
    
    try {
        if (cacheProdutores.length === 0) cacheProdutores = await api.getProdutores();
        if (cacheServicos.length === 0) cacheServicos = await api.getServicos();
        cacheExecucoes = await api.getExecucoes(); 

        const produtoresMap = cacheProdutores.reduce((map, prod) => { map[prod.id] = prod.nome; return map; }, {});
        const servicosMap = cacheServicos.reduce((map, serv) => { map[serv.id] = serv.nome; return map; }, {});

        ui.desenharListaExecucoes(cacheExecucoes, produtoresMap, servicosMap, handleEditExecucao, handleDeleteExecucao);

        historicoCarregadoPrimeiraVez = true;
        console.log("Histórico carregado.");

    } catch (error) {
         console.error("Erro ao carregar histórico de execuções:", error);
         alert("Falha grave ao buscar histórico.");
         ui.desenharListaExecucoes([], {}, {}, handleEditExecucao, handleDeleteExecucao); 
    }
}
function handleEditExecucao(execucao) {
    console.log("Editando execução:", execucao);
    carregarDadosAgendamento().then(() => {
        ui.preencherFormularioAgendamento(execucao);
        const agendamentoTabButton = document.querySelector('button[data-tab="painel-agendamento"]');
        if (agendamentoTabButton) {
            ui.trocarAba(agendamentoTabButton);
        } else {
            console.error("Não foi possível encontrar o botão da aba de agendamento.");
        }
    }).catch(error => {
        console.error("Erro ao preparar edição de execução:", error);
        alert("Erro ao carregar dados para edição.");
    });
}
async function handleDeleteExecucao(id) {
    if (confirm(`Tem certeza que deseja excluir o agendamento ID ${id}? (Pagamentos associados também serão excluídos!)`)) {
        try {
            console.log(`Excluindo execução ID: ${id}`);
            const resultado = await api.deleteExecucao(id);
            if (resultado && resultado.error) throw new Error(resultado.error);
            alert(`Agendamento ID ${id} excluído com sucesso.`);
            pagamentosDropdownCarregado = false; 
            historicoCarregadoPrimeiraVez = false; 
            await carregarExecucoes(); 
        } catch (error) {
            console.error(`Erro ao excluir execução ${id}:`, error);
            alert(`Falha ao excluir agendamento: ${error.message}`);
        }
    }
}


// ======================================================
// 5. HANDLERS DE LÓGICA - PAGAMENTOS
// ======================================================
async function carregarDadosPagamentos() {
    if (pagamentosDropdownCarregado) return;
    console.log("Carregando dados para dropdown de pagamentos...");
    try {
        if (cacheProdutores.length === 0) cacheProdutores = await api.getProdutores();
        if (cacheServicos.length === 0) cacheServicos = await api.getServicos();
        cacheExecucoes = await api.getExecucoes();

        const produtoresMap = cacheProdutores.reduce((map, prod) => { map[prod.id] = prod.nome; return map; }, {});
        const servicosMap = cacheServicos.reduce((map, serv) => { map[serv.id] = serv.nome; return map; }, {});

        ui.popularDropdownExecucoesPagamentos(cacheExecucoes, produtoresMap, servicosMap);
        pagamentosDropdownCarregado = true;
        console.log("Dropdown de pagamentos populado.");

    } catch (error) {
        console.error("Erro ao carregar dados para pagamentos:", error);
        alert("Falha ao carregar dados para pagamentos.");
        ui.popularDropdownExecucoesPagamentos([], {}, {});
    }
}
async function handleExecucaoSelecionada(event) {
    const selectElement = event.target;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const execucaoId = selectedOption.value;

    if (!execucaoId) {
        ui.exibirDetalhesExecucaoPagamentos(null, null, null, []);
        ui.desenharListaPagamentos([], handleEditPagamento, handleDeletePagamento);
        return;
    }
    try {
        console.log(`Buscando pagamentos para execução ID: ${execucaoId}`);
        const execucao = JSON.parse(selectedOption.dataset.execucao);
        const nomeProdutor = selectedOption.dataset.produtorNome;
        const nomeServico = selectedOption.dataset.servicoNome;
        const pagamentos = await api.getPagamentosPorExecucao(execucaoId);
        ui.exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, pagamentos);
        ui.desenharListaPagamentos(pagamentos, handleEditPagamento, handleDeletePagamento);
        ui.limparFormularioPagamento(); 
    } catch (error) {
        console.error(`Erro ao buscar pagamentos para execução ${execucaoId}:`, error);
        alert("Falha ao buscar pagamentos para a execução selecionada.");
        ui.exibirDetalhesExecucaoPagamentos(null, null, null, []);
        ui.desenharListaPagamentos([], handleEditPagamento, handleDeletePagamento);
    }
}
async function handleSavePagamento(event) {
    event.preventDefault();
    const idPagamento = ui.getIdPagamento();
    const dadosPagamento = ui.coletarDadosPagamento();
    if (!dadosPagamento) return;

    const execucaoIdSelecionada = document.getElementById('pagamentos-select-execucao').value;
     if (!execucaoIdSelecionada) {
         alert("Erro interno: Nenhuma execução selecionada para associar o pagamento.");
         return;
     }
    try {
        let resultado;
        if (idPagamento) {
            console.log(`Atualizando pagamento ID: ${idPagamento}`);
            resultado = await api.updatePagamento(idPagamento, dadosPagamento);
             if (resultado && resultado.error) throw new Error(resultado.error);
            if (!resultado) throw new Error("API não retornou o pagamento atualizado.");
            alert(`Pagamento ID ${resultado.id} atualizado!`);
        } else {
             console.log(`Criando pagamento para execução ID: ${execucaoIdSelecionada}`);
             resultado = await api.createPagamento(execucaoIdSelecionada, dadosPagamento);
             if (resultado && resultado.error) throw new Error(resultado.error);
             if (!resultado) throw new Error("API não retornou o novo pagamento.");
             alert(`Pagamento criado com ID: ${resultado.id}`);
        }
        await refreshPagamentosVisiveis();
        ui.limparFormularioPagamento();
    } catch (error) {
        console.error("Erro ao salvar pagamento:", error);
        alert(`Falha ao salvar pagamento: ${error.message}`);
    }
}
function handleClearPagamento() {
    ui.limparFormularioPagamento();
}
function handleEditPagamento(pagamento) {
    console.log("Editando pagamento:", pagamento);
    ui.preencherFormularioPagamento(pagamento);
}
async function handleDeletePagamento(id) {
     if (confirm(`Tem certeza que deseja excluir o pagamento ID ${id}?`)) {
        try {
            console.log(`Excluindo pagamento ID: ${id}`);
            const resultado = await api.deletePagamento(id);
            if (resultado && resultado.error) throw new Error(resultado.error);
            alert(`Pagamento ID ${id} excluído com sucesso.`);
             await refreshPagamentosVisiveis();
             ui.limparFormularioPagamento();
        } catch (error) {
            console.error(`Erro ao excluir pagamento ${id}:`, error);
            alert(`Falha ao excluir pagamento: ${error.message}`);
        }
    }
}
function handleCancelEditPagamento() {
    ui.limparFormularioPagamento();
}
async function refreshPagamentosVisiveis() {
    const selectElement = document.getElementById('pagamentos-select-execucao');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const execucaoId = selectedOption.value;
     if (!execucaoId) return; 
     try {
        const execucao = JSON.parse(selectedOption.dataset.execucao);
        const nomeProdutor = selectedOption.dataset.produtorNome;
        const nomeServico = selectedOption.dataset.servicoNome;
        const pagamentos = await api.getPagamentosPorExecucao(execucaoId);
        ui.exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, pagamentos);
        ui.desenharListaPagamentos(pagamentos, handleEditPagamento, handleDeletePagamento);
     } catch(error) {
         console.error("Erro ao refrescar pagamentos:", error);
     }
}

// ======================================================
// 6. HANDLERS DE LÓGICA - RELATÓRIOS
// ======================================================
async function carregarDadosRelatorios() {
    if (relatorioProdutoresCarregado) return;
    console.log("Carregando produtores para dropdown de relatórios...");
    
    try {
        if (cacheProdutores.length === 0) cacheProdutores = await api.getProdutores();
        ui.popularDropdownRelatorioProdutores(cacheProdutores);
        relatorioProdutoresCarregado = true;
        console.log("Dropdown de relatórios populado.");

    } catch (error) {
         console.error("Erro ao carregar dados para relatórios:", error);
         alert("Falha grave ao buscar produtores para o relatório.");
         ui.popularDropdownRelatorioProdutores([]); 
    }
}
async function handleRelatorioProdutorSelecionado(event) {
    const selectElement = event.target;
    const produtorId = selectElement.value;

    if (!produtorId) {
        ui.desenharRelatorioDividas([]); 
        return;
    }
    try {
        console.log(`Buscando relatório de dívidas para produtor ID: ${produtorId}`);
        const dividas = await api.getRelatorioDividas(produtorId);
        if (dividas && dividas.error) throw new Error(dividas.error);
        ui.desenharRelatorioDividas(dividas);
    } catch (error) {
        console.error(`Erro ao buscar relatório de dívidas para produtor ${produtorId}:`, error);
        alert("Falha ao buscar relatório de dívidas.");
        ui.desenharRelatorioDividas(null); 
    }
}


// ======================================================
// 7. INICIALIZAÇÃO E EVENTOS (A "COLA")
// ======================================================

/**
 * Esta é a função de callback que o ui.js chamará quando uma aba for trocada.
 * @param {string} painelId - O ID do painel que está sendo ativado.
 */
function handleTabChange(painelId) {
    console.log(`Renderer: Aba ${painelId} ativada.`);
    switch (painelId) {
        case 'painel-produtores':
            carregarProdutores(); 
            break;
        case 'painel-servicos':
            carregarServicos();
            break;
        case 'painel-agendamento':
            carregarDadosAgendamento();
            break;
        case 'painel-historico':
            carregarExecucoes(); 
            break;
        case 'painel-pagamentos':
            carregarDadosPagamentos();
            break;
        case 'painel-relatorios':
            carregarDadosRelatorios(); 
            break;
    }
}

/**
 * Mark Construtor: PONTO DE ENTRADA PRINCIPAL (Refatorado)
 * * Nós não esperamos pelo DOM aqui. Nós passamos os handlers para o ui.js,
 * e ele vai esperar pelo DOM antes de fazer qualquer coisa.
 */
ui.inicializarApp({
    // Passa todas as nossas funções de lógica (handlers) para a View
    onTabChange: handleTabChange,
    onSaveProdutor: handleSaveProdutor,
    onClearProdutor: handleClearProdutor,
    onSaveServico: handleSaveServico,
    onClearServico: handleClearServico,
    onSaveExecucao: handleSaveExecucao,
    onClearAgendamento: handleClearAgendamento,
    onExecucaoSelecionada: handleExecucaoSelecionada,
    onSavePagamento: handleSavePagamento,
    onClearPagamento: handleClearPagamento,
    onCancelEditPagamento: handleCancelEditPagamento,
    onRelatorioProdutorSelecionado: handleRelatorioProdutorSelecionado
});