// produtorUI.js - Módulo UI para Produtores

// --- Elementos DOM ---
let produtorForm;
let produtorIdInput;
let produtorNomeInput;
let produtorCpfInput;
let produtorRegiaoInput;
let produtorReferenciaInput;
let produtorTelefoneInput;
let listaProdutores;
let produtorBtnLimpar;

// --- Handlers do Controlador ---
let handlers = {};

function _inicializarDOM() {
    produtorForm = document.getElementById('produtor-form');
    produtorIdInput = document.getElementById('produtor-id');
    produtorNomeInput = document.getElementById('produtor-nome');
    produtorCpfInput = document.getElementById('produtor-cpf');
    produtorRegiaoInput = document.getElementById('produtor-regiao');
    produtorReferenciaInput = document.getElementById('produtor-referencia');
    produtorTelefoneInput = document.getElementById('produtor-telefone');
    listaProdutores = document.getElementById('lista-produtores');
    produtorBtnLimpar = document.getElementById('produtor-btn-limpar');
    console.log("ProdutorUI: Elementos DOM 'cacheados'.");
}

function _vincularEventos() {
    if (!produtorForm || !produtorBtnLimpar) {
         console.error("ProdutorUI: Falha ao vincular eventos - Elementos DOM não encontrados.");
         return; // Impede erros se o DOM não estiver pronto
    }
    produtorForm.addEventListener('submit', handlers.onSaveProdutor);
    produtorBtnLimpar.addEventListener('click', handlers.onClearProdutor);
    console.log("ProdutorUI: Eventos vinculados.");
}

/**
 * Inicializa o módulo UI de Produtores.
 * @param {object} externalHandlers - Handlers vindos do renderer.js
 */
export function inicializar(externalHandlers) {
    handlers = externalHandlers; // Armazena os handlers
    _inicializarDOM();
    _vincularEventos();
}

// --- Funções de Manipulação da UI (exportadas) ---
export function desenharListaProdutores(produtores) {
    if (!listaProdutores) return; // Proteção
    listaProdutores.innerHTML = '';
    if (!produtores || produtores.length === 0) { listaProdutores.innerHTML = '<li>Nenhum produtor cadastrado.</li>'; return; }
    produtores.forEach(produtor => {
        const item = document.createElement('li');
        item.textContent = `[${produtor.id}] ${produtor.nome} (Região: ${produtor.regiao || 'N/A'})`;
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar'; btnEditar.style.marginLeft = '10px';
        // Usa o handler passado pelo renderer
        btnEditar.onclick = () => handlers.onEditProdutor(produtor);
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir'; btnExcluir.style.marginLeft = '5px';
        // Usa o handler passado pelo renderer
        btnExcluir.onclick = () => handlers.onDeleteProdutor(produtor.id);
        item.appendChild(btnEditar); item.appendChild(btnExcluir);
        listaProdutores.appendChild(item);
    });
}
export function limparFormularioProdutor() {
    if (!produtorForm) return;
    produtorIdInput.value = ''; produtorNomeInput.value = ''; produtorCpfInput.value = '';
    produtorRegiaoInput.value = ''; produtorReferenciaInput.value = ''; produtorTelefoneInput.value = '';
    produtorNomeInput.focus();
}
export function preencherFormularioProdutor(produtor) {
     if (!produtorForm) return;
    produtorIdInput.value = produtor.id; produtorNomeInput.value = produtor.nome;
    produtorCpfInput.value = produtor.cpf; produtorRegiaoInput.value = produtor.regiao;
    produtorReferenciaInput.value = produtor.referencia; produtorTelefoneInput.value = produtor.telefone;
    produtorNomeInput.focus();
}
export function coletarDadosProdutor() {
     if (!produtorForm) return null;
    return {
        nome: produtorNomeInput.value, cpf: produtorCpfInput.value || null,
        regiao: produtorRegiaoInput.value || null, referencia: produtorReferenciaInput.value || null,
        telefone: produtorTelefoneInput.value || null
    };
}
export function getIdProdutor() {
    return produtorIdInput ? produtorIdInput.value || null : null;
}