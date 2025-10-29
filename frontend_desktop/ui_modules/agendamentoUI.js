// agendamentoUI.js - Módulo UI para Agendamento/Execução

// --- Elementos DOM ---
let agendamentoForm;
let agendamentoIdInput;
let agendamentoProdutorSelect;
let agendamentoServicoSelect;
let agendamentoDataInput;
let agendamentoHorasInput;
let agendamentoValorInput;
let agendamentoBtnLimpar;

// --- Handlers do Controlador ---
let handlers = {};

function _inicializarDOM() {
    agendamentoForm = document.getElementById('agendamento-form');
    agendamentoIdInput = document.getElementById('agendamento-id');
    agendamentoProdutorSelect = document.getElementById('agendamento-produtor');
    agendamentoServicoSelect = document.getElementById('agendamento-servico');
    agendamentoDataInput = document.getElementById('agendamento-data');
    agendamentoHorasInput = document.getElementById('agendamento-horas');
    agendamentoValorInput = document.getElementById('agendamento-valor');
    agendamentoBtnLimpar = document.getElementById('agendamento-btn-limpar');
    console.log("AgendamentoUI: Elementos DOM 'cacheados'.");
}

function _vincularEventos() {
    if (agendamentoForm) {
        agendamentoForm.addEventListener('submit', handlers.onSaveExecucao);
    } else {
        console.error("AgendamentoUI: Elemento 'agendamento-form' não encontrado.");
    }

    if (agendamentoBtnLimpar) {
        agendamentoBtnLimpar.addEventListener('click', handlers.onClearAgendamento);
    } else {
         console.error("AgendamentoUI: Elemento 'agendamento-btn-limpar' não encontrado.");
    }
    console.log("AgendamentoUI: Eventos vinculados (se encontrados).");
}

/**
 * Inicializa o módulo UI de Agendamento.
 * @param {object} externalHandlers - Handlers vindos do renderer.js
 */
export function inicializar(externalHandlers) {
    handlers = externalHandlers;
    _inicializarDOM();
    _vincularEventos();
}

// --- Funções de Manipulação da UI (exportadas) ---

export function popularDropdownProdutores(produtores) {
    if (!agendamentoProdutorSelect) return;
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
    if (!agendamentoServicoSelect) return;
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
    if (!agendamentoForm) return;
    agendamentoIdInput.value = '';
    agendamentoProdutorSelect.value = '';
    agendamentoServicoSelect.value = '';
    agendamentoDataInput.value = '';
    agendamentoHorasInput.value = '0.0';
    agendamentoValorInput.value = '0.00';
    agendamentoProdutorSelect.focus();
}

export function preencherFormularioAgendamento(execucao) {
    if (!agendamentoForm) return;
    agendamentoIdInput.value = execucao.id;
    agendamentoProdutorSelect.value = execucao.produtor_id;
    agendamentoServicoSelect.value = execucao.servico_id;
    agendamentoDataInput.value = execucao.data_execucao;
    agendamentoHorasInput.value = execucao.horas_prestadas;
    agendamentoValorInput.value = execucao.valor_total;
    agendamentoProdutorSelect.focus();
}

export function getIdAgendamento() {
    return agendamentoIdInput ? agendamentoIdInput.value || null : null;
}

export function coletarDadosAgendamento() {
    if (!agendamentoForm) return null;
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