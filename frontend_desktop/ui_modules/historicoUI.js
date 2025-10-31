// historicoUI.js - Módulo UI para a aba Histórico

// --- Elementos DOM ---
let listaHistorico;
let historicoPaginationInfo;
let historicoBtnAnterior;
let historicoBtnProximo;

// --- Handlers do Controlador (para os botões da lista) ---
let handlers = {};

/**
 * (NOVO) Helper para formatar data AAAA-MM-DD para DD/MM/AAAA
 */
function _formatarData(dataISO) {
    if (!dataISO) return 'N/A';
    try {
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        console.error("Erro ao formatar data:", dataISO, e);
        return dataISO; // Retorna a data original se falhar
    }
}

function _inicializarDOM() {
    listaHistorico = document.getElementById('lista-historico');
    historicoPaginationInfo = document.getElementById('historico-pagination-info');
    historicoBtnAnterior = document.getElementById('historico-btn-anterior');
    historicoBtnProximo = document.getElementById('historico-btn-proximo');
    console.log("HistoricoUI: Elemento DOM 'cacheado'.");
}

function _vincularEventos() {
    // Vínculos dos botões de paginação
    if (historicoBtnAnterior) {
        historicoBtnAnterior.addEventListener('click', handlers.onHistoricoPaginaAnterior);
    }
    if (historicoBtnProximo) {
        historicoBtnProximo.addEventListener('click', handlers.onHistoricoPaginaProxima);
    }
    console.log("HistoricoUI: Eventos de paginação vinculados.");
}

// Nota: Não temos um _vincularEventos() principal aqui, pois não há formulários
// Os eventos dos botões são vinculados dinamicamente em desenharListaExecucoes

/**
 * Inicializa o módulo UI de Histórico.
 * @param {object} externalHandlers - Handlers vindos do renderer.js (onEditExecucao, onDeleteExecucao)
 */
export function inicializar(externalHandlers) {
    handlers = externalHandlers; // Armazena os handlers para os botões Editar/Excluir
    _inicializarDOM();
    _vincularEventos();
    // Não precisa chamar _vincularEventos aqui
}

// --- Funções de Manipulação da UI (exportadas) ---

/**
 * Desenha a lista de execuções (histórico) na tela.
 * @param {Array} execucoes - Lista de objetos de execução vindos da API.
 * @param {Object} [produtoresMap] - Mapa {id: nome}.
 * @param {Object} [servicosMap] - Mapa {id: nome}.
 * // Os handlers agora vêm do objeto 'handlers' do módulo
 */
// CÓDIGO NOVO (Aceita o objeto de paginação)
// CÓDIGO NOVO (lê dados prontos do backend)
export function desenharListaExecucoes(paginatedData) {
     if (!listaHistorico || !historicoPaginationInfo || !historicoBtnAnterior || !historicoBtnProximo) {
        console.error("HistoricoUI: Elemento 'lista-historico' ou paginação não encontrado para desenhar.");
        return; 
    }

    const { execucoes, total_pages, current_page } = paginatedData;
    listaHistorico.innerHTML = '';

    if (!execucoes || execucoes.length === 0) {
        listaHistorico.innerHTML = '<li>Nenhum agendamento encontrado.</li>';
    } else {
        execucoes.forEach(exec => {
            const item = document.createElement('li');
            
            // --- TAREFA 1: Exibir Apelido ---
            let nomeDisplay = exec.produtor_nome;
            if (exec.produtor_apelido) {
                nomeDisplay += ` (${exec.produtor_apelido})`;
            }

            // --- TAREFA 3: Resumo do Pagamento (Estilo) ---
            let statusPagamentoHTML = '';
            if (exec.saldo_devedor <= 0) {
                statusPagamentoHTML = `<span style="color: green; font-weight: bold;">(Pago)</span>`;
            } else if (exec.saldo_devedor > 0) {
                statusPagamentoHTML = `<span style="color: red; font-weight: bold;">(R$ ${exec.saldo_devedor.toFixed(2)} pendente)</span>`;
            }

            // --- Montagem do HTML ---
            const infoContainer = document.createElement('div');
            infoContainer.style.flexGrow = '1';
            infoContainer.innerHTML = `
                <div>
                    <span><strong>Data:</strong> ${_formatarData(exec.data_execucao)}</span>
                    <span><strong>Produtor:</strong> ${nomeDisplay}</span>
                    <span><strong>Serviço:</strong> ${exec.servico_nome}</span>
                </div>
                <div style="margin-top: 5px; font-size: 0.9em;">
                    <span>Valor Total: R$ ${exec.valor_total.toFixed(2)}</span>
                    | <span>Total Pago: R$ ${exec.total_pago.toFixed(2)}</span>
                    ${statusPagamentoHTML}
                    <span style="font-size: 0.9em; color: grey; margin-left: 10px;">(ID: ${exec.id})</span>
                </div>
            `;

            // Lógica dos botões (permanece a mesma)
            const buttonsContainer = document.createElement('div');
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => {
                // NOTA: O 'exec' que passamos aqui é o objeto do backend.
                // A função 'preencherFormularioAgendamento' espera
                // 'produtor_id' e 'servico_id', que não temos mais.
                // Precisamos refatorar 'handleEditExecucao'
                
                // MANTEMOS POR ENQUANTO, MAS SABEMOS QUE O EDITAR VAI QUEBRAR
                if (handlers.onEditExecucao) handlers.onEditExecucao(exec);
            };

            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.onclick = () => {
                 if (handlers.onDeleteExecucao) handlers.onDeleteExecucao(exec.id);
            };

            buttonsContainer.appendChild(btnEditar);
            buttonsContainer.appendChild(btnExcluir);

            item.appendChild(infoContainer);
            item.appendChild(buttonsContainer);
            listaHistorico.appendChild(item);
        });
    }

    // Atualiza a paginação (mesma lógica)
    historicoPaginationInfo.textContent = `Página ${current_page} de ${total_pages || 1}`;
    historicoBtnAnterior.disabled = (current_page <= 1);
    historicoBtnProximo.disabled = (current_page >= total_pages);
}