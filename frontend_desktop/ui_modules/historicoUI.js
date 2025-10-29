// historicoUI.js - Módulo UI para a aba Histórico

// --- Elementos DOM ---
let listaHistorico;

// --- Handlers do Controlador (para os botões da lista) ---
let handlers = {};

function _inicializarDOM() {
    listaHistorico = document.getElementById('lista-historico');
    console.log("HistoricoUI: Elemento DOM 'cacheado'.");
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
export function desenharListaExecucoes(execucoes, produtoresMap = {}, servicosMap = {}) {
     if (!listaHistorico) {
        console.error("HistoricoUI: Elemento 'lista-historico' não encontrado para desenhar.");
        return; // Proteção
    }
    listaHistorico.innerHTML = '';

    if (!execucoes || execucoes.length === 0) {
        listaHistorico.innerHTML = '<li>Nenhum agendamento encontrado.</li>';
        return;
    }

    // Ordena por data (mais recente primeiro)
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

        // Botão Editar
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => {
            // Chama o handler passado pelo renderer
            if (handlers.onEditExecucao) handlers.onEditExecucao(exec);
        };

        // Botão Excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => {
            // Chama o handler passado pelo renderer
             if (handlers.onDeleteExecucao) handlers.onDeleteExecucao(exec.id);
        };

        buttonsContainer.appendChild(btnEditar);
        buttonsContainer.appendChild(btnExcluir);

        item.appendChild(infoContainer);
        item.appendChild(buttonsContainer);
        listaHistorico.appendChild(item);
    });
}