/*
 * tests/relatorioUI.test.js
 * Teste unitário para o módulo de UI de Relatórios.
 */

import { 
    inicializar, 
    desenharRelatorioDividas 
} from '../ui_modules/relatorioUI.js'; //

// ... (o seu 'htmlRelatorios' continua igual) ...
const htmlRelatorios = `
    <section id="painel-relatorios" class="tab-pane">
        <h2>Relatório de Dívidas por Produtor</h2>
        <div id="relatorio-header">
            <label for="relatorio-select-produtor">Selecione o Produtor:</label>
            <select id="relatorio-select-produtor">
                <option value="">Carregando...</option>
            </select>
        </div>
        <div id="relatorio-container">
            <h3>Dívidas Pendentes</h3>
            <ul id="lista-relatorio-dividas">
                <li>Selecione um produtor acima.</li>
            </ul>
        </div>
    </section>
`;

describe('Testes para relatorioUI.js', () => {

    let mockHandlers;

    beforeEach(() => {
        document.body.innerHTML = htmlRelatorios;
        mockHandlers = {
            onRelatorioProdutorSelecionado: jest.fn()
        };
        inicializar(mockHandlers);
    });

    // --- Teste para desenharRelatorioDividas ---
    test('deve desenhar a lista de dívidas corretamente', () => {
        // ARRANGE
        const listaEl = document.getElementById('lista-relatorio-dividas');
        
        // CORRIGIDO: Fornecemos os dados mockados completos que a função espera.
        const dadosMockados = [
            { 
                servico_nome: 'Colheita', 
                data_execucao: '31/10/2025', 
                valor_total: 200.50, 
                total_pago: 50.00,
                saldo_devedor: 150.50 
            },
            { 
                servico_nome: 'Plantio', 
                data_execucao: '30/10/2025', 
                valor_total: 100.00,
                total_pago: 50.00,
                saldo_devedor: 50.00 
            }
        ];

        // ACT
        desenharRelatorioDividas(dadosMockados); //

        // ASSERT
        expect(listaEl.childElementCount).toBe(2);
        // O log não mostrou falha aqui, então esta asserção estava correta.
        expect(listaEl.children[0].textContent).toContain('Colheita');
        expect(listaEl.children[0].textContent).toContain('150.50');
    });

    test('deve mostrar mensagem se não houver dívidas', () => {
        // ARRANGE
        const listaEl = document.getElementById('lista-relatorio-dividas');
        const dadosMockados = []; // Lista vazia

        // ACT
        desenharRelatorioDividas(dadosMockados); //

        // ASSERT
        expect(listaEl.childElementCount).toBe(1); // Apenas 1 <li>
        
        // CORRIGIDO: Atualizado para a mensagem real do log de erro.
        expect(listaEl.children[0].textContent).toBe('Nenhuma dívida encontrada para este produtor.');
    });

});