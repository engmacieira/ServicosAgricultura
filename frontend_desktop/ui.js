// ui.js (Nosso Módulo de "View" refatorado)

// ... (Cache dos elementos de Abas, Produtores, Serviços continua o mesmo) ...
// --- Elementos das Abas ---
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');
// --- Elementos do Painel Produtores ---
// (variáveis produtorForm, produtorIdInput, etc. continuam aqui)
const produtorForm = document.getElementById('produtor-form');
const produtorIdInput = document.getElementById('produtor-id');
const produtorNomeInput = document.getElementById('produtor-nome');
const produtorCpfInput = document.getElementById('produtor-cpf');
const produtorRegiaoInput = document.getElementById('produtor-regiao');
const produtorReferenciaInput = document.getElementById('produtor-referencia');
const produtorTelefoneInput = document.getElementById('produtor-telefone');
const listaProdutores = document.getElementById('lista-produtores');
// --- Elementos do Painel Serviços ---
// (variáveis servicoForm, servicoIdInput, etc. continuam aqui)
const servicoForm = document.getElementById('servico-form');
const servicoIdInput = document.getElementById('servico-id');
const servicoNomeInput = document.getElementById('servico-nome');
const servicoValorInput = document.getElementById('servico-valor');
const listaServicos = document.getElementById('lista-servicos');

// --- Elementos do Painel Agendamento (NOVOS) ---
const agendamentoForm = document.getElementById('agendamento-form');
const agendamentoIdInput = document.getElementById('agendamento-id')
const agendamentoProdutorSelect = document.getElementById('agendamento-produtor');
const agendamentoServicoSelect = document.getElementById('agendamento-servico');
const agendamentoDataInput = document.getElementById('agendamento-data');
const agendamentoHorasInput = document.getElementById('agendamento-horas');
const agendamentoValorInput = document.getElementById('agendamento-valor');

const listaHistorico = document.getElementById('lista-historico');

// --- Elementos do Painel Pagamentos (NOVOS) ---
const pagamentosSelectExecucao = document.getElementById('pagamentos-select-execucao');
const pagamentosDetalhesDiv = document.getElementById('pagamentos-detalhes-execucao');
const detalheProdutorNomeSpan = document.getElementById('detalhe-produtor-nome');
const detalheServicoNomeSpan = document.getElementById('detalhe-servico-nome');
const detalheDataSpan = document.getElementById('detalhe-data');
const detalheValorTotalSpan = document.getElementById('detalhe-valor-total');
const detalheTotalPagoSpan = document.getElementById('detalhe-total-pago');
const detalheSaldoDevedorSpan = document.getElementById('detalhe-saldo-devedor');
const listaPagamentosUl = document.getElementById('lista-pagamentos');
const pagamentoForm = document.getElementById('pagamento-form');
const pagamentoFormPlaceholder = document.getElementById('pagamento-form-placeholder');
const pagamentoIdInput = document.getElementById('pagamento-id');
const pagamentoExecucaoIdInput = document.getElementById('pagamento-execucao-id'); // Campo escondido
const pagamentoValorInput = document.getElementById('pagamento-valor');
const pagamentoDataInput = document.getElementById('pagamento-data');
const pagamentoBtnCancelar = document.getElementById('pagamento-btn-cancelar');

// ======================================================
// 1. LÓGICA DE GERENCIAMENTO DAS ABAS
// (Sem alterações)
// ======================================================
export function inicializarAbas(onTabChangeCallback) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPaneId = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === targetPaneId));
            if (onTabChangeCallback) onTabChangeCallback(targetPaneId);
        });
    });
}

