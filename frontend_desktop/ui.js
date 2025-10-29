// ui.js (Nosso Módulo de "View" refatorado)

// Nossas variáveis de elementos agora são 'let'
// Elas serão preenchidas pela função interna _inicializarDOM()

// --- Elementos das Abas ---
let tabButtons;
let tabPanes;
// --- Elementos do Painel Produtores ---
let produtorForm;
let produtorIdInput;
let produtorNomeInput;
let produtorCpfInput;
let produtorRegiaoInput;
let produtorReferenciaInput;
let produtorTelefoneInput;
let listaProdutores;
let produtorBtnLimpar; 
// --- Elementos do Painel Serviços ---
let servicoForm;
let servicoIdInput;
let servicoNomeInput;
let servicoValorInput;
let listaServicos;
let servicoBtnLimpar; 
// --- Elementos do Painel Agendamento ---
let agendamentoForm;
let agendamentoIdInput;
let agendamentoProdutorSelect;
let agendamentoServicoSelect;
let agendamentoDataInput;
let agendamentoHorasInput;
let agendamentoValorInput;
let agendamentoBtnLimpar; 
// --- Elementos do Painel Histórico ---
let listaHistorico;
// --- Elementos do Painel Pagamentos ---
let pagamentosSelectExecucao;
let pagamentosDetalhesDiv;
let detalheProdutorNomeSpan;
let detalheServicoNomeSpan;
let detalheDataSpan;
let detalheValorTotalSpan;
let detalheTotalPagoSpan;
let detalheSaldoDevedorSpan;
let listaPagamentosUl;
let pagamentoForm;
let pagamentoFormPlaceholder;
let pagamentoIdInput;
let pagamentoExecucaoIdInput;
let pagamentoValorInput;
let pagamentoDataInput;
let pagamentoBtnCancelar;
let pagamentoBtnLimpar; 
// --- Elementos do Painel Relatórios ---
let relatorioSelectProdutor;
let listaRelatorioDividas;


// ======================================================
// 0. FUNÇÕES DE INICIALIZAÇÃO DA UI (Refatoradas)
// ======================================================

/**
 * Esta função agora é INTERNA (_).
 * Ela preenche todas as nossas variáveis de elementos.
 */
function _inicializarDOM() {
    // --- Abas ---
    tabButtons = document.querySelectorAll('.tab-button');
    tabPanes = document.querySelectorAll('.tab-pane');
    // --- Produtores ---
    produtorForm = document.getElementById('produtor-form');
    produtorIdInput = document.getElementById('produtor-id');
    produtorNomeInput = document.getElementById('produtor-nome');
    produtorCpfInput = document.getElementById('produtor-cpf');
    produtorRegiaoInput = document.getElementById('produtor-regiao');
    produtorReferenciaInput = document.getElementById('produtor-referencia');
    produtorTelefoneInput = document.getElementById('produtor-telefone');
    listaProdutores = document.getElementById('lista-produtores');
    produtorBtnLimpar = document.getElementById('produtor-btn-limpar');
    // --- Serviços ---
    servicoForm = document.getElementById('servico-form');
    servicoIdInput = document.getElementById('servico-id');
    servicoNomeInput = document.getElementById('servico-nome');
    servicoValorInput = document.getElementById('servico-valor');
    listaServicos = document.getElementById('lista-servicos');
    servicoBtnLimpar = document.getElementById('servico-btn-limpar');
    // --- Agendamento ---
    agendamentoForm = document.getElementById('agendamento-form');
    agendamentoIdInput = document.getElementById('agendamento-id')
    agendamentoProdutorSelect = document.getElementById('agendamento-produtor');
    agendamentoServicoSelect = document.getElementById('agendamento-servico');
    agendamentoDataInput = document.getElementById('agendamento-data');
    agendamentoHorasInput = document.getElementById('agendamento-horas');
    agendamentoValorInput = document.getElementById('agendamento-valor');
    agendamentoBtnLimpar = document.getElementById('agendamento-btn-limpar');
    // --- Histórico ---
    listaHistorico = document.getElementById('lista-historico');
    // --- Pagamentos ---
    pagamentosSelectExecucao = document.getElementById('pagamentos-select-execucao');
    pagamentosDetalhesDiv = document.getElementById('pagamentos-detalhes-execucao');
    detalheProdutorNomeSpan = document.getElementById('detalhe-produtor-nome');
    detalheServicoNomeSpan = document.getElementById('detalhe-servico-nome');
    detalheDataSpan = document.getElementById('detalhe-data');
    detalheValorTotalSpan = document.getElementById('detalhe-valor-total');
    detalheTotalPagoSpan = document.getElementById('detalhe-total-pago');
    detalheSaldoDevedorSpan = document.getElementById('detalhe-saldo-devedor');
    listaPagamentosUl = document.getElementById('lista-pagamentos');
    pagamentoForm = document.getElementById('pagamento-form');
    pagamentoFormPlaceholder = document.getElementById('pagamento-form-placeholder');
    pagamentoIdInput = document.getElementById('pagamento-id');
    pagamentoExecucaoIdInput = document.getElementById('pagamento-execucao-id');
    pagamentoValorInput = document.getElementById('pagamento-valor');
    pagamentoDataInput = document.getElementById('pagamento-data');
    pagamentoBtnCancelar = document.getElementById('pagamento-btn-cancelar');
    pagamentoBtnLimpar = document.getElementById('pagamento-btn-limpar');
    // --- Relatórios ---
    relatorioSelectProdutor = document.getElementById('relatorio-select-produtor');
    listaRelatorioDividas = document.getElementById('lista-relatorio-dividas');
    
    console.log("UI: Elementos DOM 'cacheados'.");
}

