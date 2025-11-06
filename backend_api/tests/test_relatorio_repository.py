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
# O repositório que estamos a testar
from app.repositories import relatorio_repository

# --- ARRANGE (Setup) Helpers ---
# Vamos reutilizar a nossa função de setup robusta do último teste
# (Copie-a do test_pagamento_repository.py se precisar)
def _setup_base_data(
    nome_produtor="Produtor PGT",
    cpf_produtor="777",
    nome_servico="Serviço PGT"
):
    """
    Cria um Produtor, Servico e uma Execucao base.
    """
    produtor = produtor_repository.create_produtor(
        Produtor(nome=nome_produtor, cpf=cpf_produtor)
    )
    servico = servico_repository.create_servico(
        Servico(nome=nome_servico, valor_unitario=100)
    )

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
        valor_total=1000, # Dívida de 1000
        data_execucao="2025-01-01"
    ))
    assert execucao is not None, "Falha ao criar execução no setup"
    
    # Retornamos tudo o que criámos, para o caso de precisarmos
    return produtor, servico, execucao

# --- Testes de Banco Vazio ---

def test_get_relatorio_geral_com_banco_vazio(setup_test_db):
    """
    Testa se o get_relatorio_geral retorna uma lista vazia
    quando o banco de dados está limpo (sem produtores).
    """
    # --- ARRANGE ---
    # setup_test_db garante que o banco está limpo
    
    # --- ACT ---
    relatorio = relatorio_repository.get_relatorio_geral()
    
    # --- ASSERT ---
    # A nossa função refatorada retorna [] em caso de erro ou vazio
    assert relatorio == []
    assert isinstance(relatorio, list)

def test_get_relatorio_produtor_com_banco_vazio(setup_test_db):
    """
    Testa se o get_relatorio_produtor retorna um dicionário vazio
    para um produtor_id inválido num banco limpo.
    """
    # --- ARRANGE ---
    # setup_test_db garante que o banco está limpo
    produtor_id_invalido = 999
    
    # --- ACT ---
    relatorio = relatorio_repository.get_relatorio_produtor(produtor_id_invalido)
    
    # --- ASSERT ---
    # A nossa função refatorada retorna {} em caso de erro ou vazio
    assert relatorio == {}
    assert isinstance(relatorio, dict)
    
    # (Continuação de tests/test_relatorio_repository.py)

# --- Testes de Lógica (Cenário Complexo) ---

