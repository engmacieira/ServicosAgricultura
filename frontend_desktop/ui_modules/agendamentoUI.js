// agendamentoUI.js - Módulo UI para Agendamento/Execução

// --- Elementos DOM ---
let agendamentoForm;
let agendamentoIdInput;
let agendamentoProdutorSelect;
let agendamentoServicoSelect;
let agendamentoDataInput;
let agendamentoHorasHInput;
let agendamentoHorasMInput
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
    agendamentoHorasHInput = document.getElementById('agendamento-horas-h');
    agendamentoHorasMInput = document.getElementById('agendamento-horas-m');
    agendamentoValorInput = document.getElementById('agendamento-valor');
    agendamentoBtnLimpar = document.getElementById('agendamento-btn-limpar');
    console.log("AgendamentoUI: Elementos DOM 'cacheados'.");
}

// CÓDIGO NOVO (com cálculo automático)
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

    // --- ADICIONANDO OS NOVOS EVENTOS ---
    if (agendamentoServicoSelect) {
        // 'change' -> quando o usuário seleciona um novo serviço
        agendamentoServicoSelect.addEventListener('change', _atualizarValorTotal);
    }
    
    // --- CORREÇÃO 1: Adiciona listeners aos campos H e M ---
    if (agendamentoHorasHInput) {
        agendamentoHorasHInput.addEventListener('input', _atualizarValorTotal);
    }
    if (agendamentoHorasMInput) {
        agendamentoHorasMInput.addEventListener('input', _atualizarValorTotal);
    }
    // --- FIM DA CORREÇÃO 1 ---
    // --- FIM DA ADIÇÃO ---

    console.log("AgendamentoUI: Eventos vinculados (se encontrados).");
}

/**
 * (NOVO) Função interna para calcular e exibir o valor total.
 */
/**
 * (NOVO) Função interna para calcular e exibir o valor total.
 */
function _atualizarValorTotal() {
    // --- CORREÇÃO 2: Usa as variáveis H e M ---
    // Garante que os elementos existem
    if (!agendamentoServicoSelect || !agendamentoHorasHInput || !agendamentoHorasMInput || !agendamentoValorInput) return;

    // 1. Pega o <option> selecionado
    const selectedOption = agendamentoServicoSelect.options[agendamentoServicoSelect.selectedIndex];
    
    // 2. Pega o valor unitário que armazenamos no dataset
    const valorUnitario = parseFloat(selectedOption.dataset.valor || 0.0);
    
    // 3. Pega as horas e minutos (LÓGICA NOVA)
    const horas = parseInt(agendamentoHorasHInput.value, 10) || 0;
    const minutos = parseInt(agendamentoHorasMInput.value, 10) || 0;

    // 4. Converte para horas decimais (Ex: 1h 30m -> 1.5)
    // Exatamente como fizemos na função coletarDadosAgendamento
    const horasDecimais = horas + (minutos / 60);
    
    // 5. Calcula o total
    const valorTotal = valorUnitario * horasDecimais;
    
    // 6. Atualiza o campo (formatado com 2 casas decimais)
    // Usamos toFixed() para formatar, mas também parseFloat() para limpar 
    // e evitar erros de "string" se o usuário apagar o campo
    agendamentoValorInput.value = parseFloat(valorTotal.toFixed(2));
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
            
            // --- A MÁGICA ESTÁ AQUI ---
            // Armazenamos o valor no próprio elemento da option
            option.dataset.valor = servico.valor_unitario; 
            
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
    agendamentoHorasHInput.value = '0';
    agendamentoHorasMInput.value = '0';
    agendamentoValorInput.value = '0.00';
    agendamentoProdutorSelect.focus();
}

export function preencherFormularioAgendamento(execucao) {
    if (!agendamentoForm) return;
    agendamentoIdInput.value = execucao.id;
    agendamentoProdutorSelect.value = execucao.produtor_id;
    agendamentoServicoSelect.value = execucao.servico_id;
    agendamentoDataInput.value = execucao.data_execucao;
    const horasDecimal = parseFloat(execucao.horas_prestadas) || 0.0;

    // Ex: 10.5
    const horasInteiras = Math.floor(horasDecimal); // -> 10
    const minutosFracao = (horasDecimal - horasInteiras) * 60; // -> (10.5 - 10) * 60 -> 0.5 * 60 -> 30

    agendamentoHorasHInput.value = horasInteiras;
    agendamentoHorasMInput.value = Math.round(minutosFracao); // Usamos Math.round() para evitar problemas de precisão de float
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
    const horas = parseInt(agendamentoHorasHInput.value, 10) || 0;
    const minutos = parseInt(agendamentoHorasMInput.value, 10) || 0;

    // A lógica de negócio: 10h 30min -> 10 + (30 / 60) -> 10.5
    const horasPrestadas = horas + (minutos / 60);
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