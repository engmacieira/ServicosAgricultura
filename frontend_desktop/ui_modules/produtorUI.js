// produtorUI.js - Módulo UI para Produtores

// --- Elementos DOM ---
let produtorForm;
let produtorIdInput;
let produtorNomeInput;
let produtorApelidoInput;
let produtorCpfInput;
let produtorRegiaoInput;
let produtorReferenciaInput;
let produtorTelefoneInput;
let listaProdutores;
let produtorBtnLimpar;
let produtorPaginationInfo;
let produtorBtnAnterior;
let produtorBtnProximo;

// --- Handlers do Controlador ---
let handlers = {};

function _inicializarDOM() {
    produtorForm = document.getElementById('produtor-form');
    produtorIdInput = document.getElementById('produtor-id');
    produtorNomeInput = document.getElementById('produtor-nome');
    produtorApelidoInput = document.getElementById('produtor-apelido');
    produtorCpfInput = document.getElementById('produtor-cpf');
    produtorRegiaoInput = document.getElementById('produtor-regiao');
    produtorReferenciaInput = document.getElementById('produtor-referencia');
    produtorTelefoneInput = document.getElementById('produtor-telefone');
    listaProdutores = document.getElementById('lista-produtores');
    produtorBtnLimpar = document.getElementById('produtor-btn-limpar');
    produtorPaginationInfo = document.getElementById('produtor-pagination-info');
    produtorBtnAnterior = document.getElementById('produtor-btn-anterior');
    produtorBtnProximo = document.getElementById('produtor-btn-proximo');
    console.log("ProdutorUI: Elementos DOM 'cacheados'.");
}

function _vincularEventos() {
    if (!produtorForm || !produtorBtnLimpar) {
         console.error("ProdutorUI: Falha ao vincular eventos - Elementos DOM não encontrados.");
         return; // Impede erros se o DOM não estiver pronto
    }
    produtorForm.addEventListener('submit', handlers.onSaveProdutor);
    produtorBtnLimpar.addEventListener('click', handlers.onClearProdutor);

    // NOVOS EVENTOS DE PAGINAÇÃO
    if (produtorBtnAnterior) {
        produtorBtnAnterior.addEventListener('click', handlers.onProdutorPaginaAnterior);
    }
    if (produtorBtnProximo) {
        produtorBtnProximo.addEventListener('click', handlers.onProdutorPaginaProxima);
    }

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
// CÓDIGO NOVO (Aceita o objeto de paginação)
export function desenharListaProdutores(paginatedData) {
    if (!listaProdutores || !produtorPaginationInfo || !produtorBtnAnterior || !produtorBtnProximo) {
        console.error("ProdutorUI: Elementos da lista ou paginação não encontrados.");
        return;
    }

    // 1. Extrai os dados da resposta da API
    const { produtores, total_pages, current_page } = paginatedData;

    listaProdutores.innerHTML = ''; // Limpa a lista
    
    // 2. Desenha a lista (lógica antiga, movida para cá)
    if (!produtores || produtores.length === 0) { 
        listaProdutores.innerHTML = '<li style="justify-content: center; background-color: var(--color-light-bg);">Nenhum produtor cadastrado.</li>';
    } else {
        produtores.forEach(produtor => {
            const item = document.createElement('li');
            
            const infoContainer = document.createElement('div');
            infoContainer.classList.add('list-item-info');
            
            const mainInfo = document.createElement('div');
            mainInfo.classList.add('list-item-main');
            mainInfo.textContent = produtor.nome; 

            const secondaryInfo = document.createElement('div');
            secondaryInfo.classList.add('list-item-secondary');
            secondaryInfo.innerHTML = `
                Apelido: <strong>${produtor.apelido || 'N/A'}</strong>
                | Região: ${produtor.regiao || 'N/A'}
                | Telefone: ${produtor.telefone || 'N/A'}
                <span style="margin-left: 10px;">(ID: ${produtor.id})</span>
            `;

            infoContainer.appendChild(mainInfo);
            infoContainer.appendChild(secondaryInfo);

            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('list-item-actions');

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar'; 
            btnEditar.classList.add('btn-secondary', 'btn-action');
            btnEditar.onclick = () => handlers.onEditProdutor(produtor); 

            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir'; 
            btnExcluir.classList.add('btn-delete', 'btn-action');
            btnExcluir.onclick = () => handlers.onDeleteProdutor(produtor.id);

            actionsContainer.appendChild(btnEditar);
            actionsContainer.appendChild(btnExcluir);
            
            item.appendChild(infoContainer);
            item.appendChild(actionsContainer);
            listaProdutores.appendChild(item);
        });
    }

    // 3. ATUALIZA OS CONTROLES DE PAGINAÇÃO
    produtorPaginationInfo.textContent = `Página ${current_page} de ${total_pages || 1}`;
    
    // Desabilita botão "Anterior" se estiver na primeira página
    produtorBtnAnterior.disabled = (current_page <= 1);
    
    // Desabilita botão "Próximo" se estiver na última página
    produtorBtnProximo.disabled = (current_page >= total_pages);
}

export function limparFormularioProdutor() {
    if (!produtorForm) return;
    produtorIdInput.value = '';
    produtorNomeInput.value = '';
    produtorApelidoInput.value = '';
    produtorCpfInput.value = '';
    produtorRegiaoInput.value = '';
    produtorReferenciaInput.value = '';
    produtorTelefoneInput.value = '';
    produtorNomeInput.focus();
}

export function preencherFormularioProdutor(produtor) {
    if (!produtorForm) return;
    produtorIdInput.value = produtor.id;
    produtorNomeInput.value = produtor.nome;
    produtorApelidoInput.value = produtor.apelido || '';
    produtorCpfInput.value = produtor.cpf || '';
    produtorRegiaoInput.value = produtor.regiao || '';
    produtorReferenciaInput.value = produtor.referencia || '';
    produtorTelefoneInput.value = produtor.telefone || '';
    produtorNomeInput.focus();
}

export function coletarDadosProdutor() {
    if (!produtorForm) return null;
    if (!produtorNomeInput.value) {
        alert("O nome é obrigatório.");
        return null;
    }
    return {
        nome: produtorNomeInput.value,
        apelido: produtorApelidoInput.value || null,
        cpf: produtorCpfInput.value || null,
        regiao: produtorRegiaoInput.value || null,
        referencia: produtorReferenciaInput.value || null,
        telefone: produtorTelefoneInput.value || null
    };
}

export function getIdProdutor() {
    return produtorIdInput ? produtorIdInput.value || null : null;
}