def test_relatorios_com_cenario_complexo(setup_test_db):
    """
    Testa o get_relatorio_geral e o get_relatorio_produtor
    com um cenário de dados complexo para verificar os cálculos.
    """
    
    # --- ARRANGE (Cenário Complexo) ---
    
    # 1. Produtor 1 (Ana - A Grande Devedora)
    p1, s1, e1 = _setup_base_data("Ana (Devedora)", "111", "Serviço A") # Dívida: 1000
    e2 = execucao_repository.create_execucao(Execucao(p1.produtor_id, s1.servico_id, "2025-01-02", 5, 300)) # Dívida: 300
    
    pagamento_repository.create_pagamento(Pagamento(e1.execucao_id, 500, "2025-01-03")) # Paga 500 da dívida de 1000
    # Total Ana: Dívida 1300, Pago 500, Saldo 800

    # 2. Produtor 2 (Beto - O Devedor Menor)
    p2, s2, e3 = _setup_base_data("Beto (Devedor Menor)", "222", "Serviço B") # Dívida: 1000 (do setup)
    # Vamos atualizar a dívida do Beto para ser mais realista
    e3.valor_total = 200
    execucao_repository.update_execucao(e3) # Dívida: 200
    
    pagamento_repository.create_pagamento(Pagamento(e3.execucao_id, 100, "2025-01-04")) # Paga 100 da dívida de 200
    # Total Beto: Dívida 200, Pago 100, Saldo 100

    # 3. Produtor 3 (Carla - A Paga-em-dia)
    p3, s3, e4 = _setup_base_data("Carla (Paga-em-dia)", "333", "Serviço C") # Dívida: 1000 (do setup)
    e4.valor_total = 500
    execucao_repository.update_execucao(e4) # Dívida: 500
    
    pagamento_repository.create_pagamento(Pagamento(e4.execucao_id, 500, "2025-01-05")) # Paga 500 da dívida de 500
    # Total Carla: Dívida 500, Pago 500, Saldo 0

    # 4. Produtor 4 (Daniel - O Inativo)
    p4 = produtor_repository.create_produtor(Produtor(nome="Daniel (Inativo)", cpf="444"))
    # Total Daniel: Dívida 0, Pago 0, Saldo 0

    
    # --- ACT 1: Relatório Geral ---
    relatorio_geral = relatorio_repository.get_relatorio_geral()
    
    # --- ASSERT 1: Relatório Geral ---
    assert len(relatorio_geral) == 4
    
    # A query ordena por saldo_devedor DESC
    
    # 1º Lugar: Ana (Saldo 800)
    assert relatorio_geral[0]['produtor_nome'] == "Ana (Devedora)"
    assert relatorio_geral[0]['saldo_devedor'] == 800.0
    assert relatorio_geral[0]['valor_total_devido'] == 1300.0 # (1000 + 300)
    assert relatorio_geral[0]['valor_total_pago'] == 500.0
    assert relatorio_geral[0]['total_servicos'] == 2

    # 2º Lugar: Beto (Saldo 100)
    assert relatorio_geral[1]['produtor_nome'] == "Beto (Devedor Menor)"
    assert relatorio_geral[1]['saldo_devedor'] == 100.0
    assert relatorio_geral[1]['valor_total_devido'] == 200.0
    assert relatorio_geral[1]['valor_total_pago'] == 100.0
    assert relatorio_geral[1]['total_servicos'] == 1

    # 3º Lugar: Carla (Saldo 0) - (Empate com Daniel, ordem alfabética)
    # 4º Lugar: Daniel (Saldo 0)
    # Vamos verificar os dois últimos independentemente da ordem de empate
    saldos_zero = {r['produtor_nome']: r for r in relatorio_geral[2:]}
    
    assert "Carla (Paga-em-dia)" in saldos_zero
    assert saldos_zero["Carla (Paga-em-dia)"]['saldo_devedor'] == 0.0
    assert saldos_zero["Carla (Paga-em-dia)"]['total_servicos'] == 1
    
    assert "Daniel (Inativo)" in saldos_zero
    assert saldos_zero["Daniel (Inativo)"]['saldo_devedor'] == 0.0
    assert saldos_zero["Daniel (Inativo)"]['total_servicos'] == 0
    assert saldos_zero["Daniel (Inativo)"]['valor_total_devido'] is None # Correto, SUM(NULL) é NULL
    assert saldos_zero["Daniel (Inativo)"]['valor_total_pago'] == 0.0 # Correto, COALESCE(SUM(NULL), 0.0)


    # --- ACT 2: Relatório de Produtor (Focando na Ana) ---
    relatorio_ana = relatorio_repository.get_relatorio_produtor(p1.produtor_id)
    
    # --- ASSERT 2: Relatório de Produtor (Ana) ---
    assert len(relatorio_ana) == 2 # Ana teve 2 execuções
    
    # A query ordena por data_execucao DESC
    
    # Execução 2 (e2) - data '2025-01-02'
    exec_recente_ana = relatorio_ana[e2.execucao_id]
    assert exec_recente_ana['data_execucao'] == "2025-01-02"
    assert exec_recente_ana['valor_total'] == 300.0
    assert exec_recente_ana['total_pago'] == 0.0
    assert exec_recente_ana['saldo_devedor'] == 300.0
    
    # Execução 1 (e1) - data '2025-01-01'
    exec_antiga_ana = relatorio_ana[e1.execucao_id]
    assert exec_antiga_ana['data_execucao'] == "2025-01-01"
    assert exec_antiga_ana['valor_total'] == 1000.0
    assert exec_antiga_ana['total_pago'] == 500.0
    assert exec_antiga_ana['saldo_devedor'] == 500.0