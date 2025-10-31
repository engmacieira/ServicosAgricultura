// pagamentoUI.js - Módulo UI para Pagamentos

// --- Elementos DOM ---
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
let pagamentoExecucaoIdInput; // Campo escondido para saber a qual execução pertence o pagamento
let pagamentoValorInput;
let pagamentoDataInput;
let pagamentoBtnLimpar;
let pagamentoBtnCancelar;

// --- Handlers do Controlador ---
let handlers = {};

function _inicializarDOM() {
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
    pagamentoBtnLimpar = document.getElementById('pagamento-btn-limpar');
    pagamentoBtnCancelar = document.getElementById('pagamento-btn-cancelar');
    console.log("PagamentoUI: Elementos DOM 'cacheados'.");
}

function _vincularEventos() {
    if (pagamentosSelectExecucao) {
        pagamentosSelectExecucao.addEventListener('change', handlers.onExecucaoSelecionada);
    } else {
         console.error("PagamentoUI: Elemento 'pagamentos-select-execucao' não encontrado.");
    }

    if (pagamentoForm) {
        pagamentoForm.addEventListener('submit', handlers.onSavePagamento);
    } else {
         console.error("PagamentoUI: Elemento 'pagamento-form' não encontrado.");
    }

    if (pagamentoBtnLimpar) {
        pagamentoBtnLimpar.addEventListener('click', handlers.onClearPagamento);
    } else {
        console.error("PagamentoUI: Elemento 'pagamento-btn-limpar' não encontrado.");
    }

    if (pagamentoBtnCancelar) {
        pagamentoBtnCancelar.addEventListener('click', handlers.onCancelEditPagamento);
    } else {
        console.error("PagamentoUI: Elemento 'pagamento-btn-cancelar' não encontrado.");
    }
    console.log("PagamentoUI: Eventos vinculados (se encontrados).");
}

/**
 * Inicializa o módulo UI de Pagamentos.
 * @param {object} externalHandlers - Handlers vindos do renderer.js
 */
export function inicializar(externalHandlers) {
    handlers = externalHandlers;
    _inicializarDOM();
    _vincularEventos();
}

// --- Funções de Manipulação da UI (exportadas) ---

export function popularDropdownExecucoesPagamentos(execucoes, produtoresMap = {}, servicosMap = {}) {
    if (!pagamentosSelectExecucao) return;
    pagamentosSelectExecucao.innerHTML = '<option value="">Selecione um Agendamento...</option>';
    if (execucoes && execucoes.length > 0) {
        execucoes.sort((a, b) => new Date(b.data_execucao) - new Date(a.data_execucao));

        execucoes.forEach(exec => {
            const nomeProdutor = produtoresMap[exec.produtor_id] || `ID ${exec.produtor_id}`;
            const nomeServico = servicosMap[exec.servico_id] || `ID ${exec.servico_id}`;
            const option = document.createElement('option');
            option.value = exec.id;
            // Guarda dados completos no dataset para o handler 'onExecucaoSelecionada' usar
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

// CÓDIGO CORRETO:
function mostrarAreaDetalhesPagamento(mostrar) {
    if (!pagamentosDetalhesDiv || !pagamentoForm || !pagamentoFormPlaceholder || !listaPagamentosUl) return;

    // 1. Mostra/Esconde a coluna da DIREITA (Detalhes)
    pagamentosDetalhesDiv.style.display = mostrar ? 'block' : 'none';

    // 2. Mostra/Esconde o FORMULÁRIO (na coluna da ESQUERDA)
    // Se mostrar=true, form fica 'block'
    pagamentoForm.style.display = mostrar ? 'block' : 'none';

    // 3. Mostra/Esconde o PLACEHOLDER (na coluna da ESQUERDA)
    // Se mostrar=true, placeholder fica 'none' (some)
    pagamentoFormPlaceholder.style.display = mostrar ? 'none' : 'block';

    if (!mostrar) {
        listaPagamentosUl.innerHTML = '<li>Selecione um agendamento para ver os pagamentos.</li>';
    }
}

export function exibirDetalhesExecucaoPagamentos(execucao, nomeProdutor, nomeServico, pagamentos) {
    if (!pagamentosDetalhesDiv) return; // Proteção
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
    pagamentoExecucaoIdInput.value = execucao.id; // Define o ID da execução no form
    mostrarAreaDetalhesPagamento(true);
}

export function desenharListaPagamentos(pagamentos) {
     if (!listaPagamentosUl) {
         console.error("PagamentoUI: Elemento 'lista-pagamentos' não encontrado para desenhar.");
         return;
     }
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
        btnEditar.onclick = () => handlers.onEditPagamento(p); // Chama handler do renderer
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => handlers.onDeletePagamento(p.id); // Chama handler do renderer
        buttonsContainer.appendChild(btnEditar);
        buttonsContainer.appendChild(btnExcluir);
        item.appendChild(infoContainer);
        item.appendChild(buttonsContainer);
        listaPagamentosUl.appendChild(item);
    });
}

export function limparFormularioPagamento() {
    if (!pagamentoForm) return;
    pagamentoIdInput.value = '';
    // Não limpa pagamentoExecucaoIdInput, ele pertence à execução selecionada
    pagamentoValorInput.value = '';
    pagamentoDataInput.value = '';
    pagamentoValorInput.focus();
    pagamentoBtnCancelar.style.display = 'none'; // Esconde botão Cancelar
}

export function preencherFormularioPagamento(pagamento) {
    if (!pagamentoForm) return;
    pagamentoIdInput.value = pagamento.id;
    pagamentoExecucaoIdInput.value = pagamento.execucao_id; // Confirma ID da execução
    pagamentoValorInput.value = pagamento.valor_pago;
    pagamentoDataInput.value = pagamento.data_pagamento;
    pagamentoValorInput.focus();
    pagamentoBtnCancelar.style.display = 'inline-block'; // Mostra botão Cancelar
}

export function coletarDadosPagamento() {
    if (!pagamentoForm) return null;
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
    // Inclui execucao_id se estiver editando (API PUT precisa)
    if (idPagamento && !isNaN(idExecucao)) {
        dados.execucao_id = idExecucao;
    }
    return dados;
}

export function getIdPagamento() {
    return pagamentoIdInput ? pagamentoIdInput.value || null : null;
}