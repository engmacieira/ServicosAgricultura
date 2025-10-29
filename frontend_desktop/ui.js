// ui.js (Módulo Principal da UI - Orquestrador) - CORREÇÃO FINAL

// Importa os módulos específicos de cada seção da UI
import * as tabsUI from './ui_modules/tabsUI.js';
import * as produtorUI from './ui_modules/produtorUI.js';
import * as servicoUI from './ui_modules/servicoUI.js';
import * as agendamentoUI from './ui_modules/agendamentoUI.js';
import * as historicoUI from './ui_modules/historicoUI.js';
import * as pagamentoUI from './ui_modules/pagamentoUI.js';
import * as relatorioUI from './ui_modules/relatorioUI.js';

/**
 * PONTO DE ENTRADA PRINCIPAL DA UI
 * Chamado pelo renderer.js. Esta função é responsável por ESPERAR o DOM.
 * @param {object} handlers - Objeto contendo todos os handlers do renderer.js
 */
export function inicializarApp(handlers) {
    console.log("UI Principal: Aguardando DOM Ready...");

    // Mark Construtor: CORREÇÃO CENTRAL: Envolvemos TUDO com o listener.
    document.addEventListener('DOMContentLoaded', () => {
        console.log("UI Principal: DOM Carregado. Iniciando módulos...");

        // 1. Inicializa o módulo de Tabs, passando o handler de mudança de aba
        tabsUI.inicializar(handlers.onTabChange);

        // 2. Inicializa o módulo de Produtores
        produtorUI.inicializar({
            onSaveProdutor: handlers.onSaveProdutor,
            onClearProdutor: handlers.onClearProdutor,
            onEditProdutor: handlers.onEditProdutor,
            onDeleteProdutor: handlers.onDeleteProdutor
        });

        // 3. Inicializa o módulo de Serviços
        servicoUI.inicializar({
            onSaveServico: handlers.onSaveServico,
            onClearServico: handlers.onClearServico,
            onEditServico: handlers.onEditServico,
            onDeleteServico: handlers.onDeleteServico
        });

        // 4. Inicializa o módulo de Agendamento
        agendamentoUI.inicializar({
            onSaveExecucao: handlers.onSaveExecucao,
            onClearAgendamento: handlers.onClearAgendamento
        });

        // 5. Inicializa o módulo de Histórico
        historicoUI.inicializar({
            onEditExecucao: handlers.onEditExecucao,
            onDeleteExecucao: handlers.onDeleteExecucao
        });

        // 6. Inicializa o módulo de Pagamentos
        pagamentoUI.inicializar({
            onExecucaoSelecionada: handlers.onExecucaoSelecionada,
            onSavePagamento: handlers.onSavePagamento,
            onClearPagamento: handlers.onClearPagamento,
            onCancelEditPagamento: handlers.onCancelEditPagamento,
            onEditPagamento: handlers.onEditPagamento,
            onDeletePagamento: handlers.onDeletePagamento
        });

        // 7. Inicializa o módulo de Relatórios
        relatorioUI.inicializar({
            onRelatorioProdutorSelecionado: handlers.onRelatorioProdutorSelecionado
        });
        
        // 8. Dispara o carregamento inicial da primeira aba
        handlers.onTabChange('painel-produtores');


        console.log("UI Principal: Todos os módulos inicializados.");
    });
}

// ======================================================
// Re-exporta as funções dos submódulos (sem alterações)
// ======================================================

// Tabs
export const trocarAba = tabsUI.trocarAba;

// Produtores
export const desenharListaProdutores = produtorUI.desenharListaProdutores;
export const limparFormularioProdutor = produtorUI.limparFormularioProdutor;
export const preencherFormularioProdutor = produtorUI.preencherFormularioProdutor;
export const coletarDadosProdutor = produtorUI.coletarDadosProdutor;
export const getIdProdutor = produtorUI.getIdProdutor;

// Serviços
export const desenharListaServicos = servicoUI.desenharListaServicos;
export const limparFormularioServico = servicoUI.limparFormularioServico;
export const preencherFormularioServico = servicoUI.preencherFormularioServico;
export const coletarDadosServico = servicoUI.coletarDadosServico;
export const getIdServico = servicoUI.getIdServico;

// Agendamento
export const popularDropdownProdutores = agendamentoUI.popularDropdownProdutores;
export const popularDropdownServicos = agendamentoUI.popularDropdownServicos;
export const limparFormularioAgendamento = agendamentoUI.limparFormularioAgendamento;
export const preencherFormularioAgendamento = agendamentoUI.preencherFormularioAgendamento;
export const getIdAgendamento = agendamentoUI.getIdAgendamento;
export const coletarDadosAgendamento = agendamentoUI.coletarDadosAgendamento;

// Histórico
export const desenharListaExecucoes = historicoUI.desenharListaExecucoes;

// Pagamentos
export const popularDropdownExecucoesPagamentos = pagamentoUI.popularDropdownExecucoesPagamentos;
export const exibirDetalhesExecucaoPagamentos = pagamentoUI.exibirDetalhesExecucaoPagamentos;
export const desenharListaPagamentos = pagamentoUI.desenharListaPagamentos;
export const limparFormularioPagamento = pagamentoUI.limparFormularioPagamento;
export const preencherFormularioPagamento = pagamentoUI.preencherFormularioPagamento;
export const coletarDadosPagamento = pagamentoUI.coletarDadosPagamento;
export const getIdPagamento = pagamentoUI.getIdPagamento;

// Relatórios
export const popularDropdownRelatorioProdutores = relatorioUI.popularDropdownRelatorioProdutores;
export const desenharRelatorioDividas = relatorioUI.desenharRelatorioDividas;