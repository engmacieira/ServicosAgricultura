// renderer.js (Nosso Módulo "Controlador" Principal)

// Importamos TODAS as funções da nossa "View" (ui.js)
import * as ui from './ui.js';

// Pegamos a "api" segura que o preload.js expôs
const api = window.api;

// Variáveis de estado/cache
let agendamentoDropdownsCarregados = false;
let historicoCarregadoPrimeiraVez = false;
let pagamentosDropdownCarregado = false; // <-- Variável para pagamentos
let cacheProdutores = []; // <-- Cache para evitar buscar nomes repetidamente
let cacheServicos = []; // <-- Cache para evitar buscar nomes repetidamente
let cacheExecucoes = []; // <-- Cache para evitar buscar execuções repetidamente

// ======================================================
// 1. HANDLERS DE LÓGICA - PRODUTORES
// ======================================================

/**
 * Busca os produtores na API e manda a UI desenhá-los.
 */
async function carregarProdutores() {
    try {
        cacheProdutores = await api.getProdutores(); // Atualiza cache
        // Passamos os "callbacks" (o que fazer ao clicar)
        ui.desenharListaProdutores(cacheProdutores, handleEditProdutor, handleDeleteProdutor);
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
// 2. HANDLERS DE LÓGICA - SERVIÇOS
// ======================================================

/**
 * Busca os serviços na API e manda a UI desenhá-los.
 */
async function carregarServicos() {
     try {
        cacheServicos = await api.getServicos(); // Atualiza cache
        ui.desenharListaServicos(cacheServicos, handleEditServico, handleDeleteServico);
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
// 3. HANDLERS DE LÓGICA - AGENDAMENTO
// ======================================================

/**
 * Carrega os dados necessários (produtores e serviços)
 * para preencher os dropdowns do formulário de agendamento.
 */
async function carregarDadosAgendamento() {
    if (agendamentoDropdownsCarregados) return;
    console.log("Carregando dados para dropdowns de agendamento...");
    try {
        // Usa o cache se já tivermos os dados
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

/**
 * Lógica de Salvar Agendamento (Execução) - Lida com Create e Update.
 */
async function handleSaveExecucao(event) {
    event.preventDefault();

    // Pega o ID do campo escondido e os dados do formulário
    const id = ui.getIdAgendamento(); // <-- Pega o ID para saber se é update
    const dadosExecucao = ui.coletarDadosAgendamento();

    if (!dadosExecucao) return;

    try {
        let resultado;
        if (id) {
            // --- LÓGICA DE ATUALIZAR (UPDATE) ---
            console.log(`Atualizando execução ID: ${id}`);
            resultado = await api.updateExecucao(id, dadosExecucao);
            if (resultado && resultado.error) throw new Error(resultado.error);
            if (!resultado) throw new Error("API não retornou a execução atualizada.");
            alert(`Agendamento ID ${resultado.id} atualizado com sucesso!`);

        } else {
            // --- LÓGICA DE CRIAR (CREATE) ---
            console.log("Criando nova execução...");
            resultado = await api.createExecucao(dadosExecucao);
            if (resultado && resultado.error) throw new Error(resultado.error);
            if (!resultado) throw new Error("API não retornou a nova execução.");
            alert(`Agendamento criado com sucesso! ID: ${resultado.id}`);
        }

        ui.limparFormularioAgendamento();
        // Força o recarregamento do histórico e do dropdown de pagamentos se já tiverem sido vistos
        historicoCarregadoPrimeiraVez = false; // Força recarga do histórico na próxima vez
        pagamentosDropdownCarregado = false; // Força recarga do dropdown de pagamentos

    } catch (error) {
        console.error("Erro ao salvar agendamento:", error);
        alert(`Falha ao salvar agendamento: ${error.message}`);
    }
}

/** Lógica de "Limpar" o formulário de Agendamento. */
function handleClearAgendamento() {
    ui.limparFormularioAgendamento();
}


// ======================================================
// 4. HANDLERS DE LÓGICA - HISTÓRICO
// ======================================================

/**
 * Busca o histórico de execuções na API e manda a UI desenhá-lo.
 */
async function carregarExecucoes() {
    console.log("Carregando histórico de execuções...");
    try {
        // Usa cache se já tivermos
        if (cacheProdutores.length === 0) cacheProdutores = await api.getProdutores();
        if (cacheServicos.length === 0) cacheServicos = await api.getServicos();
        cacheExecucoes = await api.getExecucoes(); // Atualiza cache de execuções

        const produtoresMap = cacheProdutores.reduce((map, prod) => { map[prod.id] = prod.nome; return map; }, {});
        const servicosMap = cacheServicos.reduce((map, serv) => { map[serv.id] = serv.nome; return map; }, {});

        // PASSA OS NOVOS HANDLERS COMO CALLBACKS
        ui.desenharListaExecucoes(cacheExecucoes, produtoresMap, servicosMap, handleEditExecucao, handleDeleteExecucao);

        historicoCarregadoPrimeiraVez = true;
        console.log("Histórico carregado.");

    } catch (error) {
         console.error("Erro ao carregar histórico de execuções:", error);
         alert("Falha grave ao buscar histórico.");
         ui.desenharListaExecucoes([]); // Limpa a lista em caso de erro
    }
}

/**
 * Lógica de "Editar" uma Execução (chamado pela UI).
 * Preenche o formulário de Agendamento e muda para a aba correspondente.
 */
function handleEditExecucao(execucao) {
    console.log("Editando execução:", execucao);
    // 1. Garante que os dropdowns da aba agendamento estão carregados ANTES de preencher
    carregarDadosAgendamento().then(() => {
        // 2. Manda a UI preencher o formulário de Agendamento
        ui.preencherFormularioAgendamento(execucao);

        // 3. Muda para a aba de Agendamento
        const agendamentoTabButton = document.querySelector('button[data-tab="painel-agendamento"]');
        if (agendamentoTabButton) {
            agendamentoTabButton.click(); // Isso vai disparar o handleTabChange
        } else {
            console.error("Não foi possível encontrar o botão da aba de agendamento.");
        }
    }).catch(error => {
        console.error("Erro ao preparar edição de execução:", error);
        alert("Erro ao carregar dados para edição.");
    });
}

/**
 * Lógica de "Excluir" uma Execução (chamado pela UI).
 */
async function handleDeleteExecucao(id) {
    if (confirm(`Tem certeza que deseja excluir o agendamento ID ${id}? (Pagamentos associados também serão excluídos!)`)) {
        try {
            console.log(`Excluindo execução ID: ${id}`);
            const resultado = await api.deleteExecucao(id);

            if (resultado && resultado.error) throw new Error(resultado.error);
            // A API de delete pode não retornar mensagem se usar 204 No Content, ajustamos a checagem
            // if (!resultado || !resultado.mensagem) throw new Error("API não confirmou a exclusão.");

            alert(`Agendamento ID ${id} excluído com sucesso.`);
            pagamentosDropdownCarregado = false; // Força recarga do dropdown de pagamentos
            await carregarExecucoes(); // Recarrega a lista do histórico

        } catch (error) {
            console.error(`Erro ao excluir execução ${id}:`, error);
            alert(`Falha ao excluir agendamento: ${error.message}`);
        }
    }
}


// ======================================================
// 5. HANDLERS DE LÓGICA - PAGAMENTOS
// ======================================================

/**
 * Carrega os dados necessários para a aba de Pagamentos (lista de execuções).
 */
async function carregarDadosPagamentos() {
    if (pagamentosDropdownCarregado) return;
    console.log("Carregando dados para dropdown de pagamentos...");
    try {
        // Reutiliza caches se disponíveis
        if (cacheProdutores.length === 0) cacheProdutores = await api.getProdutores();
        if (cacheServicos.length === 0) cacheServicos = await api.getServicos();
        // Sempre busca execuções recentes ao entrar na aba de pagamentos
        cacheExecucoes = await api.getExecucoes();

        const produtoresMap = cacheProdutores.reduce((map, prod) => { map[prod.id] = prod.nome; return map; }, {});
        const servicosMap = cacheServicos.reduce((map, serv) => { map[serv.id] = serv.nome; return map; }, {});

        ui.popularDropdownExecucoesPagamentos(cacheExecucoes, produtoresMap, servicosMap);
        pagamentosDropdownCarregado = true;
        console.log("Dropdown de pagamentos populado.");

    } catch (error) {
        console.error("Erro ao carregar dados para pagamentos:", error);
        alert("Falha ao carregar dados para pagamentos.");
        ui.popularDropdownExecucoesPagamentos([]); // Limpa dropdown em caso de erro
    }
}

/**
 * Chamado quando o usuário seleciona uma Execução no dropdown da aba Pagamentos.
 * Busca os pagamentos daquela execução e atualiza a UI.
 */
async function handleExecucaoSelecionada(event) {
    const selectElement = event.target;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const execucaoId = selectedOption.value;

    if (!execucaoId) {
        ui.exibirDetalhesExecucaoPagamentos(null, null, null, []); // Esconde detalhes
        ui.desenharListaPagamentos([], handleEditPagamento, handleDeletePagamento); // Limpa lista
        return;
    }

    try {
        console.log(`Buscando pagamentos para execução ID: ${execucaoId}`);
        // Pega os dados da execução guardados no dataset da option
        const execucao = JSON.parse(selectedOption.dataset.execucao);
        const nomeProdutor = selectedOption.dataset.produtorNome;
        const nomeServico = selectedOption.dataset.servicoNome;

        // Busca os pagamentos específicos desta execução
        const pagamentos = await api.getPagamentosPorExecucao(execucaoId);

        // Manda a UI exibir os detalhes e a lista de pagamentos
        ui.exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, pagamentos);
        ui.desenharListaPagamentos(pagamentos, handleEditPagamento, handleDeletePagamento);
        ui.limparFormularioPagamento(); // Garante que o form de add está limpo

    } catch (error) {
        console.error(`Erro ao buscar pagamentos para execução ${execucaoId}:`, error);
        alert("Falha ao buscar pagamentos para a execução selecionada.");
        ui.exibirDetalhesExecucaoPagamentos(null, null, null, []);
        ui.desenharListaPagamentos([], handleEditPagamento, handleDeletePagamento);
    }
}

/**
 * Lógica para Salvar (Criar ou Atualizar) um Pagamento.
 */
async function handleSavePagamento(event) {
    event.preventDefault();
    const idPagamento = ui.getIdPagamento();
    const dadosPagamento = ui.coletarDadosPagamento();

    if (!dadosPagamento) return;

    // Precisamos do ID da execução ATUALMENTE selecionada no dropdown
    const execucaoIdSelecionada = document.getElementById('pagamentos-select-execucao').value;
     if (!execucaoIdSelecionada) {
         alert("Erro interno: Nenhuma execução selecionada para associar o pagamento.");
         return;
     }

    try {
        let resultado;
        if (idPagamento) {
            // --- ATUALIZAR PAGAMENTO ---
            console.log(`Atualizando pagamento ID: ${idPagamento}`);
            // Passamos o ID do pagamento e os dados (que incluem o execucao_id)
            resultado = await api.updatePagamento(idPagamento, dadosPagamento);
             if (resultado && resultado.error) throw new Error(resultado.error);
            if (!resultado) throw new Error("API não retornou o pagamento atualizado.");
            alert(`Pagamento ID ${resultado.id} atualizado!`);
        } else {
             // --- CRIAR PAGAMENTO ---
             console.log(`Criando pagamento para execução ID: ${execucaoIdSelecionada}`);
             // Passamos o ID da execução (da URL aninhada) e os dados do pagamento
             resultado = await api.createPagamento(execucaoIdSelecionada, dadosPagamento);
             if (resultado && resultado.error) throw new Error(resultado.error);
             if (!resultado) throw new Error("API não retornou o novo pagamento.");
             alert(`Pagamento criado com ID: ${resultado.id}`);
        }

        // Recarrega os detalhes e a lista da execução selecionada
        await refreshPagamentosVisiveis();
        ui.limparFormularioPagamento();

    } catch (error) {
        console.error("Erro ao salvar pagamento:", error);
        alert(`Falha ao salvar pagamento: ${error.message}`);
    }
}

/** Lógica para Limpar o formulário de Pagamento. */
function handleClearPagamento() {
    ui.limparFormularioPagamento();
}

/** Lógica para Editar um Pagamento (chamado pela UI). */
function handleEditPagamento(pagamento) {
    console.log("Editando pagamento:", pagamento);
    ui.preencherFormularioPagamento(pagamento);
}

/** Lógica para Excluir um Pagamento (chamado pela UI). */
async function handleDeletePagamento(id) {
     if (confirm(`Tem certeza que deseja excluir o pagamento ID ${id}?`)) {
        try {
            console.log(`Excluindo pagamento ID: ${id}`);
            const resultado = await api.deletePagamento(id);
            if (resultado && resultado.error) throw new Error(resultado.error);
            // API pode retornar 200 com mensagem ou 204 sem nada
            // if (!resultado || !resultado.mensagem) throw new Error("API não confirmou a exclusão.");

            alert(`Pagamento ID ${id} excluído com sucesso.`);
            // Recarrega os detalhes e a lista da execução selecionada
             await refreshPagamentosVisiveis();
             ui.limparFormularioPagamento(); // Limpa caso estivesse em edição

        } catch (error) {
            console.error(`Erro ao excluir pagamento ${id}:`, error);
            alert(`Falha ao excluir pagamento: ${error.message}`);
        }
    }
}

/** Lógica para Cancelar a Edição de um Pagamento. */
function handleCancelEditPagamento() {
    ui.limparFormularioPagamento(); // Limpa o formulário e esconde o botão Cancelar
}

/** Função auxiliar para recarregar a seção de detalhes e lista de pagamentos */
async function refreshPagamentosVisiveis() {
    const selectElement = document.getElementById('pagamentos-select-execucao');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const execucaoId = selectedOption.value;

     if (!execucaoId) return; // Não faz nada se nenhuma execução estiver selecionada

     // Re-executa a lógica de buscar e exibir
     try {
        const execucao = JSON.parse(selectedOption.dataset.execucao);
        const nomeProdutor = selectedOption.dataset.produtorNome;
        const nomeServico = selectedOption.dataset.servicoNome;
        const pagamentos = await api.getPagamentosPorExecucao(execucaoId);
        ui.exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, pagamentos);
        ui.desenharListaPagamentos(pagamentos, handleEditPagamento, handleDeletePagamento);
     } catch(error) {
         console.error("Erro ao refrescar pagamentos:", error);
         // Poderia mostrar um erro mais específico
     }
}


// ======================================================
// 6. INICIALIZAÇÃO DO APP e GESTÃO DE ABAS (ATUALIZADO)
// ======================================================

/**
 * Função principal que inicializa a aplicação, configura
 * os ouvintes de eventos e carrega os dados iniciais.
 */
function inicializar() {
    // 1. Liga a lógica das Abas
    // (Conforme fornecido por você)
    ui.inicializarAbas(handleTabChange);

    // 2. Carrega dados iniciais
    // Tenta carregar os projetos ou dados da última sessão
    carregarDadosIniciais();

    // 3. Configura Ouvintes de Eventos Globais
    // (Ex: botões da barra de ferramentas, menus, etc.)
    configurarOuvintesGlobais();

    // 4. Configura Comunicação com o Processo Principal (Main)
    // Exemplo: se estiver usando Electron ou similar
    // if (window.api) {
    //     window.api.on('mensagem-do-main', (dados) => {
    //         console.log('Recebido do main:', dados);
    //         // Atualizar a UI com base nos dados recebidos
    //     });
    // }

    // 5. Define o estado inicial da UI
    // Garante que a aba correta (ex: 'home') esteja visível
    ui.definirEstadoInicial('home'); // 'home' ou a aba padrão

    console.log("Aplicação inicializada.");
}

/**
 * Função chamada quando uma aba é clicada.
 * Lida com a mudança de visualização do conteúdo.
 * @param {string} abaId - O ID da aba que foi selecionada (ex: 'home', 'projetos', 'configuracoes').
 */
function handleTabChange(abaId) {
    console.log(`Trocando para a aba: ${abaId}`);
    
    // 1. Esconde todos os painéis de conteúdo
    ui.ocultarPaineisDeConteudo();

    // 2. Mostra o painel de conteúdo da aba selecionada
    const painelAtivo = document.getElementById(`conteudo-${abaId}`);
    if (painelAtivo) {
        painelAtivo.classList.add('ativo');
        
        // 3. (Opcional) Carregar dados específicos da aba se necessário
        // (Ex: se a aba 'projetos' for clicada, carregar a lista de projetos)
        // switch (abaId) {
        //     case 'projetos':
        //         carregarListaDeProjetos();
        //         break;
        //     case 'configuracoes':
        //         carregarConfiguracoesAtuais();
        //         break;
        //     // ... outros casos
        // }
    } else {
        console.warn(`Painel de conteúdo para a aba ${abaId} não foi encontrado.`);
    }
}

/**
 * Carrega os dados iniciais necessários para a aplicação (ex: lista de projetos,
 * configurações do usuário).
 */
async function carregarDadosIniciais() {
    ui.mostrarLoading('Carregando dados...');
    try {
        // Exemplo: buscando dados do main process ou de uma API/localStorage
        // const projetos = await api.getProjetos(); 
        // ui.popularListaProjetos(projetos);
        
        console.log("Carregando dados iniciais (simulação)...");
        // Simulação de tempo de carregamento
        setTimeout(() => {
            ui.esconderLoading();
            console.log("Dados carregados.");
        }, 750);

    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        ui.mostrarErro('Não foi possível carregar seus dados.');
    }
}

/**
 * Configura os ouvintes de eventos para elementos globais da UI
 * (ex: botões de salvar, novo projeto, exportar, etc. que
 * não pertencem a uma aba específica).
 */
function configurarOuvintesGlobais() {
    const btnNovo = document.getElementById('btn-novo-global');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            // Lógica para criar novo item
            console.log('Botão Novo (Global) clicado.');
            // Ex: ui.abrirModalNovoProjeto();
        });
    }

    const btnSalvar = document.getElementById('btn-salvar-global');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => {
            // Lógica para salvar dados
            console.log('Botão Salvar (Global) clicado.');
            // Ex: salvarTodosOsDados();
        });
    }
    
    // ... outros ouvintes globais (ex: menu, shortcuts)
}


// ======================================================
// X. EXECUÇÃO INICIAL
// ======================================================

// Garante que o DOM (Document Object Model) esteja completamente
// carregado antes de tentar manipular os elementos da UI.
document.addEventListener('DOMContentLoaded', inicializar);