/**
 * Esta é a nova função principal de "ligação".
 * O renderer.js vai chamar esta função e passar os handlers (funções de callback).
 * @param {object} handlers - Um objeto contendo as funções do controlador.
 */
function vincularEventos(handlers) {
    // --- Abas ---
    inicializarAbas(handlers.onTabChange);

    // --- Painel Produtores ---
    produtorForm.addEventListener('submit', handlers.onSaveProdutor);
    produtorBtnLimpar.addEventListener('click', handlers.onClearProdutor);

    // --- Painel Serviços ---
    servicoForm.addEventListener('submit', handlers.onSaveServico);
    servicoBtnLimpar.addEventListener('click', handlers.onClearServico);

    // --- Painel Agendamento ---
    agendamentoForm.addEventListener('submit', handlers.onSaveExecucao);
    agendamentoBtnLimpar.addEventListener('click', handlers.onClearAgendamento);
    
    // --- Painel Pagamentos ---
    pagamentosSelectExecucao.addEventListener('change', handlers.onExecucaoSelecionada);
    pagamentoForm.addEventListener('submit', handlers.onSavePagamento);
    pagamentoBtnLimpar.addEventListener('click', handlers.onClearPagamento);
    pagamentoBtnCancelar.addEventListener('click', handlers.onCancelEditPagamento);

    // --- Painel Relatórios ---
    relatorioSelectProdutor.addEventListener('change', handlers.onRelatorioProdutorSelecionado);

    console.log("UI: Listeners de eventos inicializados.");
}

/**
 * Mark Construtor: CORREÇÃO FINAL
 * Esta é a primeira função que o renderer.js deve chamar.
 * Removemos o 'DOMContentLoaded' wrapper.
 * @param {object} handlers - O mesmo objeto de handlers.
 */
export function inicializarApp(handlers) {
    // O DOM JÁ ESTÁ CARREGADO (pois o script é type="module")
    
    console.log("UI: Inicializando App...");
    // 1. Pega os elementos
    _inicializarDOM();
    // 2. Vincula os botões
    vincularEventos(handlers);
    // 3. Dispara o carregamento da primeira aba
    handlers.onTabChange('painel-produtores');
}


