/*
 * tests/agendamentoUI.test.js
 * Teste unitário para o módulo de UI de Agendamento.
 */

import { 
    inicializar, 
    coletarDadosAgendamento,
    limparFormularioAgendamento 
} from '../ui_modules/agendamentoUI.js'; //

// ... (o seu 'htmlAgendamento' continua igual) ...
const htmlAgendamento = `
    <section id="painel-agendamento" class="tab-pane">
        <div class="page-layout">
            <div class="coluna-formulario">
                <h2>Registro de Execução de Serviço</h2>
                <form id="agendamento-form">
                    <input type="hidden" id="agendamento-id">
                    <div>
                        <label for="agendamento-produtor">Produtor (*):</label>
                        <select id="agendamento-produtor" required>
                            <option value="">Selecione</option>
                            <option value="1">Produtor Teste 1</option>
                        </select>
                    </div>
                    <div>
                        <label for="agendamento-servico">Serviço (*):</label>
                        <select id="agendamento-servico" required>
                            <option value="">Selecione</option>
                            <option value="10">Serviço Teste 10</option>
                        </select>
                    </div>
                    <div>
                        <label for="agendamento-data">Data (*):</label>
                        <input type="date" id="agendamento-data" required>
                    </div>
                    <div class="form-row-aligned">
                        <label id="label-horas-prestadas">Horas Prestadas (*):</label>
                        <div class="form-group-inline">
                            <input type="number" id="agendamento-horas-h" min="0" value="0">
                            <label for="agendamento-horas-h">H</label>
                            <input type="number" id="agendamento-horas-m" min="0" max="59" value="0">
                            <label for="agendamento-horas-m">Min</label>
                        </div>
                    </div>
                    <div>
                        <label for="agendamento-valor">Valor Total (R$):</label>
                        <input type="number" id="agendamento-valor" step="0.01" min="0" value="0.00">
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="btn-primary">Salvar Agendamento</button>
                        <button type="button" id="agendamento-btn-limpar" class="btn-secondary">Limpar</button>
                    </div>
                </form>
            </div>
        </div>
    </section>
`;


describe('Testes para agendamentoUI.js', () => {

    let mockHandlers;

    beforeEach(() => {
        document.body.innerHTML = htmlAgendamento;
        mockHandlers = {
            onSaveExecucao: jest.fn(),
            onClearAgendamento: jest.fn()
        };
        window.alert = jest.fn();
        inicializar(mockHandlers);
    });

    // --- Testes para coletarDadosAgendamento ---

    test('deve coletar dados do formulário de agendamento corretamente', () => {
        // ARRANGE
        document.getElementById('agendamento-produtor').value = '1';
        document.getElementById('agendamento-servico').value = '10';
        document.getElementById('agendamento-data').value = '2025-10-31';
        document.getElementById('agendamento-horas-h').value = '2';
        document.getElementById('agendamento-horas-m').value = '30';
        document.getElementById('agendamento-valor').value = '250.75';

        // ACT
        const dados = coletarDadosAgendamento(); //

        // ASSERT
        const esperado = {
            produtor_id: 1,
            servico_id: 10,
            data_execucao: '2025-10-31',
            horas_prestadas: 2.5, // CORRIGIDO: de 150 para 2.5 (horas decimais)
            valor_total: 250.75
        };
        expect(dados).toEqual(esperado);
    });

    test('deve retornar null e alertar se produtor não for selecionado', () => {
        // ARRANGE
        document.getElementById('agendamento-servico').value = '10';
        document.getElementById('agendamento-data').value = '2025-10-31';

        // ACT
        const dados = coletarDadosAgendamento(); //

        // ASSERT
        expect(dados).toBeNull();
        // CORRIGIDO: Atualiza para a mensagem de alerta real
        expect(window.alert).toHaveBeenCalledWith('Por favor, selecione Produtor, Serviço e Data.');
    });

    // --- Teste para limparFormularioAgendamento ---
    // (Este teste já estava correto e passou, por isso não está no log de falhas)

    test('deve limpar os campos do formulário de agendamento', () => {
        // ARRANGE
        document.getElementById('agendamento-id').value = '5';
        document.getElementById('agendamento-produtor').value = '1';
        document.getElementById('agendamento-servico').value = '10';
        document.getElementById('agendamento-data').value = '2025-10-31';
        document.getElementById('agendamento-horas-h').value = '2';
        document.getElementById('agendamento-horas-m').value = '30';
        document.getElementById('agendamento-valor').value = '250.75';

        // ACT
        limparFormularioAgendamento(); //

        // ASSERT
        expect(document.getElementById('agendamento-id').value).toBe('');
        expect(document.getElementById('agendamento-produtor').value).toBe('');
        expect(document.getElementById('agendamento-servico').value).toBe('');
        expect(document.getElementById('agendamento-data').value).not.toBe('2025-10-31');
        expect(document.getElementById('agendamento-horas-h').value).toBe('0');
        expect(document.getElementById('agendamento-horas-m').value).toBe('0');
        expect(document.getElementById('agendamento-valor').value).toBe('0.00');
    });

});