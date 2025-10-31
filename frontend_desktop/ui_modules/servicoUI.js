// servicoUI.js - Módulo UI para Serviços

// --- Elementos DOM ---
let servicoForm;
let servicoIdInput;
let servicoNomeInput;
let servicoValorInput;
let listaServicos;
let servicoBtnLimpar;
let servicoPaginationInfo;
let servicoBtnAnterior;
let servicoBtnProximo;

// --- Handlers do Controlador ---
let handlers = {};

function _inicializarDOM() {
    servicoForm = document.getElementById('servico-form');
    servicoIdInput = document.getElementById('servico-id');
    servicoNomeInput = document.getElementById('servico-nome');
    servicoValorInput = document.getElementById('servico-valor');
    listaServicos = document.getElementById('lista-servicos');
    servicoBtnLimpar = document.getElementById('servico-btn-limpar');
    servicoPaginationInfo = document.getElementById('servico-pagination-info');
    servicoBtnAnterior = document.getElementById('servico-btn-anterior');
    servicoBtnProximo = document.getElementById('servico-btn-proximo');
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
    // NOVOS EVENTOS DE PAGINAÇÃO
    if (servicoBtnAnterior) {
        servicoBtnAnterior.addEventListener('click', handlers.onServicoPaginaAnterior);
    }
    if (servicoBtnProximo) {
        servicoBtnProximo.addEventListener('click', handlers.onServicoPaginaProxima);
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
// CÓDIGO NOVO (Aceita o objeto de paginação)
export function desenharListaServicos(paginatedData) {
    if (!listaServicos || !servicoPaginationInfo || !servicoBtnAnterior || !servicoBtnProximo) {
        console.error("ServicoUI: Elementos da lista ou paginação não encontrados para desenhar.");
        return; 
    }

    // 1. Extrai os dados
    const { servicos, total_pages, current_page } = paginatedData;

    listaServicos.innerHTML = ''; // Limpa a lista
    
    // 2. Desenha a lista
    if (!servicos || servicos.length === 0) { 
        listaServicos.innerHTML = '<li style="justify-content: center; background-color: var(--color-light-bg);">Nenhum serviço cadastrado.</li>'; 
    } else {
        servicos.forEach(servico => {
            const item = document.createElement('li');
            
            // ... (Toda a lógica de criar 'infoContainer', 'actionsContainer', 'btnEditar', 'btnExcluir'...)
            // ... (É A MESMA LÓGICA DE ANTES, APENAS COPIE E COLE)
            const infoContainer = document.createElement('div');
            infoContainer.classList.add('list-item-info');
            
            const mainInfo = document.createElement('div');
            mainInfo.classList.add('list-item-main');
            mainInfo.textContent = servico.nome; 

            const secondaryInfo = document.createElement('div');
            secondaryInfo.classList.add('list-item-secondary');
            secondaryInfo.innerHTML = `
                Valor Unitário: <strong>R$ ${servico.valor_unitario.toFixed(2)}</strong>
                <span style="margin-left: 10px;">(ID: ${servico.id})</span>
            `;

            infoContainer.appendChild(mainInfo);
            infoContainer.appendChild(secondaryInfo);

            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('list-item-actions');

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar'; 
            btnEditar.classList.add('btn-secondary', 'btn-action');
            btnEditar.onclick = () => handlers.onEditServico(servico); 

            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir'; 
            btnExcluir.classList.add('btn-delete', 'btn-action');
            btnExcluir.onclick = () => handlers.onDeleteServico(servico.id); 

            actionsContainer.appendChild(btnEditar);
            actionsContainer.appendChild(btnExcluir);
            
            item.appendChild(infoContainer);
            item.appendChild(actionsContainer);
            // ... (Fim da lógica de criação do item)

            listaServicos.appendChild(item);
        });
    }

    // 3. ATUALIZA OS CONTROLES DE PAGINAÇÃO
    servicoPaginationInfo.textContent = `Página ${current_page} de ${total_pages || 1}`;
    servicoBtnAnterior.disabled = (current_page <= 1);
    servicoBtnProximo.disabled = (current_page >= total_pages);
}

export function limparFormularioServico() {
    if (!servicoForm) return;
    servicoIdInput.value = '';
    servicoNomeInput.value = '';
    servicoValorInput.value = '0.00';
    servicoNomeInput.focus();
}

export function preencherFormularioServico(servico) {
    if (!servicoForm) return;
    servicoIdInput.value = servico.id;
    servicoNomeInput.value = servico.nome;
    servicoValorInput.value = servico.valor_unitario;
    servicoNomeInput.focus();
}

export function coletarDadosServico() {
    if (!servicoForm) return null;
    const nome = servicoNomeInput.value;
    const valorUnitario = parseFloat(servicoValorInput.value);
    
    if (!nome || isNaN(valorUnitario) || valorUnitario < 0) {
        alert("Por favor, preencha o Nome e o Valor Unitário (maior ou igual a zero).");
        return null;
    }

    return {
        nome: nome,
        valor_unitario: valorUnitario
    };
}

export function getIdServico() {
    return servicoIdInput ? servicoIdInput.value || null : null;
}