// ======================================================
// 1. LÓGICA DE GERENCIAMENTO DAS ABAS
// ======================================================
export function trocarAba(buttonElement) {
    const targetPaneId = buttonElement.dataset.tab;
    tabButtons.forEach(btn => btn.classList.toggle('active', btn === buttonElement));
    tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === targetPaneId));
    return targetPaneId;
}

function inicializarAbas(onTabChangeCallback) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPaneId = trocarAba(button); 
            if (onTabChangeCallback) onTabChangeCallback(targetPaneId);
        });
    });
}

// ======================================================
// 2. FUNÇÕES DE UI - PRODUTORES
// ======================================================
export function desenharListaProdutores(produtores, onEditClick, onDeleteClick) {
    listaProdutores.innerHTML = '';
    if (!produtores || produtores.length === 0) { listaProdutores.innerHTML = '<li>Nenhum produtor cadastrado.</li>'; return; }
    produtores.forEach(produtor => { 
        const item = document.createElement('li');
        item.textContent = `[${produtor.id}] ${produtor.nome} (Região: ${produtor.regiao || 'N/A'})`;
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar'; btnEditar.style.marginLeft = '10px';
        btnEditar.onclick = () => onEditClick(produtor);
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir'; btnExcluir.style.marginLeft = '5px';
        btnExcluir.onclick = () => onDeleteClick(produtor.id);
        item.appendChild(btnEditar); item.appendChild(btnExcluir);
        listaProdutores.appendChild(item);
    });
}
export function limparFormularioProdutor() { 
    produtorIdInput.value = ''; produtorNomeInput.value = ''; produtorCpfInput.value = '';
    produtorRegiaoInput.value = ''; produtorReferenciaInput.value = ''; produtorTelefoneInput.value = '';
    produtorNomeInput.focus();
}
export function preencherFormularioProdutor(produtor) { 
    produtorIdInput.value = produtor.id; produtorNomeInput.value = produtor.nome;
    produtorCpfInput.value = produtor.cpf; produtorRegiaoInput.value = produtor.regiao;
    produtorReferenciaInput.value = produtor.referencia; produtorTelefoneInput.value = produtor.telefone;
    produtorNomeInput.focus();
}
export function coletarDadosProdutor() { 
    return {
        nome: produtorNomeInput.value, cpf: produtorCpfInput.value || null,
        regiao: produtorRegiaoInput.value || null, referencia: produtorReferenciaInput.value || null,
        telefone: produtorTelefoneInput.value || null
    };
}
export function getIdProdutor() { 
    return produtorIdInput.value || null;
}

// ======================================================
// 3. FUNÇÕES DE UI - SERVIÇOS
// ======================================================
export function desenharListaServicos(servicos, onEditClick, onDeleteClick) {
    listaServicos.innerHTML = '';
    if (!servicos || servicos.length === 0) { listaServicos.innerHTML = '<li>Nenhum serviço cadastrado.</li>'; return; }
    servicos.forEach(servico => { 
        const item = document.createElement('li');
        item.textContent = `[${servico.id}] ${servico.nome} (R$ ${servico.valor_unitario.toFixed(2)})`;
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar'; btnEditar.style.marginLeft = '10px';
        btnEditar.onclick = () => onEditClick(servico);
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir'; btnExcluir.style.marginLeft = '5px';
        btnExcluir.onclick = () => onDeleteClick(servico.id);
        item.appendChild(btnEditar); item.appendChild(btnExcluir);
        listaServicos.appendChild(item);
    });
}
export function limparFormularioServico() { 
    servicoIdInput.value = ''; servicoNomeInput.value = ''; servicoValorInput.value = '';
    servicoNomeInput.focus();
}
export function preencherFormularioServico(servico) { 
    servicoIdInput.value = servico.id; servicoNomeInput.value = servico.nome;
    servicoValorInput.value = servico.valor_unitario;
    servicoNomeInput.focus();
}
export function coletarDadosServico() { 
    return {
        nome: servicoNomeInput.value,
        valor_unitario: parseFloat(servicoValorInput.value) || 0.0
    };
}
export function getIdServico() { 
    return servicoIdInput.value || null;
}

