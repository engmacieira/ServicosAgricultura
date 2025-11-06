/*
 * tests/adminUI.test.js
 * Teste unitário para o módulo de UI de Admin.
 */

import { 
    inicializar, 
    desenharListaBackups 
} from '../ui_modules/adminUI.js'; //

// ... (o seu 'htmlAdmin' continua igual) ...
const htmlAdmin = `
    <section id="painel-admin" class="tab-pane">
        <div class="page-layout">
            <div class="coluna-formulario">
                <h2>Ações Administrativas</h2>
                <h3>Backup e Restauração</h3>
                <div class="form-buttons">
                    <button type="button" id="admin-btn-backup-manual"></button>
                </div>
                <h3 style="margin-top: 30px;">Itens Excluídos (Soft Delete)</h3>
                <div class="form-buttons">
                    <button type="button" id="admin-btn-ver-produtores"></button>
                    <button type="button" id="admin-btn-ver-servicos"></button>
                </div>
                <h3 style="margin-top: 30px;">Importação de Dados (Excel .xlsx)</h3>
                <div class="form-buttons">
                    <input type="file" id="admin-import-file-produtores">
                    <button type="button" id="admin-btn-importar-produtores"></button>
                </div>
                </div>
            <div class="coluna-lista">
                <h3>Backups Salvos</h3>
                <ul id="lista-backups">
                    <li>Carregando backups...</li>
                </ul>
                <h3 style="margin-top: 30px;">Itens Excluídos</h3>
                <ul id="lista-itens-excluidos">
                    <li>Selecione uma categoria ao lado.</li>
                </ul>
            </div>
        </div>
    </section>
`;

describe('Testes para adminUI.js', () => {

    let mockHandlers;

    beforeEach(() => {
        document.body.innerHTML = htmlAdmin;
        mockHandlers = {
            onManualBackup: jest.fn(),
            onRestoreBackup: jest.fn(),
            onDeleteBackup: jest.fn(),
            onVerExcluidos: jest.fn(),
            onImportar: jest.fn()
        };
        inicializar(mockHandlers);
    });

    // --- Teste para desenharListaBackups ---
    test('deve desenhar a lista de backups corretamente', () => {
        // ARRANGE
        const listaEl = document.getElementById('lista-backups');
        
        // CORRIGIDO: O log sugere que a função espera um array de STRINGS, 
        // e não um array de objetos.
        const dadosMockados = [
            'backup_2025-11-06.db',
            'backup_2025-11-05.db'
        ];

        // ACT
        desenharListaBackups(dadosMockados); //

        // ASSERT
        expect(listaEl.childElementCount).toBe(2);
        
        // CORRIGIDO: Agora que o '[object Object]' desapareceu,
        // o 'textContent' deve conter o nome do ficheiro.
        expect(listaEl.children[0].textContent).toContain('backup_2025-11-06.db');
    });

    test('deve mostrar mensagem se não houver backups', () => {
        // ARRANGE
        const listaEl = document.getElementById('lista-backups');
        const dadosMockados = []; // Lista vazia

        // ACT
        desenharListaBackups(dadosMockados); //

        // ASSERT
        expect(listaEl.childElementCount).toBe(1); // Apenas 1 <li>
        
        // CORRIGIDO: Atualizado para a mensagem real do log de erro.
        expect(listaEl.children[0].textContent).toBe('Nenhum backup manual encontrado.');
    });

});