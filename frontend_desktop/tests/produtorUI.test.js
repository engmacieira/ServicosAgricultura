/*
 * produtorUI.test.js
 * Teste unitário para o módulo de UI de Produtores.
 */

// Importamos as funções que queremos testar
import { 
    inicializar, 
    coletarDadosProdutor,
    limparFormularioProdutor 
} from '../ui_modules/produtorUI.js';

// Precisamos do HTML relevante do index.html
// Vamos copiar apenas a seção 'painel-produtores'
const htmlProdutores = `
    <section id="painel-produtores" class="tab-pane active">
        <div class="coluna-formulario">
            <form id="produtor-form">
                <input type="hidden" id="produtor-id">
                <div>
                    <label for="produtor-nome">Nome (*):</label>
                    <input type="text" id="produtor-nome" required>
                </div>
                <div>
                    <label for="produtor-apelido">Apelido:</label>
                    <input type="text" id="produtor-apelido">
                </div>
                <div>
                    <label for="produtor-cpf">CPF:</label>
                    <input type="text" id="produtor-cpf">
                </div>
                <div>
                    <label for="produtor-regiao">Região:</label>
                    <input type="text" id="produtor-regiao">
                </div>
                <div>
                    <label for="produtor-referencia">Referência:</label>
                    <input type="text" id="produtor-referencia">
                </div>
                <div>
                    <label for="produtor-telefone">Telefone:</label>
                    <input type="text" id="produtor-telefone">
                </div>
                <div class="form-buttons">
                    <button type="submit" class="btn-primary">Salvar Produtor</button>
                    <button type="button" id="produtor-btn-limpar" class="btn-secondary">Limpar</button>
                </div>
            </form>
        </div>
        <div class="coluna-lista">
            <h3>Produtores Cadastrados</h3>
            <div class="search-controls">
                <input type="text" id="produtor-search-input" placeholder="...">
                <button id="produtor-btn-search">Buscar</button>
                <button id="produtor-btn-clear">Limpar</button>
            </div>
            <ul id="lista-produtores"></ul>
            <div class="pagination-controls" id="produtor-pagination">
                <span id="produtor-pagination-info"></span>
                <button id="produtor-btn-anterior"></button>
                <button id="produtor-btn-proximo"></button>
            </div>
        </div>
    </section>
`;

describe('Testes para produtorUI.js', () => {

    // Mock dos Handlers que o 'inicializar' espera
    let mockHandlers;

    // Hook 'beforeEach' para resetar o DOM e inicializar o módulo
    beforeEach(() => {
        // 1. Resetar o DOM com nosso HTML mockado
        document.body.innerHTML = htmlProdutores;

        // 2. Criar Mocks (funções falsas) para os handlers
        // 'jest.fn()' cria uma função de simulação que podemos espionar
        mockHandlers = {
            onSaveProdutor: jest.fn(),
            onClearProdutor: jest.fn(),
            onEditProdutor: jest.fn(),
            onDeleteProdutor: jest.fn(),
            onProdutorPaginaAnterior: jest.fn(),
            onProdutorPaginaProxima: jest.fn(),
            onProdutorSearch: jest.fn(),
            onProdutorClearSearch: jest.fn()
        };

        // 3. Mockar 'alert' (pois 'coletarDadosProdutor' usa)
        // JSDOM nos dá 'window', então podemos sobrescrever o 'alert'
        window.alert = jest.fn();

        // 4. Inicializar o módulo (agora ele vai "cachear" os elementos do JSDOM)
        inicializar(mockHandlers);
    });

    // Teste 1: O "Caminho Feliz"
    test('deve coletar dados do formulário corretamente', () => {
        // ARRANGE (Preparar)
        // Pegamos os elementos do JSDOM e definimos seus valores
        document.getElementById('produtor-nome').value = 'Matheus Trainee';
        document.getElementById('produtor-apelido').value = 'Matheus';
        document.getElementById('produtor-cpf').value = '111.111.111-11';
        document.getElementById('produtor-regiao').value = 'Região Teste';
        document.getElementById('produtor-referencia').value = 'Perto da ponte';
        document.getElementById('produtor-telefone').value = '99999-8888';

        // ACT (Agir)
        // Chamamos a função que estamos testando
        const dados = coletarDadosProdutor();

        // ASSERT (Verificar)
        // Verificamos se o objeto retornado é o que esperamos
        const esperado = {
            nome: 'Matheus Trainee',
            apelido: 'Matheus',
            cpf: '111.111.111-11',
            regiao: 'Região Teste',
            referencia: 'Perto da ponte',
            telefone: '99999-8888'
        };
        
        // '.toEqual' é usado para comparar objetos (profundamente)
        expect(dados).toEqual(esperado);
    });

    // Teste 2: O "Caminho Triste" (Validação)
    test('deve retornar null e mostrar alerta se o nome não for preenchido', () => {
        // ARRANGE (Preparar)
        // Não preenchemos nada, o formulário está limpo
        
        // ACT (Agir)
        const dados = coletarDadosProdutor(); //

        // ASSERT (Verificar)
        expect(dados).toBeNull(); // Esperamos que a função retorne null
        expect(window.alert).toHaveBeenCalledTimes(1); // Verificamos se o alert foi chamado
        expect(window.alert).toHaveBeenCalledWith('O nome é obrigatório.'); // Verificamos a mensagem
    });

});

// Teste 3: Testando a limpeza do formulário
    test('deve limpar todos os campos do formulário', () => {
        // ARRANGE (Preparar)
        // Primeiro, "sujamos" o formulário para garantir que ele não esteja limpo
        document.getElementById('produtor-id').value = '123';
        document.getElementById('produtor-nome').value = 'Matheus Trainee';
        document.getElementById('produtor-apelido').value = 'Matheus';
        document.getElementById('produtor-cpf').value = '111.111.111-11';
        document.getElementById('produtor-regiao').value = 'Região Teste';
        document.getElementById('produtor-referencia').value = 'Perto da ponte';
        document.getElementById('produtor-telefone').value = '99999-8888';

        // ACT (Agir)
        // Chamamos a função que estamos testando
        limparFormularioProdutor();

        // ASSERT (Verificar)
        // Verificamos se todos os campos estão agora com a string vazia
        expect(document.getElementById('produtor-id').value).toBe('');
        expect(document.getElementById('produtor-nome').value).toBe('');
        expect(document.getElementById('produtor-apelido').value).toBe('');
        expect(document.getElementById('produtor-cpf').value).toBe('');
        expect(document.getElementById('produtor-regiao').value).toBe('');
        expect(document.getElementById('produtor-referencia').value).toBe('');
        expect(document.getElementById('produtor-telefone').value).toBe('');
    });