// ======================================================
// 4. FUNÇÕES DE UI - AGENDAMENTO
// ======================================================
export function popularDropdownProdutores(produtores) {
    agendamentoProdutorSelect.innerHTML = '<option value="">Selecione um Produtor...</option>';
    if (produtores && produtores.length > 0) {
        produtores.forEach(produtor => {
            const option = document.createElement('option');
            option.value = produtor.id;
            option.textContent = produtor.nome;
            agendamentoProdutorSelect.appendChild(option);
        });
    } else {
         agendamentoProdutorSelect.innerHTML = '<option value="">Nenhum produtor cadastrado</option>';
    }
}
export function popularDropdownServicos(servicos) {
    agendamentoServicoSelect.innerHTML = '<option value="">Selecione um Serviço...</option>';
    if (servicos && servicos.length > 0) {
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = `${servico.nome} (R$ ${servico.valor_unitario.toFixed(2)})`;
            agendamentoServicoSelect.appendChild(option);
        });
    } else {
        agendamentoServicoSelect.innerHTML = '<option value="">Nenhum serviço cadastrado</option>';
    }
}
export function limparFormularioAgendamento() {
    agendamentoIdInput.value = '';
    agendamentoProdutorSelect.value = '';
    agendamentoServicoSelect.value = '';
    agendamentoDataInput.value = '';
    agendamentoHorasInput.value = '0.0';
    agendamentoValorInput.value = '0.00';
    agendamentoProdutorSelect.focus();
}
export function preencherFormularioAgendamento(execucao) {
    agendamentoIdInput.value = execucao.id;
    agendamentoProdutorSelect.value = execucao.produtor_id;
    agendamentoServicoSelect.value = execucao.servico_id;
    agendamentoDataInput.value = execucao.data_execucao;
    agendamentoHorasInput.value = execucao.horas_prestadas;
    agendamentoValorInput.value = execucao.valor_total;
    agendamentoProdutorSelect.focus();
}
export function getIdAgendamento() {
    return agendamentoIdInput.value || null;
}
export function coletarDadosAgendamento() {
    const produtorId = parseInt(agendamentoProdutorSelect.value, 10);
    const servicoId = parseInt(agendamentoServicoSelect.value, 10);
    const dataExecucao = agendamentoDataInput.value;
    const horasPrestadas = parseFloat(agendamentoHorasInput.value) || 0.0;
    const valorTotal = parseFloat(agendamentoValorInput.value) || 0.00;

    if (isNaN(produtorId) || isNaN(servicoId) || !dataExecucao) {
        alert("Por favor, selecione Produtor, Serviço e Data.");
        return null;
    }

    return {
        produtor_id: produtorId,
        servico_id: servicoId,
        data_execucao: dataExecucao,
        horas_prestadas: horasPrestadas,
        valor_total: valorTotal
    };
}

// ======================================================
// 5. FUNÇÕES DE UI - HISTÓRICO
// ======================================================
export function desenharListaExecucoes(execucoes, produtoresMap = {}, servicosMap = {}, onEditClick, onDeleteClick) {
    listaHistorico.innerHTML = ''; 

    if (!execucoes || execucoes.length === 0) {
        listaHistorico.innerHTML = '<li>Nenhum agendamento encontrado.</li>';
        return;
    }
    
    execucoes.sort((a, b) => new Date(b.data_execucao) - new Date(a.data_execucao));

    execucoes.forEach(exec => {
        const item = document.createElement('li');
        const nomeProdutor = produtoresMap[exec.produtor_id] || `ID ${exec.produtor_id}`;
        const nomeServico = servicosMap[exec.servico_id] || `ID ${exec.servico_id}`;

        const infoContainer = document.createElement('div');
        infoContainer.style.flexGrow = '1';
        infoContainer.innerHTML = `
            <span><strong>Data:</strong> ${exec.data_execucao}</span>
            <span><strong>Produtor:</strong> ${nomeProdutor}</span>
            <span><strong>Serviço:</strong> ${nomeServico}</span>
            <span><strong>Valor:</strong> R$ ${exec.valor_total.toFixed(2)}</span>
            <span style="font-size: 0.8em; color: grey;">(ID: ${exec.id})</span>
        `;

        const buttonsContainer = document.createElement('div');
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => {
            if (onEditClick) onEditClick(exec);
        };
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => {
             if (onDeleteClick) onDeleteClick(exec.id);
        };
        buttonsContainer.appendChild(btnEditar);
        buttonsContainer.appendChild(btnExcluir);

        item.appendChild(infoContainer);
        item.appendChild(buttonsContainer);
        listaHistorico.appendChild(item);
    });
}

