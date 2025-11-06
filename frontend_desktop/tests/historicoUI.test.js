/*
 * tests/historicoUI.test.js
 * Teste unitário para o módulo de UI de Histórico.
 */

import { 
    inicializar, 
    getHistoricoSearchTerm,
    clearHistoricoSearchTerm 
} from '../ui_modules/historicoUI.js'; //

// HTML relevante do index.html (painel-historico)
const htmlHistorico = `
    <section id="painel-historico" class="tab-pane">
        <h2>Histórico de Execuções</h2>
        <div class="search-controls">
            <input type="text" id="historico-search-input" placeholder="...">
            <button id="historico-btn-search" class="btn-secondary">Buscar</button>
            <button id="historico-btn-clear" class="btn-secondary">Limpar</button>
        </div>
        <ul id="lista-historico">
            <li>Carregando histórico...</li>
        </ul>
        <div class="pagination-controls" id="historico-pagination">
            <span class="pagination-info" id="historico-pagination-info"></span>
            <div class="pagination-buttons">
                <button id="historico-btn-anterior"></button>
                <button id="historico-btn-proximo"></button>
            </div>
        </div>
    </section>
`;

describe('Testes para historicoUI.js', () => {

    let mockHandlers;

    beforeEach(() => {
        // 1. Configurar o DOM
        document.body.innerHTML = htmlHistorico;

        // 2. Mockar handlers (baseado no ui.js)
        mockHandlers = {
            onEditExecucao: jest.fn(),
            onDeleteExecucao: jest.fn(),
            onHistoricoPaginaAnterior: jest.fn(),
            onHistoricoPaginaProxima: jest.fn(),
            onHistoricoSearch: jest.fn(),
            onHistoricoClearSearch: jest.fn()
        };

        // 3. Inicializar o módulo
        inicializar(mockHandlers);
    });

    // --- Teste para getHistoricoSearchTerm ---
    test('deve retornar o termo de busca corretamente', () => {
        // ARRANGE
        const searchInput = document.getElementById('historico-search-input');
        searchInput.value = 'Produtor Teste';

        // ACT
        const termo = getHistoricoSearchTerm(); //

        // ASSERT
        expect(termo).toBe('Produtor Teste');
    });

    // --- Teste para clearHistoricoSearchTerm ---
    test('deve limpar o campo de busca', () => {
        // ARRANGE
        const searchInput = document.getElementById('historico-search-input');
        searchInput.value = 'Termo Antigo';

        // ACT
        clearHistoricoSearchTerm(); //

        // ASSERT
        // Verificamos o valor diretamente no DOM
        expect(document.getElementById('historico-search-input').value).toBe('');
    });

});