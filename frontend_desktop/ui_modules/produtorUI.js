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
    
    if (!produtores || produtores.length === 0) { 
        // Adapta o item vazio para o novo estilo de lista
        listaProdutores.innerHTML = '<li style="justify-content: center; background-color: var(--color-light-bg);">Nenhum produtor cadastrado.</li>'; 
        return; 
    }
    
    produtores.forEach(produtor => {
        const item = document.createElement('li');
        
        // --- 1. Container de Informação (List Item Info) ---
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('list-item-info');
        
        // Nome Principal
        const mainInfo = document.createElement('div');
        mainInfo.classList.add('list-item-main');
        mainInfo.textContent = produtor.nome; // Nome como título principal

        // Informações Secundárias (CPF e Região)
        const secondaryInfo = document.createElement('div');
        secondaryInfo.classList.add('list-item-secondary');
        secondaryInfo.innerHTML = `
            CPF: ${produtor.cpf || 'N/A'} 
            | Região: ${produtor.regiao || 'N/A'}
            | Telefone: ${produtor.telefone || 'N/A'}
            <span style="margin-left: 10px;">(ID: ${produtor.id})</span>
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
        btnEditar.onclick = () => handlers.onEditProdutor(produtor); 

        // Botão Excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir'; 
        btnExcluir.classList.add('btn-delete', 'btn-action');
        btnExcluir.onclick = () => handlers.onDeleteProdutor(produtor.id);

        actionsContainer.appendChild(btnEditar);
        actionsContainer.appendChild(btnExcluir);
        
        // --- 3. Montagem Final do Item ---
        item.appendChild(infoContainer);
        item.appendChild(actionsContainer);
        listaProdutores.appendChild(item);
    });
}