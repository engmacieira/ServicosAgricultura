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
        return; // Proteção
    }
    listaServicos.innerHTML = '';
    if (!servicos || servicos.length === 0) { listaServicos.innerHTML = '<li>Nenhum serviço cadastrado.</li>'; return; }
    servicos.forEach(servico => {
        const item = document.createElement('li');
        item.textContent = `[${servico.id}] ${servico.nome} (R$ ${servico.valor_unitario.toFixed(2)})`;
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar'; btnEditar.style.marginLeft = '10px';
        btnEditar.onclick = () => handlers.onEditServico(servico); // Chama handler do renderer
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir'; btnExcluir.style.marginLeft = '5px';
        btnExcluir.onclick = () => handlers.onDeleteServico(servico.id); // Chama handler do renderer
        item.appendChild(btnEditar); item.appendChild(btnExcluir);
        listaServicos.appendChild(item);
    });
}
export function limparFormularioServico() {
    if (!servicoForm) return;
    servicoIdInput.value = ''; servicoNomeInput.value = ''; servicoValorInput.value = '';
    servicoNomeInput.focus();
}
export function preencherFormularioServico(servico) {
    if (!servicoForm) return;
    servicoIdInput.value = servico.id; servicoNomeInput.value = servico.nome;
    servicoValorInput.value = servico.valor_unitario;
    servicoNomeInput.focus();
}
export function coletarDadosServico() {
    if (!servicoForm) return null;
    return {
        nome: servicoNomeInput.value,
        valor_unitario: parseFloat(servicoValorInput.value) || 0.0
    };
}
export function getIdServico() {
    return servicoIdInput ? servicoIdInput.value || null : null;
}