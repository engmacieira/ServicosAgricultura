/*
 * tests/servicoUI.test.js
 * Teste unitário para o módulo de UI de Serviços.
 */

// Caminho de importação corrigido (como você fez)
import { 
    inicializar, 
    coletarDadosServico,
    limparFormularioServico 
} from '../ui_modules/servicoUI.js';

// ... (o seu 'htmlServicos' continua igual) ...
const htmlServicos = `
    <section id="painel-servicos" class="tab-pane">
        <div class="page-layout">
            <div class="coluna-formulario">
                <h2>Cadastro de Serviços</h2>
                <form id="servico-form">
                    <input type="hidden" id="servico-id">
                    <div>
                        <label for="servico-nome">Nome (*):</label>
                        <input type="text" id="servico-nome" required>
                    </div>
                    <div>
                        <label for="servico-valor">Valor Unit. (*):</label>
                        <input type="number" id="servico-valor" step="0.01" min="0" value="0.00" required>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="btn-primary">Salvar Serviço</button>
                        <button type="button" id="servico-btn-limpar" class="btn-secondary">Limpar</button>
                    </div>
                </form>
            </div>
            <div class="coluna-lista">
                <h3>Serviços Cadastrados</h3>
                <ul id="lista-servicos"></ul>
                <div class="pagination-controls" id="servico-pagination">
                    <span id="servico-pagination-info"></span>
                    <button id="servico-btn-anterior"></button>
                    <button id="servico-btn-proximo"></button>
                </div>
            </div>
        </div>
    </section>
`;

describe('Testes para servicoUI.js', () => {

    let mockHandlers;

    beforeEach(() => {
        document.body.innerHTML = htmlServicos;
        mockHandlers = {
            onSaveServico: jest.fn(),
            onClearServico: jest.fn(),
            onEditServico: jest.fn(),
            onDeleteServico: jest.fn(),
            onServicoPaginaAnterior: jest.fn(),
            onServicoPaginaProxima: jest.fn()
        };
        window.alert = jest.fn();
        inicializar(mockHandlers);
    });

    // --- Testes para coletarDadosServico ---

    test('deve coletar dados do formulário de serviço corretamente', () => {
        // ARRANGE
        document.getElementById('servico-nome').value = 'Colheita de Milho';
        document.getElementById('servico-valor').value = '150.50';

        // ACT
        const dados = coletarDadosServico();

        // ASSERT
        const esperado = {
            nome: 'Colheita de Milho',
            valor_unitario: 150.50 // CORRIGIDO: de 'valor' para 'valor_unitario'
        };
        expect(dados).toEqual(esperado);
    });

    test('deve coletar dados corretamente quando o valor for zero', () => {
        // ARRANGE
        document.getElementById('servico-nome').value = 'Serviço Gratuito';
        document.getElementById('servico-valor').value = '0';

        // ACT
        const dados = coletarDadosServico();

        // ASSERT
        // CORRIGIDO: Este teste substitui o antigo 'deve retornar null...'.
        // A lógica de negócio (revelada pelo log) aceita 0.
        const esperado = {
            nome: 'Serviço Gratuito',
            valor_unitario: 0
        };
        expect(dados).toEqual(esperado);
        expect(window.alert).not.toHaveBeenCalled(); // Não deve dar alerta
    });


    test('deve retornar null e alertar se o nome estiver vazio', () => {
        // ARRANGE
        document.getElementById('servico-valor').value = '150.50';
        
        // ACT
        const dados = coletarDadosServico();

        // ASSERT
        expect(dados).toBeNull();
        // CORRIGIDO: A mensagem de alerta foi atualizada para a mensagem real
        expect(window.alert).toHaveBeenCalledWith('Por favor, preencha o Nome e o Valor Unitário (maior ou igual a zero).');
    });

    // --- Teste para limparFormularioServico ---

    test('deve limpar os campos do formulário de serviço', () => {
        // ARRANGE
        document.getElementById('servico-id').value = '10';
        document.getElementById('servico-nome').value = 'Serviço Antigo';
        document.getElementById('servico-valor').value = '100.00';

        // ACT
        limparFormularioServico();

        // ASSERT
        expect(document.getElementById('servico-id').value).toBe('');
        expect(document.getElementById('servico-nome').value).toBe('');
        expect(document.getElementById('servico-valor').value).toBe('0.00'); 
    });

});