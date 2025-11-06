import pytest
import sqlite3
import logging

# Modelos
from app.models.produtor_model import Produtor
from app.models.servico_model import Servico
from app.models.execucao_model import Execucao
from app.models.pagamento_model import Pagamento

# Repositórios
from app.repositories import produtor_repository
from app.repositories import servico_repository
from app.repositories import execucao_repository
from app.repositories import pagamento_repository

# --- ARRANGE (Setup) Helpers ---
# Esta é a sua função, agora com os Asserts de Sênior
def _setup_base_data(
    nome_produtor="Produtor PGT", 
    cpf_produtor="777", 
    nome_servico="Serviço PGT"
):
    """
    Cria um Produtor, Servico e uma Execucao base.
    Agora parametrizado para evitar conflitos de UNIQUE constraint.
    """
    produtor = produtor_repository.create_produtor(
        Produtor(nome=nome_produtor, cpf=cpf_produtor)
    )
    servico = servico_repository.create_servico(
        Servico(nome=nome_servico, valor_unitario=100)
    )

    # --- Verificação de Sênior ---
    # Garante que os testes falhem com uma mensagem clara se o setup falhar
    if produtor is None:
        logging.error(f"Falha no setup: Produtor com CPF {cpf_produtor} não foi criado (provavelmente duplicado).")
        assert produtor is not None, f"Falha ao criar produtor no setup (CPF: {cpf_produtor})"
        
    if servico is None:
        logging.error(f"Falha no setup: Serviço com nome '{nome_servico}' não foi criado (provavelmente duplicado).")
        assert servico is not None, f"Falha ao criar serviço no setup (Nome: {nome_servico})"

    execucao = execucao_repository.create_execucao(Execucao(
        produtor_id=produtor.produtor_id,
        servico_id=servico.servico_id,
        horas_prestadas=10,
        valor_total=1000, # Uma dívida de 1000
        data_execucao="2025-01-01"
    ))
    
    assert execucao is not None, "Falha ao criar execução no setup"
    
    return execucao

# --- Teste C + R (GetById) ---
def test_create_and_get_pagamento(setup_test_db):
    # --- ARRANGE ---
    execucao = _setup_base_data()
    novo_pagamento_obj = Pagamento(
        execucao_id=execucao.execucao_id,
        valor_pago=250.50,
        data_pagamento="2025-01-05"
    )

    # --- ACT (Create) ---
    pagamento_criado = pagamento_repository.create_pagamento(novo_pagamento_obj)

    # --- ASSERT (Create) ---
    assert pagamento_criado.pagamento_id == 1
    assert pagamento_criado.valor_pago == 250.50

    # --- ACT (Read) ---
    pagamentos_da_execucao = pagamento_repository.get_pagamentos_by_execucao_id(
        execucao.execucao_id
    )

    # --- ASSERT (Read) ---
    assert len(pagamentos_da_execucao) == 1
    
    # CORREÇÃO 1: (TypeError)
    # Trocamos a sintaxe de dicionário (['...']) pela sintaxe de objeto (.)
    assert pagamentos_da_execucao[0].pagamento_id == 1
    assert pagamentos_da_execucao[0].valor_pago == 250.50

# --- Teste R (Múltiplos) ---
def test_get_multiple_pagamentos_for_one_execucao(setup_test_db):
    # --- ARRANGE ---
    
    # CORREÇÃO 2: (AttributeError / UNIQUE Constraint)
    # Chamamos o setup com dados únicos para evitar o conflito de CPF
    execucao = _setup_base_data(
        nome_produtor="Produtor A", cpf_produtor="111", nome_servico="Serviço A"
    )

    # Cria 3 pagamentos para esta execução
    pgt1 = Pagamento(execucao.execucao_id, 100, "2025-01-02")
    pgt2 = Pagamento(execucao.execucao_id, 200, "2025-01-03")
    pgt3 = Pagamento(execucao.execucao_id, 300, "2025-01-04")

    pagamento_repository.create_pagamento(pgt1)
    pagamento_repository.create_pagamento(pgt2)
    pagamento_repository.create_pagamento(pgt3)

    # Cria uma SEGUNDA execução (com dados únicos) para testar o isolamento
    execucao2 = _setup_base_data(
        nome_produtor="Produtor B", cpf_produtor="222", nome_servico="Serviço B"
    )
    pgt_extra = Pagamento(execucao2.execucao_id, 5000, "2025-01-05")
    pagamento_repository.create_pagamento(pgt_extra)

    # --- ACT ---
    # Busca SÓ os pagamentos da PRIMEIRA execução
    pagamentos_exec1 = pagamento_repository.get_pagamentos_by_execucao_id(execucao.execucao_id)

    # --- ASSERT ---
    assert len(pagamentos_exec1) == 3
    
    # CORREÇÃO 1 (BIS): (TypeError)
    # Trocamos a sintaxe de dicionário (['...']) pela sintaxe de objeto (.)
    assert pagamentos_exec1[0].valor_pago == 100
    assert pagamentos_exec1[1].valor_pago == 200
    assert pagamentos_exec1[2].valor_pago == 300

# --- Teste D (Soft Delete) ---
def test_soft_delete_pagamento(setup_test_db):
    # --- ARRANGE ---
    execucao = _setup_base_data()
    pgt1 = pagamento_repository.create_pagamento(
        Pagamento(execucao.execucao_id, 100, "2025-01-02")
    )
    pgt2 = pagamento_repository.create_pagamento(
        Pagamento(execucao.execucao_id, 200, "2025-01-03")
    )
    
    # Garante que temos 2 pagamentos antes de deletar
    pagamentos_antes = pagamento_repository.get_pagamentos_by_execucao_id(execucao.execucao_id)
    assert len(pagamentos_antes) == 2
    
    # --- ACT ---
    # Deleta o primeiro pagamento (pgt1)
    sucesso = pagamento_repository.delete_pagamento(pgt1.pagamento_id)
    
    # --- ASSERT ---
    assert sucesso is True
    
    # Agora, busca os pagamentos de novo
    pagamentos_depois = pagamento_repository.get_pagamentos_by_execucao_id(execucao.execucao_id)
    
    # A lista SÓ deve conter o segundo pagamento (pgt2)
    assert len(pagamentos_depois) == 1
    
    # CORREÇÃO 3: (TypeError)
    # Trocamos a sintaxe de dicionário (['...']) pela sintaxe de objeto (.)
    assert pagamentos_depois[0].pagamento_id == pgt2.pagamento_id
    assert pagamentos_depois[0].valor_pago == 200

# --- Teste de Integridade (Erro FK) ---
def test_create_pagamento_fails_with_invalid_execucao_id(setup_test_db):
    """
    Testa se o repositório lida com um FK Error e retorna None.
    Isto valida o nosso 'except sqlite3.IntegrityError' no repositório.
    """
    # --- ARRANGE ---
    # Não criamos uma execução. O ID 999 é inválido.
    pagamento_invalido = Pagamento(
        execucao_id=999, 
        valor_pago=100, 
        data_pagamento="2025-01-01"
    )
    
    # --- ACT ---
    resultado = pagamento_repository.create_pagamento(pagamento_invalido)
    
    # --- ASSERT ---
    assert resultado is None # O repositório deve retornar None ao falhar