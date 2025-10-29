// ui.js (Nosso Módulo de "View" refatorado)

// Mark Construtor: Primeiro, "puxamos" (cache) TODOS os elementos
// da UI com os quais vamos interagir. Isso é mais rápido.

// --- Elementos das Abas ---
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

// --- Elementos do Painel Produtores ---
const produtorForm = document.getElementById('produtor-form');
const produtorIdInput = document.getElementById('produtor-id');
const produtorNomeInput = document.getElementById('produtor-nome');
const produtorCpfInput = document.getElementById('produtor-cpf');
const produtorRegiaoInput = document.getElementById('produtor-regiao');
const produtorReferenciaInput = document.getElementById('produtor-referencia');
const produtorTelefoneInput = document.getElementById('produtor-telefone');
const listaProdutores = document.getElementById('lista-produtores');

// --- Elementos do Painel Serviços ---
const servicoForm = document.getElementById('servico-form');
const servicoIdInput = document.getElementById('servico-id');
const servicoNomeInput = document.getElementById('servico-nome');
const servicoValorInput = document.getElementById('servico-valor');
const listaServicos = document.getElementById('lista-servicos');


// ======================================================
// 1. LÓGICA DE GERENCIAMENTO DAS ABAS
// ======================================================

/**
 * Inicializa a lógica de clique nas abas.
 * @param {function(string)} onTabChangeCallback - Função "callback" a ser chamada
 * quando uma aba é trocada. Ela envia o ID do painel (ex: 'painel-produtores').
 */
export function inicializarAbas(onTabChangeCallback) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Pega o ID do painel-alvo (ex: "painel-produtores")
            const targetPaneId = button.dataset.tab;
            
            // 1. Atualiza os botões
            tabButtons.forEach(btn => {
                btn.classList.toggle('active', btn === button);
            });
            
            // 2. Atualiza os painéis
            tabPanes.forEach(pane => {
                pane.classList.toggle('active', pane.id === targetPaneId);
            });
            
            // 3. (Opcional) Avisa o "Controlador" (renderer.js) que a aba mudou
            if (onTabChangeCallback) {
                onTabChangeCallback(targetPaneId);
            }
        });
    });
}


// ======================================================
// 2. FUNÇÕES DE UI - PRODUTORES
// (Refatoradas com os novos IDs)
// ======================================================

/**
 * Desenha a lista de produtores na tela (na <ul>).
 */
export function desenharListaProdutores(produtores, onEditClick, onDeleteClick) {
    listaProdutores.innerHTML = '';
    
    if (!produtores || produtores.length === 0) {
        listaProdutores.innerHTML = '<li>Nenhum produtor cadastrado.</li>';
        return;
    }

    produtores.forEach(produtor => {
        const item = document.createElement('li');
        item.textContent = `[${produtor.id}] ${produtor.nome} (Região: ${produtor.regiao || 'N/A'})`;
        
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.style.marginLeft = '10px';
        btnEditar.onclick = () => onEditClick(produtor);
        
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.style.marginLeft = '5px';
        btnExcluir.onclick = () => onDeleteClick(produtor.id);
        
        item.appendChild(btnEditar);
        item.appendChild(btnExcluir);
        listaProdutores.appendChild(item);
    });
}

/** Limpa o formulário de Produtores. */
export function limparFormularioProdutor() {
    produtorIdInput.value = '';
    produtorNomeInput.value = '';
    produtorCpfInput.value = '';
    produtorRegiaoInput.value = '';
    produtorReferenciaInput.value = '';
    produtorTelefoneInput.value = '';
    produtorNomeInput.focus();
}

/** Preenche o formulário de Produtores para edição. */
export function preencherFormularioProdutor(produtor) {
    produtorIdInput.value = produtor.id;
    produtorNomeInput.value = produtor.nome;
    produtorCpfInput.value = produtor.cpf;
    produtorRegiaoInput.value = produtor.regiao;
    produtorReferenciaInput.value = produtor.referencia;
    produtorTelefoneInput.value = produtor.telefone;
    produtorNomeInput.focus();
}

/** Lê os dados do formulário de Produtores e retorna um objeto. */
export function coletarDadosProdutor() {
    return {
        nome: produtorNomeInput.value,
        cpf: produtorCpfInput.value || null,
        regiao: produtorRegiaoInput.value || null,
        referencia: produtorReferenciaInput.value || null,
        telefone: produtorTelefoneInput.value || null
    };
}

/** Retorna o ID do formulário de Produtores. */
export function getIdProdutor() {
    return produtorIdInput.value || null;
}


// ======================================================
// 3. FUNÇÕES DE UI - SERVIÇOS (NOVAS)
// (Seguindo o mesmo padrão dos Produtores)
// ======================================================

/**
 * Desenha a lista de serviços na tela (na <ul>).
 */
export function desenharListaServicos(servicos, onEditClick, onDeleteClick) {
    listaServicos.innerHTML = '';
    
    if (!servicos || servicos.length === 0) {
        listaServicos.innerHTML = '<li>Nenhum serviço cadastrado.</li>';
        return;
    }

    servicos.forEach(servico => {
        const item = document.createElement('li');
        item.textContent = `[${servico.id}] ${servico.nome} (R$ ${servico.valor_unitario.toFixed(2)})`;
        
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.style.marginLeft = '10px';
        btnEditar.onclick = () => onEditClick(servico);
        
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.style.marginLeft = '5px';
        btnExcluir.onclick = () => onDeleteClick(servico.id);
        
        item.appendChild(btnEditar);
        item.appendChild(btnExcluir);
        listaServicos.appendChild(item);
    });
}

/** Limpa o formulário de Serviços. */
export function limparFormularioServico() {
    servicoIdInput.value = '';
    servicoNomeInput.value = '';
    servicoValorInput.value = '';
    servicoNomeInput.focus();
}

/** Preenche o formulário de Serviços para edição. */
export function preencherFormularioServico(servico) {
    servicoIdInput.value = servico.id;
    servicoNomeInput.value = servico.nome;
    servicoValorInput.value = servico.valor_unitario;
    servicoNomeInput.focus();
}

/** Lê os dados do formulário de Serviços e retorna um objeto. */
export function coletarDadosServico() {
    return {
        nome: servicoNomeInput.value,
        valor_unitario: parseFloat(servicoValorInput.value) || 0.0
    };
}

/** Retorna o ID do formulário de Serviços. */
export function getIdServico() {
    return servicoIdInput.value || null;
}