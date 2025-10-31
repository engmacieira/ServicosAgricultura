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
let cachePagamentosAtuais = [];
let produtoresPaginaAtual = 1;
let produtoresTotalPaginas = 1;
let servicosPaginaAtual = 1;
let servicosTotalPaginas = 1;
let historicoPaginaAtual = 1;
let historicoTotalPaginas = 1;

// ======================================================
// 1. HANDLERS DE LÓGICA - PRODUTORES
// ======================================================
async function carregarProdutores(page = 1) {
    try {
        console.log(`Buscando produtores - Página ${page}`);
        // 1. Busca os dados paginados da API
        const paginatedData = await api.getProdutores(page); 
        
        // 2. Atualiza nosso cache e estado
        // (Nota: cacheProdutores agora só guarda os 10 itens da página atual)
        cacheProdutores = paginatedData.produtores; 
        produtoresPaginaAtual = paginatedData.current_page;
        produtoresTotalPaginas = paginatedData.total_pages || 1;

        // 3. Manda a UI desenhar a lista E os controles de paginação
        ui.desenharListaProdutores(paginatedData);
        
    } catch (error) {
        console.error("Erro ao carregar produtores:", error);
        alert("Falha grave ao buscar produtores.");
    }
}
// CÓDIGO NOVO (adaptado para paginação)
async function handleSaveProdutor(event) {
    event.preventDefault(); 
    const id = ui.getIdProdutor();
    const dadosProdutor = ui.coletarDadosProdutor();
    if (!dadosProdutor) return; 

    try {
        let produtorSalvo;
        if (id) {
            // --- LÓGICA DE UPDATE (EDIÇÃO) ---
            produtorSalvo = await api.updateProdutor(id, dadosProdutor);
            if (!produtorSalvo || produtorSalvo.error) throw new Error(produtorSalvo?.error || "API não retornou o produtor atualizado.");
            
            alert(`Produtor "${produtorSalvo.nome}" atualizado!`);
            
            // Recarrega a página ATUAL para refletir a mudança
            await carregarProdutores(produtoresPaginaAtual); 
            
        } else {
            // --- LÓGICA DE CREATE (NOVO) ---
            produtorSalvo = await api.createProdutor(dadosProdutor);
            if (!produtorSalvo || produtorSalvo.error) throw new Error(produtorSalvo?.error || "API não retornou o novo produtor.");
            
            alert(`Produtor "${produtorSalvo.nome}" criado com ID: ${produtorSalvo.id}`);
            
            // Recarrega a PÁGINA 1 (para mostrar o novo item)
            await carregarProdutores(1); 
        }
        
        ui.limparFormularioProdutor();
        
        // Invalida caches dependentes (correto)
        relatorioProdutoresCarregado = false;
        agendamentoDropdownsCarregados = false;
        
    } catch (error) {
        console.error("Erro ao salvar produtor:", error);
        alert(`Falha ao salvar produtor: ${error.message}`);
        // PLANO B: Se tudo falhar, recarrega
        await carregarProdutores(produtoresPaginaAtual); 
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
            await carregarProdutores(produtoresPaginaAtual);
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
async function carregarServicos(page = 1) {
     try {
        console.log(`Buscando serviços - Página ${page}`);
        // 1. Busca os dados paginados da API
        const paginatedData = await api.getServicos(page);

        // 2. Atualiza nosso cache e estado
        cacheServicos = paginatedData.servicos; // Cache agora é só da página atual
        servicosPaginaAtual = paginatedData.current_page;
        servicosTotalPaginas = paginatedData.total_pages || 1;

        // 3. Manda a UI desenhar
        ui.desenharListaServicos(paginatedData);

    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        alert("Falha grave ao buscar serviços.");
    }
}
async function handleSaveServico(event) {
    event.preventDefault();
    const id = ui.getIdServico();
    const dadosServico = ui.coletarDadosServico();
    if (!dadosServico) return; // Proteção

    try {
        let servicoSalvo;
        if (id) {
            // --- LÓGICA DE UPDATE (EDIÇÃO) ---
            servicoSalvo = await api.updateServico(id, dadosServico);
            if (!servicoSalvo || servicoSalvo.error) throw new Error(servicoSalvo?.error || "API não retornou o serviço atualizado.");
            
            alert(`Serviço "${servicoSalvo.nome}" atualizado!`);

            // Recarrega a página ATUAL
            await carregarServicos(servicosPaginaAtual);
            
        } else {
            // --- LÓGICA DE CREATE (NOVO) ---
            servicoSalvo = await api.createServico(dadosServico);
            if (!servicoSalvo || servicoSalvo.error) throw new Error(servicoSalvo?.error || "API não retornou o novo serviço.");
            
            alert(`Serviço "${servicoSalvo.nome}" criado com ID: ${servicoSalvo.id}`);

            // Recarrega a PÁGINA 1
            await carregarServicos(1);
        }
        
        ui.limparFormularioServico();
        
        // Invalida cache dependente
        agendamentoDropdownsCarregados = false;
        
    } catch (error) {
        console.error("Erro ao salvar serviço:", error);
        alert(`Falha ao salvar serviço: ${error.message}`);
        // PLANO B: Recarrega do zero em caso de erro
        await carregarServicos(servicosPaginaAtual);
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
            await carregarServicos(servicosPaginaAtual); // Recarrega a página atual
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

// Mark Construtor: Esta função foi restaurada após a exclusão acidental durante a refatoração.
// CÓDIGO NOVO (Backend já traz os nomes)
async function carregarExecucoes(page = 1) {
    console.log(`Carregando Execuções - Página ${page}`);
    try {
        // 1. Busca os dados paginados da API
        // A API agora retorna tudo pronto!
        const paginatedData = await api.getExecucoes(page);

        // 2. Atualiza nosso estado (não precisamos mais de cacheExecucoes)
        historicoPaginaAtual = paginatedData.current_page;
        historicoTotalPaginas = paginatedData.total_pages || 1;

        // 3. Manda a UI desenhar
        // Não precisamos mais passar 'produtoresMap' ou 'servicosMap'
        ui.desenharListaExecucoes(paginatedData);
        
        console.log("Execuções carregadas e lista desenhada.");

    } catch (error) {
        console.error("Erro ao carregar execuções:", error);
        alert("Falha grave ao buscar o histórico de execuções.");
    }
}

async function carregarDadosAgendamento() {
    // Não usamos mais 'agendamentoDropdownsCarregados'.
    // Apenas garantimos que os caches estejam cheios ou atualizados.
    console.log("Carregando dados para dropdowns de agendamento...");
    try {
        // Sempre busca Produtores e Serviços se o cache estiver vazio
        if (cacheProdutores.length === 0) {
            cacheProdutores = await api.getProdutores();
        }
        if (cacheServicos.length === 0) {
            cacheServicos = await api.getServicos();
        }
        
        // CORREÇÃO ESSENCIAL: Garante que os dropdowns sempre são populados
        // com o cache mais recente, independentemente de onde ele veio.
        ui.popularDropdownProdutores(cacheProdutores);
        ui.popularDropdownServicos(cacheServicos);
        
        // Remova a linha 'agendamentoDropdownsCarregados = true;'
        
        console.log("Dropdowns de agendamento populados.");
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
            await carregarExecucoes(historicoPaginaAtual); // Recarrega a página atual
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
        cachePagamentosAtuais = pagamentos;
        ui.exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, cachePagamentosAtuais);
        ui.desenharListaPagamentos(cachePagamentosAtuais, handleEditPagamento, handleDeletePagamento);
        ui.limparFormularioPagamento(); 
    } catch (error) {
        console.error(`Erro ao buscar pagamentos para execução ${execucaoId}:`, error);
        alert("Falha ao buscar pagamentos para a execução selecionada.");
        ui.exibirDetalhesExecucaoPagamentos(null, null, null, []);
        ui.desenharListaPagamentos([], handleEditPagamento, handleDeletePagamento);
    }
}
// CÓDIGO NOVO (Otimizado)
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
        let pagamentoSalvo;
        if (idPagamento) {
            // 1. Salva na API
            console.log(`Atualizando pagamento ID: ${idPagamento}`);
            pagamentoSalvo = await api.updatePagamento(idPagamento, dadosPagamento);
            if (pagamentoSalvo && pagamentoSalvo.error) throw new Error(pagamentoSalvo.error);
            if (!pagamentoSalvo) throw new Error("API não retornou o pagamento atualizado.");
            
            // 2. OTIMIZAÇÃO: Atualiza o cache local
            const index = cachePagamentosAtuais.findIndex(p => p.id == idPagamento);
            if (index !== -1) {
                cachePagamentosAtuais[index] = pagamentoSalvo;
            }
            alert(`Pagamento ID ${pagamentoSalvo.id} atualizado!`);

        } else {
            // 1. Salva na API
            console.log(`Criando pagamento para execução ID: ${execucaoIdSelecionada}`);
            pagamentoSalvo = await api.createPagamento(execucaoIdSelecionada, dadosPagamento);
            if (pagamentoSalvo && pagamentoSalvo.error) throw new Error(pagamentoSalvo.error);
            if (!pagamentoSalvo) throw new Error("API não retornou o novo pagamento.");

            // 2. OTIMIZAÇÃO: Adiciona ao cache local
            cachePagamentosAtuais.push(pagamentoSalvo);
            alert(`Pagamento criado com ID: ${pagamentoSalvo.id}`);
        }

        // --- OTIMIZAÇÃO: Redesenha tudo a partir do cache (INSTANTÂNEO) ---
        
        // 3. Pega os dados da execução que já estão no <select>
        const selectElement = document.getElementById('pagamentos-select-execucao');
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const execucao = JSON.parse(selectedOption.dataset.execucao);
        const nomeProdutor = selectedOption.dataset.produtorNome;
        const nomeServico = selectedOption.dataset.servicoNome;

        // 4. Redesenha o sumário (Total Pago, Saldo) e a lista USANDO O CACHE MODIFICADO
        ui.exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, cachePagamentosAtuais);
        ui.desenharListaPagamentos(cachePagamentosAtuais, handleEditPagamento, handleDeletePagamento);

        ui.limparFormularioPagamento();
        // --- FIM DA OTIMIZAÇÃO ---

    } catch (error) {
        console.error("Erro ao salvar pagamento:", error);
        alert(`Falha ao salvar pagamento: ${error.message}`);
        
        // PLANO B: Se a otimização falhar, força o recarregamento
        await refreshPagamentosVisiveis();
    }
}
function handleClearPagamento() {
    ui.limparFormularioPagamento();
}
function handleEditPagamento(pagamento) {
    console.log("Editando pagamento:", pagamento);
    ui.preencherFormularioPagamento(pagamento);
}
// CÓDIGO NOVO (Otimizado)
async function handleDeletePagamento(id) {
    if (confirm(`Tem certeza que deseja excluir o pagamento ID ${id}?`)) {
        try {
            console.log(`Excluindo pagamento ID: ${id}`);
            const resultado = await api.deletePagamento(id);
            if (resultado && resultado.error) throw new Error(resultado.error);
            alert(`Pagamento ID ${id} excluído com sucesso.`);

            // --- OTIMIZAÇÃO: Atualiza o cache local ---
            
            // 1. Remove o item do cache
            cachePagamentosAtuais = cachePagamentosAtuais.filter(p => p.id != id);

            // 2. Pega os dados da execução que já estão no <select>
            const selectElement = document.getElementById('pagamentos-select-execucao');
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            const execucao = JSON.parse(selectedOption.dataset.execucao);
            const nomeProdutor = selectedOption.dataset.produtorNome;
            const nomeServico = selectedOption.dataset.servicoNome;

            // 3. Redesenha o sumário (Total Pago) e a lista USANDO O CACHE MODIFICADO
            ui.exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, cachePagamentosAtuais);
            ui.desenharListaPagamentos(cachePagamentosAtuais, handleEditPagamento, handleDeletePagamento);
            // --- FIM DA OTIMIZAÇÃO ---

            ui.limparFormularioPagamento();

        } catch (error) {
            console.error(`Erro ao excluir pagamento ${id}:`, error);
            alert(`Falha ao excluir pagamento: ${error.message}`);
            // PLANO B: Se a otimização falhar, força o recarregamento
            await refreshPagamentosVisiveis();
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
// 6.5. HANDLERS DE PAGINAÇÃO (NOVOS)
// ======================================================
async function handleProdutorPaginaProxima() {
    if (produtoresPaginaAtual < produtoresTotalPaginas) {
        await carregarProdutores(produtoresPaginaAtual + 1);
    }
}

async function handleProdutorPaginaAnterior() {
    if (produtoresPaginaAtual > 1) {
        await carregarProdutores(produtoresPaginaAtual - 1);
    }
}

async function handleServicoPaginaProxima() {
    if (servicosPaginaAtual < servicosTotalPaginas) {
        await carregarServicos(servicosPaginaAtual + 1);
    }
}

async function handleServicoPaginaAnterior() {
    if (servicosPaginaAtual > 1) {
        await carregarServicos(servicosPaginaAtual - 1);
    }
}

async function handleHistoricoPaginaProxima() {
    if (historicoPaginaAtual < historicoTotalPaginas) {
        await carregarExecucoes(historicoPaginaAtual + 1);
    }
}

async function handleHistoricoPaginaAnterior() {
    if (historicoPaginaAtual > 1) {
        await carregarExecucoes(historicoPaginaAtual - 1);
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
    // --- Handlers de Ação de Produtores Adicionados ---
    onEditProdutor: handleEditProdutor,
    onDeleteProdutor: handleDeleteProdutor,
    onProdutorPaginaAnterior: handleProdutorPaginaAnterior,
    onProdutorPaginaProxima: handleProdutorPaginaProxima,
    // ----------------------------------------------------
    onSaveServico: handleSaveServico,
    onClearServico: handleClearServico,
    // --- Handlers de Ação de Serviços Adicionados ---
    onEditServico: handleEditServico,
    onDeleteServico: handleDeleteServico,
    onServicoPaginaAnterior: handleServicoPaginaAnterior,
    onServicoPaginaProxima: handleServicoPaginaProxima,
    // ------------------------------------------------
    onSaveExecucao: handleSaveExecucao,
    onClearAgendamento: handleClearAgendamento,
    // --- Handlers de Ação de Histórico Adicionados ---
    onEditExecucao: handleEditExecucao,
    onDeleteExecucao: handleDeleteExecucao,
    onHistoricoPaginaAnterior: handleHistoricoPaginaAnterior,
    onHistoricoPaginaProxima: handleHistoricoPaginaProxima,
    // ---------------------------------------------------
    onExecucaoSelecionada: handleExecucaoSelecionada,
    onSavePagamento: handleSavePagamento,
    onClearPagamento: handleClearPagamento,
    onCancelEditPagamento: handleCancelEditPagamento,
    onEditPagamento: handleEditPagamento,
    onDeletePagamento: handleDeletePagamento,
    onRelatorioProdutorSelecionado: handleRelatorioProdutorSelecionado
});