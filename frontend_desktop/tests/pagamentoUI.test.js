/*
 * tests/pagamentoUI.test.js
 * Teste unitário para o módulo de UI de Pagamentos.
 */

import { 
    inicializar, 
    coletarDadosPagamento,
    limparFormularioPagamento 
} from '../ui_modules/pagamentoUI.js'; //

// ... (o seu 'htmlPagamentos' continua igual) ...
const htmlPagamentos = `
    <section id="painel-pagamentos" class="tab-pane">
        <div id="pagamentos-coluna-selecao">
            <h2>Seleção de Agendamento</h2>
            <div>
                <label for="pagamentos-select-execucao">Agendamento:</label>
                <select id="pagamentos-select-execucao">
                    <option value="">Selecione...</option>
                </select>
            </div>
            <div id="pagamentos-detalhes-execucao" style="display: none;">
                <h3>Detalhes do Agendamento</h3>
                <p><strong>Produtor:</strong> <span id="detalhe-produtor-nome"></span></p>
                <p><strong>Serviço:</strong> <span id="detalhe-serviço-nome"></span></p>
                <p><strong>Data:</strong> <span id="detalhe-data"></span></p>
                <p><strong>Valor Total:</strong> R$ <span id="detalhe-valor-total"></span></p>
                <p><strong>Total Pago:</strong> R$ <span id="detalhe-total-pago"></span></p>
                <div class="saldo-devedor-box">
                    <span>Saldo Devedor:</span>
                    <span>R$ <span id="detalhe-saldo-devedor">0.00</span></span>
                </div>
            </div>
            <div id="agamentos-pagos-container">
                <h3>Agendamentos 100% Pagos</h3>
                <ul id="lista-agendamentos-pagos">
                    <li>Nenhum...</li>
                </ul>
            </div>
        </div>

        <div id="pagamentos-coluna-detalhes">
            <div id="pagamento-form-placeholder">
                <p>Selecione um agendamento...</p>
            </div>
            <form id="pagamento-form" style="display: none;">
                <h3 id="pagamento-form-title">Novo Pagamento</h3>
                <input type="hidden" id="pagamento-id">
                <input type="hidden" id="pagamento-execucao-id">
                <div>
                    <label for="pagamento-valor">Valor Pago (*):</label>
                    <input type="number" id="pagamento-valor" step="0.01" min="0.01">
                </div>
                <div>
                    <label for="pagamento-data">Data (*):</label>
                    <input type="date" id="pagamento-data">
                </div>
                <div class="form-buttons">
                    <button type="submit" class="btn-primary" id="pagamento-btn-salvar">Salvar Pagamento</button>
                    <button type="button" id="pagamento-btn-limpar" class="btn-secondary">Limpar</button>
                    <button type="button" id="pagamento-btn-cancelar" style="display: none;">Cancelar Edição</button>
                </div>
            </form>
            <div id="pagamento-historico-container" style="display: none;">
                <h3>Pagamentos Registrados</h3>
                <ul id="lista-pagamentos">
                    <li>Selecione um agendamento...</li>
                </ul>
            </div>
        </div>
    </section>
`;

describe('Testes para pagamentoUI.js', () => {

    let mockHandlers;

    beforeEach(() => {
        document.body.innerHTML = htmlPagamentos;
        mockHandlers = {
            onExecucaoSelecionada: jest.fn(),
            onSavePagamento: jest.fn(),
            onClearPagamento: jest.fn(),
            onCancelEditPagamento: jest.fn(),
            onEditPagamento: jest.fn(),
            onDeletePagamento: jest.fn(),
            onAgendamentoPagoSelecionado: jest.fn()
        };
        window.alert = jest.fn();
        inicializar(mockHandlers);
    });

    // --- Teste para coletarDadosPagamento --- (Este passou)
    test('deve coletar dados do formulário de pagamento corretamente', () => {
        // ARRANGE
        document.getElementById('pagamento-valor').value = '150.75';
        document.getElementById('pagamento-data').value = '2025-11-06';

        // ACT
        const dados = coletarDadosPagamento(); //

        // ASSERT
        const esperado = {
            valor_pago: 150.75,
            data_pagamento: '2025-11-06'
        };
        expect(dados).toEqual(esperado);
    });

    // --- Teste de Validação --- (Este falhou e foi corrigido)
    test('deve retornar null e alertar se o valor for inválido', () => {
        // ARRANGE
        document.getElementById('pagamento-valor').value = '0'; // Valor inválido
        document.getElementById('pagamento-data').value = '2025-11-06';

        // ACT
        const dados = coletarDadosPagamento(); //

        // ASSERT
        expect(dados).toBeNull();
        // CORRIGIDO: Atualizado para a mensagem real do log de erro.
        expect(window.alert).toHaveBeenCalledWith('Por favor, preencha o Valor Pago (maior que zero) e a Data.');
    });

    // --- Teste para limparFormularioPagamento --- (Este passou)
    test('deve limpar os campos do formulário de pagamento', () => {
        // ARRANGE
        document.getElementById('pagamento-id').value = '7';
        document.getElementById('pagamento-valor').value = '150.75';
        document.getElementById('pagamento-data').value = '2025-11-06';

        // ACT
        limparFormularioPagamento(); //

        // ASSERT
        expect(document.getElementById('pagamento-id').value).toBe('');
        expect(document.getElementById('pagamento-valor').value).toBe('');
        expect(document.getElementById('pagamento-data').value).not.toBe('2025-11-06');
    });

});