// ======================================================
// 6. FUNÇÕES DE UI - PAGAMENTOS
// ======================================================
export function popularDropdownExecucoesPagamentos(execucoes, produtoresMap = {}, servicosMap = {}) {
    pagamentosSelectExecucao.innerHTML = '<option value="">Selecione um Agendamento...</option>';
    if (execucoes && execucoes.length > 0) {
        execucoes.sort((a, b) => new Date(b.data_execucao) - new Date(a.data_execucao));

        execucoes.forEach(exec => {
            const nomeProdutor = produtoresMap[exec.produtor_id] || `ID ${exec.produtor_id}`;
            const nomeServico = servicosMap[exec.servico_id] || `ID ${exec.servico_id}`;
            const option = document.createElement('option');
            option.value = exec.id;
            option.dataset.execucao = JSON.stringify(exec);
            option.dataset.produtorNome = nomeProdutor;
            option.dataset.servicoNome = nomeServico;
            option.textContent = `${exec.data_execucao} - ${nomeProdutor} - ${nomeServico} (R$ ${exec.valor_total.toFixed(2)})`;
            pagamentosSelectExecucao.appendChild(option);
        });
    } else {
        pagamentosSelectExecucao.innerHTML = '<option value="">Nenhum agendamento encontrado</option>';
    }
}
function mostrarAreaDetalhesPagamento(mostrar) {
    pagamentosDetalhesDiv.style.display = mostrar ? 'block' : 'none';
    pagamentoForm.style.display = mostrar ? 'block' : 'none';
    pagamentoFormPlaceholder.style.display = mostrar ? 'none' : 'block';
    if (!mostrar) {
        listaPagamentosUl.innerHTML = '<li>Selecione um agendamento para ver os pagamentos.</li>';
    }
}
export function exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, pagamentos) {
    if (!execucao) {
        mostrarAreaDetalhesPagamento(false);
        return;
    }
    const totalPago = pagamentos.reduce((soma, p) => soma + p.valor_pago, 0);
    const saldoDevedor = execucao.valor_total - totalPago;
    detalheProdutorNomeSpan.textContent = nomeProdutor;
    detalheServicoNomeSpan.textContent = nomeServico;
    detalheDataSpan.textContent = execucao.data_execucao;
    detalheValorTotalSpan.textContent = execucao.valor_total.toFixed(2);
    detalheTotalPagoSpan.textContent = totalPago.toFixed(2);
    detalheSaldoDevedorSpan.textContent = saldoDevedor.toFixed(2);
    pagamentoExecucaoIdInput.value = execucao.id;
    mostrarAreaDetalhesPagamento(true);
}
export function desenharListaPagamentos(pagamentos, onEditClick, onDeleteClick) {
    listaPagamentosUl.innerHTML = '';
    if (!pagamentos || pagamentos.length === 0) {
        listaPagamentosUl.innerHTML = '<li>Nenhum pagamento registrado para este agendamento.</li>';
        return;
    }
     pagamentos.sort((a, b) => new Date(b.data_pagamento) - new Date(a.data_pagamento));
    pagamentos.forEach(p => {
        const item = document.createElement('li');
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('pagamento-item-info');
        infoContainer.innerHTML = `
            <span><strong>Data:</strong> ${p.data_pagamento}</span>
            <span><strong>Valor:</strong> R$ ${p.valor_pago.toFixed(2)}</span>
            <span style="font-size: 0.8em; color: grey;">(ID: ${p.id})</span>
        `;
        const buttonsContainer = document.createElement('div');
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => onEditClick(p); 
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => onDeleteClick(p.id);
        buttonsContainer.appendChild(btnEditar);
        buttonsContainer.appendChild(btnExcluir);
        item.appendChild(infoContainer);
        item.appendChild(buttonsContainer);
        listaPagamentosUl.appendChild(item);
    });
}
export function limparFormularioPagamento() {
    pagamentoIdInput.value = '';
    pagamentoValorInput.value = '';
    pagamentoDataInput.value = '';
    pagamentoValorInput.focus();
    pagamentoBtnCancelar.style.display = 'none';
}
export function preencherFormularioPagamento(pagamento) {
    pagamentoIdInput.value = pagamento.id;
    pagamentoExecucaoIdInput.value = pagamento.execucao_id;
    pagamentoValorInput.value = pagamento.valor_pago;
    pagamentoDataInput.value = pagamento.data_pagamento;
    pagamentoValorInput.focus();
    pagamentoBtnCancelar.style.display = 'inline-block';
}
export function coletarDadosPagamento() {
    const valorPago = parseFloat(pagamentoValorInput.value);
    const dataPagamento = pagamentoDataInput.value;
    if (isNaN(valorPago) || valorPago <= 0 || !dataPagamento) {
        alert("Por favor, preencha o Valor Pago (maior que zero) e a Data.");
        return null;
    }
    const idPagamento = getIdPagamento();
    const idExecucao = parseInt(pagamentoExecucaoIdInput.value, 10);
    const dados = {
        valor_pago: valorPago,
        data_pagamento: dataPagamento
    };
    if (idPagamento && !isNaN(idExecucao)) {
        dados.execucao_id = idExecucao;
    }
    return dados;
}
export function getIdPagamento() {
    return pagamentoIdInput.value || null;
}


