/*
 * tests/tabsUI.test.js
 * Teste unitário para o módulo de UI de Tabs (Navegação).
 */

import { 
    inicializar, 
    trocarAba 
} from '../ui_modules/tabsUI.js'; //

// ... (o seu 'htmlTabs' continua igual) ...
const htmlTabs = `
    <nav class="tab-nav" role="tablist">
        <button class="tab-button active" id="tab-produtores" data-tab="painel-produtores">
            Produtores
        </button>
        <button class="tab-button" id="tab-servicos" data-tab="painel-servicos">
            Serviços
        </button>
        <button class="tab-button" id="tab-admin" data-tab="painel-admin">
            Admin
        </button>
    </nav>

    <main class="tab-content">
        <section id="painel-produtores" class="tab-pane active" role="tabpanel">
            Conteúdo Produtores
        </section>
        <section id="painel-servicos" class="tab-pane" role="tabpanel">
            Conteúdo Serviços
        </section>
        <section id="painel-admin" class="tab-pane" role="tabpanel">
            Conteúdo Admin
        </section>
    </main>
`;

describe('Testes para tabsUI.js', () => {

    let mockOnTabChange;

    beforeEach(() => {
        document.body.innerHTML = htmlTabs;
        mockOnTabChange = jest.fn(); 
        inicializar(mockOnTabChange);
    });

    // --- Teste para a função trocarAba ---
    test('deve trocar a aba ativa corretamente', () => {
        // ARRANGE
        const botaoProdutor = document.getElementById('tab-produtores');
        const painelProdutor = document.getElementById('painel-produtores');
        
        // CORRIGIDO: Precisamos do elemento do botão para o 'ACT'
        const botaoServicos = document.getElementById('tab-servicos'); 
        const painelServicos = document.getElementById('painel-servicos');

        // Verificação inicial
        expect(botaoProdutor.classList.contains('active')).toBe(true);
        expect(painelProdutor.classList.contains('active')).toBe(true);
        expect(botaoServicos.classList.contains('active')).toBe(false);
        expect(painelServicos.classList.contains('active')).toBe(false);

        // ACT
        // CORRIGIDO: Passamos o ELEMENTO do botão, não a string do painel.
        trocarAba(botaoServicos); //

        // ASSERT
        // Verificamos se a classe 'active' foi removida do produtor
        expect(botaoProdutor.classList.contains('active')).toBe(false);
        expect(painelProdutor.classList.contains('active')).toBe(false);
        
        // Verificamos se a classe 'active' foi adicionada a serviços
        expect(botaoServicos.classList.contains('active')).toBe(true);
        expect(painelServicos.classList.contains('active')).toBe(true);
    });

    // (Este teste provavelmente já estava a passar)
    test('deve chamar o handler onTabChange ao inicializar e clicar', () => {
        // ARRANGE
        const botaoAdmin = document.getElementById('tab-admin');
        
        // ACT
        botaoAdmin.click(); // Simulamos o clique

        // ASSERT
        expect(mockOnTabChange).toHaveBeenCalledTimes(1);
        expect(mockOnTabChange).toHaveBeenCalledWith('painel-admin');
    });

});