// ======================================================
// 2. FUNÇÕES DE UI - PRODUTORES
// (Sem alterações)
// ======================================================
export function desenharListaProdutores(produtores, onEditClick, onDeleteClick) {
    listaProdutores.innerHTML = '';
    if (!produtores || produtores.length === 0) { listaProdutores.innerHTML = '<li>Nenhum produtor cadastrado.</li>'; return; }
    produtores.forEach(produtor => { /* ... (código igual) ... */ 
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
export function limparFormularioProdutor() { /* ... (código igual) ... */ 
    produtorIdInput.value = ''; produtorNomeInput.value = ''; produtorCpfInput.value = '';
    produtorRegiaoInput.value = ''; produtorReferenciaInput.value = ''; produtorTelefoneInput.value = '';
    produtorNomeInput.focus();
}
export function preencherFormularioProdutor(produtor) { /* ... (código igual) ... */ 
    produtorIdInput.value = produtor.id; produtorNomeInput.value = produtor.nome;
    produtorCpfInput.value = produtor.cpf; produtorRegiaoInput.value = produtor.regiao;
    produtorReferenciaInput.value = produtor.referencia; produtorTelefoneInput.value = produtor.telefone;
    produtorNomeInput.focus();
}
export function coletarDadosProdutor() { /* ... (código igual) ... */ 
    return {
        nome: produtorNomeInput.value, cpf: produtorCpfInput.value || null,
        regiao: produtorRegiaoInput.value || null, referencia: produtorReferenciaInput.value || null,
        telefone: produtorTelefoneInput.value || null
    };
}
export function getIdProdutor() { /* ... (código igual) ... */ 
    return produtorIdInput.value || null;
}

// ======================================================
// 3. FUNÇÕES DE UI - SERVIÇOS
// (Sem alterações)
// ======================================================
export function desenharListaServicos(servicos, onEditClick, onDeleteClick) {
    listaServicos.innerHTML = '';
    if (!servicos || servicos.length === 0) { listaServicos.innerHTML = '<li>Nenhum serviço cadastrado.</li>'; return; }
    servicos.forEach(servico => { /* ... (código igual) ... */ 
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
export function limparFormularioServico() { /* ... (código igual) ... */ 
    servicoIdInput.value = ''; servicoNomeInput.value = ''; servicoValorInput.value = '';
    servicoNomeInput.focus();
}
export function preencherFormularioServico(servico) { /* ... (código igual) ... */ 
    servicoIdInput.value = servico.id; servicoNomeInput.value = servico.nome;
    servicoValorInput.value = servico.valor_unitario;
    servicoNomeInput.focus();
}
export function coletarDadosServico() { /* ... (código igual) ... */ 
    return {
        nome: servicoNomeInput.value,
        valor_unitario: parseFloat(servicoValorInput.value) || 0.0
    };
}
export function getIdServico() { /* ... (código igual) ... */ 
    return servicoIdInput.value || null;
}

// ======================================================
// 4. FUNÇÕES DE UI - AGENDAMENTO (NOVAS)
// ======================================================

/**
 * Preenche o dropdown (<select>) de Produtores no formulário de Agendamento.
 * @param {Array} produtores - A lista de objetos produtor vinda da API.
 */
export function popularDropdownProdutores(produtores) {
    agendamentoProdutorSelect.innerHTML = '<option value="">Selecione um Produtor...</option>'; // Limpa e adiciona opção padrão
    if (produtores && produtores.length > 0) {
        produtores.forEach(produtor => {
            const option = document.createElement('option');
            option.value = produtor.id; // O valor será o ID
            option.textContent = produtor.nome; // O texto visível será o Nome
            agendamentoProdutorSelect.appendChild(option);
        });
    } else {
         agendamentoProdutorSelect.innerHTML = '<option value="">Nenhum produtor cadastrado</option>';
    }
}

/**
 * Preenche o dropdown (<select>) de Serviços no formulário de Agendamento.
 * @param {Array} servicos - A lista de objetos servico vinda da API.
 */
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

/** Limpa o formulário de Agendamento. */
export function limparFormularioAgendamento() {
    agendamentoIdInput.value = ''; // <-- Limpa o ID escondido
    agendamentoProdutorSelect.value = '';
    agendamentoServicoSelect.value = '';
    agendamentoDataInput.value = '';
    agendamentoHorasInput.value = '0.0';
    agendamentoValorInput.value = '0.00';
    agendamentoProdutorSelect.focus();
}

/**
 * Preenche o formulário de Agendamento para edição. (NOVA FUNÇÃO)
 * @param {Object} execucao - O objeto de execução vindo da API.
 */
export function preencherFormularioAgendamento(execucao) {
    agendamentoIdInput.value = execucao.id; // <-- Preenche o ID escondido
    agendamentoProdutorSelect.value = execucao.produtor_id;
    agendamentoServicoSelect.value = execucao.servico_id;
    // Formata a data se necessário (API envia YYYY-MM-DD, que é o formato do input type="date")
    agendamentoDataInput.value = execucao.data_execucao;
    agendamentoHorasInput.value = execucao.horas_prestadas;
    agendamentoValorInput.value = execucao.valor_total;
    agendamentoProdutorSelect.focus(); // Foca no primeiro campo
}

/** Retorna o ID do formulário de Agendamento. (NOVA FUNÇÃO) */
export function getIdAgendamento() {
    return agendamentoIdInput.value || null;
}

/**
 * Lê os dados do formulário de Agendamento e retorna um objeto
 * no formato esperado pela API para criar uma Execução.
 */
export function coletarDadosAgendamento() {
    // Validação básica (campos obrigatórios) já é feita pelo HTML ('required')
    // Mas é bom garantir que temos valores numéricos válidos.
    const produtorId = parseInt(agendamentoProdutorSelect.value, 10);
    const servicoId = parseInt(agendamentoServicoSelect.value, 10);
    const dataExecucao = agendamentoDataInput.value;
    const horasPrestadas = parseFloat(agendamentoHorasInput.value) || 0.0;
    const valorTotal = parseFloat(agendamentoValorInput.value) || 0.00;

    // Retorna null se algum ID não for válido (não selecionado)
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
// 5. FUNÇÕES DE UI - HISTÓRICO (NOVAS)
// ======================================================

/**
 * Desenha a lista de execuções (histórico) na tela (Atualizada com botões).
 * @param {Array} execucoes - Lista de objetos de execução vindos da API.
 * @param {Object} [produtoresMap] - Mapa {id: nome}.
 * @param {Object} [servicosMap] - Mapa {id: nome}.
 * @param {Function} onEditClick - Callback para o botão Editar.
 * @param {Function} onDeleteClick - Callback para o botão Excluir.
 */
export function desenharListaExecucoes(execucoes, produtoresMap = {}, servicosMap = {}, onEditClick, onDeleteClick) {
    listaHistorico.innerHTML = ''; // Limpa a lista

    if (!execucoes || execucoes.length === 0) {
        listaHistorico.innerHTML = '<li>Nenhum agendamento encontrado.</li>';
        return;
    }

    execucoes.forEach(exec => {
        const item = document.createElement('li');
        const nomeProdutor = produtoresMap[exec.produtor_id] || `ID ${exec.produtor_id}`;
        const nomeServico = servicosMap[exec.servico_id] || `ID ${exec.servico_id}`;

        // Cria um contêiner para o texto para melhor alinhamento
        const infoContainer = document.createElement('div');
        infoContainer.style.flexGrow = '1'; // Faz ocupar espaço disponível
        infoContainer.innerHTML = `
            <span><strong>Data:</strong> ${exec.data_execucao}</span>
            <span><strong>Produtor:</strong> ${nomeProdutor}</span>
            <span><strong>Serviço:</strong> ${nomeServico}</span>
            <span><strong>Valor:</strong> R$ ${exec.valor_total.toFixed(2)}</span>
            <span style="font-size: 0.8em; color: grey;">(ID: ${exec.id})</span>
        `;

        // Cria um contêiner para os botões
        const buttonsContainer = document.createElement('div');

        // Botão Editar (NOVO)
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => {
            // Avisa o controlador qual execução foi clicada para editar
            if (onEditClick) onEditClick(exec);
        };

        // Botão Excluir (NOVO)
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => {
            // Avisa o controlador qual ID foi clicado para excluir
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
// 6. FUNÇÕES DE UI - PAGAMENTOS (NOVAS)
// ======================================================

/**
 * Preenche o dropdown (<select>) de Execuções na aba Pagamentos.
 * @param {Array} execucoes - Lista vinda da API.
 * @param {Object} produtoresMap - Mapa {id: nome}.
 * @param {Object} servicosMap - Mapa {id: nome}.
 */
export function popularDropdownExecucoesPagamentos(execucoes, produtoresMap = {}, servicosMap = {}) {
    pagamentosSelectExecucao.innerHTML = '<option value="">Selecione um Agendamento...</option>';
    if (execucoes && execucoes.length > 0) {
        // Ordena por data mais recente primeiro, se não vier ordenado
        execucoes.sort((a, b) => new Date(b.data_execucao) - new Date(a.data_execucao));

        execucoes.forEach(exec => {
            const nomeProdutor = produtoresMap[exec.produtor_id] || `ID ${exec.produtor_id}`;
            const nomeServico = servicosMap[exec.servico_id] || `ID ${exec.servico_id}`;
            const option = document.createElement('option');
            option.value = exec.id; // Valor é o ID da execução
            // Guarda os dados completos no dataset para fácil acesso posterior
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

/**
 * Mostra ou esconde a área de detalhes da execução e o formulário de pagamento.
 * @param {boolean} mostrar - True para mostrar, false para esconder.
 */
function mostrarAreaDetalhesPagamento(mostrar) {
    pagamentosDetalhesDiv.style.display = mostrar ? 'block' : 'none';
    pagamentoForm.style.display = mostrar ? 'block' : 'none';
    pagamentoFormPlaceholder.style.display = mostrar ? 'none' : 'block';
    if (!mostrar) {
        listaPagamentosUl.innerHTML = '<li>Selecione um agendamento para ver os pagamentos.</li>';
    }
}

/**
 * Exibe os detalhes de uma execução selecionada e calcula o saldo.
 * @param {Object} execucao - O objeto da execução.
 * @param {string} nomeProdutor - Nome do produtor.
 * @param {string} nomeServico - Nome do serviço.
 * @param {Array} pagamentos - Lista de pagamentos para esta execução.
 */
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

    // Define o ID da execução no campo escondido do formulário de pagamento
    pagamentoExecucaoIdInput.value = execucao.id;

    mostrarAreaDetalhesPagamento(true);
}

/**
 * Desenha a lista de pagamentos para a execução selecionada.
 * @param {Array} pagamentos - Lista de objetos de pagamento.
 * @param {Function} onEditClick - Callback para o botão Editar.
 * @param {Function} onDeleteClick - Callback para o botão Excluir.
 */
export function desenharListaPagamentos(pagamentos, onEditClick, onDeleteClick) {
    listaPagamentosUl.innerHTML = '';
    if (!pagamentos || pagamentos.length === 0) {
        listaPagamentosUl.innerHTML = '<li>Nenhum pagamento registrado para este agendamento.</li>';
        return;
    }

    // Ordena por data (mais recente primeiro)
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
        btnEditar.onclick = () => onEditClick(p); // Passa o objeto pagamento inteiro

        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => onDeleteClick(p.id); // Passa só o ID

        buttonsContainer.appendChild(btnEditar);
        buttonsContainer.appendChild(btnExcluir);

        item.appendChild(infoContainer);
        item.appendChild(buttonsContainer);
        listaPagamentosUl.appendChild(item);
    });
}

/** Limpa o formulário de Pagamento. */
export function limparFormularioPagamento() {
    pagamentoIdInput.value = ''; // Limpa ID de edição
    // Não limpa o pagamentoExecucaoIdInput, pois ele pertence à execução selecionada
    pagamentoValorInput.value = '';
    pagamentoDataInput.value = '';
    pagamentoValorInput.focus();
    // Esconde o botão Cancelar Edição
    pagamentoBtnCancelar.style.display = 'none';
}

/** Preenche o formulário de Pagamento para edição. */
export function preencherFormularioPagamento(pagamento) {
    pagamentoIdInput.value = pagamento.id; // Guarda o ID para saber que é edição
    pagamentoExecucaoIdInput.value = pagamento.execucao_id; // Confirma a execução
    pagamentoValorInput.value = pagamento.valor_pago;
    pagamentoDataInput.value = pagamento.data_pagamento;
    pagamentoValorInput.focus();
    // Mostra o botão Cancelar Edição
    pagamentoBtnCancelar.style.display = 'inline-block';
}

/** Lê os dados do formulário de Pagamento e retorna um objeto. */
export function coletarDadosPagamento() {
    const valorPago = parseFloat(pagamentoValorInput.value);
    const dataPagamento = pagamentoDataInput.value;

    if (isNaN(valorPago) || valorPago <= 0 || !dataPagamento) {
        alert("Por favor, preencha o Valor Pago (maior que zero) e a Data.");
        return null;
    }

    // Inclui execucao_id SE estivermos editando (API PUT precisa)
    // Se for criação, a API aninhada já sabe o execucao_id pela URL
    const idPagamento = getIdPagamento();
    const idExecucao = parseInt(pagamentoExecucaoIdInput.value, 10);

    const dados = {
        valor_pago: valorPago,
        data_pagamento: dataPagamento
    };

    if (idPagamento && !isNaN(idExecucao)) {
        // Inclui execucao_id ao editar, pois a API PUT /pagamentos/:id pode precisar
        // (Depende da implementação exata da API, mas é seguro incluir)
        dados.execucao_id = idExecucao;
    }


    return dados;
}

/** Retorna o ID do formulário de Pagamento (para edição). */
export function getIdPagamento() {
    return pagamentoIdInput.value || null;
}