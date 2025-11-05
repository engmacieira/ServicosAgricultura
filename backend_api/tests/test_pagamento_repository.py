import pytest
import sqlite3

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
# Vamos criar uns dados base que serão usados em (quase) todos os testes
# para evitar repetição de código.
def _setup_base_data():
    """Cria um Produtor, Servico e uma Execucao base."""
    produtor = produtor_repository.create_produtor(
        Produtor(nome="Produtor PGT", cpf="777")
    )
    servico = servico_repository.create_servico(
        Servico(nome="Serviço PGT", valor_unitario=100)
    )
    execucao = execucao_repository.create_execucao(Execucao(
        produtor_id=produtor.produtor_id,
        servico_id=servico.servico_id,
        horas_prestadas=10,
        valor_total=1000, # Uma dívida de 1000
        data_execucao="2025-01-01"
    ))
    return execucao

# --- Teste C + R (Create + GetByExecucaoId) ---
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
    # Agora, buscamos os pagamentos daquela execução
    pagamentos_da_execucao = pagamento_repository.get_pagamentos_by_execucao_id(
        execucao.execucao_id
    )
    
    # --- ASSERT (Read) ---
    assert len(pagamentos_da_execucao) == 1
    # O repositório de pagamento retorna uma lista de dicionários
    assert pagamentos_da_execucao[0]['pagamento_id'] == 1
    assert pagamentos_da_execucao[0]['valor_pago'] == 250.50
    assert pagamentos_da_execucao[0]['data_pagamento'] == "2025-01-05"

# --- Teste R (Listagem Múltipla) ---
def test_get_multiple_pagamentos_for_one_execucao(setup_test_db):
    # --- ARRANGE ---
    execucao = _setup_base_data() # Dívida de 1000
    
    # Cria 3 pagamentos para esta execução
    pgt1 = Pagamento(execucao.execucao_id, 100, "2025-01-02")
    pgt2 = Pagamento(execucao.execucao_id, 200, "2025-01-03")
    pgt3 = Pagamento(execucao.execucao_id, 300, "2025-01-04")
    
    pagamento_repository.create_pagamento(pgt1)
    pagamento_repository.create_pagamento(pgt2)
    pagamento_repository.create_pagamento(pgt3)
    
    # Cria uma SEGUNDA execução e um pagamento para ela (para testar isolamento)
    execucao2 = _setup_base_data()
    pgt_outra = Pagamento(execucao2.execucao_id, 5000, "2025-01-05")
    pagamento_repository.create_pagamento(pgt_outra)

    # --- ACT ---
    # Busca pagamentos APENAS da primeira execução
    pagamentos_da_execucao1 = pagamento_repository.get_pagamentos_by_execucao_id(
        execucao.execucao_id
    )

    # --- ASSERT ---
    assert len(pagamentos_da_execucao1) == 3
    
    # Valida os valores (a ordem de retorno não importa, vamos somar)
    total_pago = sum(p['valor_pago'] for p in pagamentos_da_execucao1)
    assert total_pago == (100 + 200 + 300) # 600

# --- Teste D (Soft-Delete) ---
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
    # Deleta o primeiro pagamento (ID 1)
    sucesso = pagamento_repository.delete_pagamento(pgt1.pagamento_id)
    
    # --- ASSERT ---
    assert sucesso is True
    
    # Agora, busca os pagamentos de novo
    pagamentos_depois = pagamento_repository.get_pagamentos_by_execucao_id(execucao.execucao_id)
    
    # A lista SÓ deve conter o segundo pagamento (pgt2)
    assert len(pagamentos_depois) == 1
    assert pagamentos_depois[0]['pagamento_id'] == pgt2.pagamento_id
    assert pagamentos_depois[0]['valor_pago'] == 200

# --- Teste de Integridade (Erro FK) ---
def test_create_pagamento_fails_with_invalid_execucao_id(setup_test_db):
    """
    Testa se o repositório lida com um FK Error e retorna None.
    """
    # --- ARRANGE ---
    # Tenta criar um pagamento para uma execução que NÃO existe (ID 999)
    pagamento_invalido = Pagamento(
        execucao_id=999,
        valor_pago=100,
        data_pagamento="2025-01-01"
    )
    
    # --- ACT ---
    # O repositório deve capturar o sqlite3.IntegrityError e retornar None
    #
    resultado = pagamento_repository.create_pagamento(pagamento_invalido)
    
    # --- ASSERT ---
    assert resultado is None