// ======================================================
// 7. FUNÇÕES DE UI - RELATÓRIOS
// ======================================================
export function popularDropdownRelatorioProdutores(produtores) {
    relatorioSelectProdutor.innerHTML = '<option value="">Selecione um Produtor...</option>';
    if (produtores && produtores.length > 0) {
        produtores.sort((a, b) => a.nome.localeCompare(b.nome));
        produtores.forEach(produtor => {
            const option = document.createElement('option');
            option.value = produtor.id; 
            option.textContent = produtor.nome;
            relatorioSelectProdutor.appendChild(option);
        });
    } else {
         relatorioSelectProdutor.innerHTML = '<option value="">Nenhum produtor cadastrado</option>';
    }
}
export function desenharRelatorioDividas(dividas) {
    listaRelatorioDividas.innerHTML = ''; 

    if (!dividas) {
        listaRelatorioDividas.innerHTML = '<li>Erro ao carregar relatório.</li>';
        return;
    }
    
    if (dividas.length === 0) {
        listaRelatorioDividas.innerHTML = '<li>Nenhuma dívida encontrada para este produtor.</li>';
        return;
    }
    
    dividas.forEach(divida => {
        const item = document.createElement('li');
        
        const valorTotal = divida.valor_total.toFixed(2);
        const totalPago = divida.total_pago.toFixed(2);
        const saldoDevedor = divida.saldo_devedor.toFixed(2);
        
        item.innerHTML = `
            <span><strong>Data:</strong> ${divida.data_execucao}</span>
            <span><strong>Serviço:</strong> ${divida.servico_nome}</span>
            <span><strong>Valor Total:</strong> R$ ${valorTotal}</span>
            <span><strong>Valor Pago:</strong> R$ ${totalPago}</span>
            <span style="color: red;"><strong>Saldo Devedor: R$ ${saldoDevedor}</strong></span>
            <span style="font-size: 0.8em; color: grey;">(Exec. ID: ${divida.execucao_id})</span>
        `;
        listaRelatorioDividas.appendChild(item);
    });
}