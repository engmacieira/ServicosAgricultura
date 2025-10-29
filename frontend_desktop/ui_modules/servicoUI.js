// servicoUI.js - Módulo UI para Serviços

// --- Elementos DOM ---
let servicoForm;
let servicoIdInput;
let servicoNomeInput;
let servicoValorInput;
let listaServicos;
let servicoBtnLimpar;

// --- Handlers do Controlador ---
let handlers = {};

function _inicializarDOM() {
    servicoForm = document.getElementById('servico-form');
    servicoIdInput = document.getElementById('servico-id');
    servicoNomeInput = document.getElementById('servico-nome');
    servicoValorInput = document.getElementById('servico-valor');
    listaServicos = document.getElementById('lista-servicos');
    servicoBtnLimpar = document.getElementById('servico-btn-limpar');
    console.log("ServicoUI: Elementos DOM 'cacheados'.");
}

function _vincularEventos() {
    // Adiciona verificação para garantir que os elementos existem antes de adicionar listeners
    if (servicoForm) {
        servicoForm.addEventListener('submit', handlers.onSaveServico);
    } else {
        console.error("ServicoUI: Elemento 'servico-form' não encontrado.");
    }

    if (servicoBtnLimpar) {
        servicoBtnLimpar.addEventListener('click', handlers.onClearServico);
    } else {
        console.error("ServicoUI: Elemento 'servico-btn-limpar' não encontrado.");
    }
    console.log("ServicoUI: Eventos vinculados (se encontrados).");
}

/**
 * Inicializa o módulo UI de Serviços.
 * @param {object} externalHandlers - Handlers vindos do renderer.js
 */
export function inicializar(externalHandlers) {
    handlers = externalHandlers;
    _inicializarDOM();
    _vincularEventos();
}

// --- Funções de Manipulação da UI (exportadas) ---
export function desenharListaServicos(servicos) {
    if (!listaServicos) {
        console.error("ServicoUI: Elemento 'lista-servicos' não encontrado para desenhar.");
        return; 
    }
    listaServicos.innerHTML = '';
    
    if (!servicos || servicos.length === 0) { 
        listaServicos.innerHTML = '<li style="justify-content: center; background-color: var(--color-light-bg);">Nenhum serviço cadastrado.</li>'; 
        return; 
    }
    
    servicos.forEach(servico => {
        const item = document.createElement('li');
        
        // --- 1. Container de Informação (List Item Info) ---
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('list-item-info');
        
        // Nome Principal
        const mainInfo = document.createElement('div');
        mainInfo.classList.add('list-item-main');
        mainInfo.textContent = servico.nome; // Nome como título principal

        // Informações Secundárias (Valor Unitário)
        const secondaryInfo = document.createElement('div');
        secondaryInfo.classList.add('list-item-secondary');
        secondaryInfo.innerHTML = `
            Valor Unitário: <strong>R$ ${servico.valor_unitario.toFixed(2)}</strong>
            <span style="margin-left: 10px;">(ID: ${servico.id})</span>
        `;

        infoContainer.appendChild(mainInfo);
        infoContainer.appendChild(secondaryInfo);

        // --- 2. Container de Ações (Buttons) ---
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('list-item-actions');

        // Botão Editar
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar'; 
        btnEditar.classList.add('btn-secondary', 'btn-action');
        btnEditar.onclick = () => handlers.onEditServico(servico); // Chama handler do renderer

        // Botão Excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir'; 
        btnExcluir.classList.add('btn-delete', 'btn-action');
        btnExcluir.onclick = () => handlers.onDeleteServico(servico.id); // Chama handler do renderer

        actionsContainer.appendChild(btnEditar);
        actionsContainer.appendChild(btnExcluir);
        
        // --- 3. Montagem Final do Item ---
        item.appendChild(infoContainer);
        item.appendChild(actionsContainer);
        listaServicos.appendChild(item);
    });
}