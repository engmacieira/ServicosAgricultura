import pytest
import sqlite3
from app.models.produtor_model import Produtor
from app.models.servico_model import Servico
from app.models.execucao_model import Execucao
from app.repositories import produtor_repository
from app.repositories import servico_repository
from app.repositories import execucao_repository
from app.core import database

# --- Teste C + R (GetById) ---
def test_create_and_get_execucao(setup_test_db):
    produtor = produtor_repository.create_produtor(Produtor(nome="Produtor Teste", cpf="111"))
    servico = servico_repository.create_servico(Servico(nome="Serviço Teste", valor_unitario=100))
    nova_execucao = Execucao(
        produtor_id=produtor.produtor_id, servico_id=servico.servico_id,
        horas_prestadas=5, valor_total=500, data_execucao="2025-11-05"
    )
    execucao_criada = execucao_repository.create_execucao(nova_execucao)
    execucao_buscada = execucao_repository.get_execucao_by_id(execucao_criada.execucao_id)
    assert execucao_criada.execucao_id == 1
    assert execucao_buscada is not None
    assert execucao_buscada.produtor_id == produtor.produtor_id

# --- Teste U ---
def test_update_execucao(setup_test_db):
    produtor = produtor_repository.create_produtor(Produtor(nome="Produtor Teste", cpf="111"))
    servico = servico_repository.create_servico(Servico(nome="Serviço Teste", valor_unitario=100))
    execucao_inicial = Execucao(
        produtor_id=produtor.produtor_id, servico_id=servico.servico_id,
        horas_prestadas=5, valor_total=500, data_execucao="2025-11-05"
    )
    execucao_criada = execucao_repository.create_execucao(execucao_inicial)
    execucao_criada.horas_prestadas = 10
    execucao_criada.valor_total = 1000
    execucao_repository.update_execucao(execucao_criada)
    execucao_buscada = execucao_repository.get_execucao_by_id(execucao_criada.execucao_id)
    assert execucao_buscada is not None
    assert execucao_buscada.horas_prestadas == 10

# --- Teste D (Soft-Delete) ---
def test_soft_delete_execucao(setup_test_db):
    produtor = produtor_repository.create_produtor(Produtor(nome="Produtor Teste", cpf="111"))
    servico = servico_repository.create_servico(Servico(nome="Serviço Teste", valor_unitario=100))
    execucao_para_deletar = Execucao(
        produtor_id=produtor.produtor_id, servico_id=servico.servico_id,
        horas_prestadas=1, valor_total=100, data_execucao="2025-11-01"
    )
    execucao_criada = execucao_repository.create_execucao(execucao_para_deletar)
    execucao_id = execucao_criada.execucao_id
    sucesso = execucao_repository.delete_execucao(execucao_id)
    execucao_buscada = execucao_repository.get_execucao_by_id(execucao_id)
    assert sucesso is True
    assert execucao_buscada is None

def test_get_all_execucoes_pagination_and_count_filters(setup_test_db):
    # --- ARRANGE (Arrumar) ---
    p1 = produtor_repository.create_produtor(Produtor(nome="Produtor 1", cpf="111"))
    p2 = produtor_repository.create_produtor(Produtor(nome="Produtor 2", cpf="222"))
    s1 = servico_repository.create_servico(Servico(nome="Serviço 1", valor_unitario=100))
    
    # Cria 3 execuções (ordenadas por data DESC)
    
    # CORREÇÃO 1: Usar argumentos nomeados (kwargs) para garantir 
    # que os dados sejam inseridos nas colunas corretas. 
    # Isso corrige o 'ValueError' que você viu primeiro.
    e1 = execucao_repository.create_execucao(Execucao(
        produtor_id=p1.produtor_id, servico_id=s1.servico_id, 
        horas_prestadas=1, valor_total=100, data_execucao="2025-11-05"
    )) # ID 1
    e2 = execucao_repository.create_execucao(Execucao(
        produtor_id=p1.produtor_id, servico_id=s1.servico_id, 
        horas_prestadas=2, valor_total=400, data_execucao="2025-11-10"
    )) # ID 2
    e3 = execucao_repository.create_execucao(Execucao(
        produtor_id=p2.produtor_id, servico_id=s1.servico_id, 
        horas_prestadas=3, valor_total=300, data_execucao="2025-11-15"
    )) # ID 3 (Mais novo)

    # --- ACT & ASSERT (Testando Paginação - get_all_execucoes) ---
    
    # A função get_all_execucoes ordena por data_execucao DESC
    lista_pag_1 = execucao_repository.get_all_execucoes(page=1, per_page=2)
    
    assert len(lista_pag_1) == 2
    
    # CORREÇÃO 2: O seu repositório (execucao_repository.py) retorna a chave
    # como "id", e não "execucao_id". 
    # O teste foi atualizado para verificar a chave "id".
    assert lista_pag_1[0]['id'] == e3.execucao_id # E3 (Mais novo)
    assert lista_pag_1[1]['id'] == e2.execucao_id # E2

    lista_pag_2 = execucao_repository.get_all_execucoes(page=2, per_page=2)
    assert len(lista_pag_2) == 1
    assert lista_pag_2[0]['id'] == e1.execucao_id # E1

    # --- ACT & ASSERT (Testando Contagem com Filtros - get_execucoes_count) ---
    
    # CORREÇÃO 3: A função get_execucoes_count() não aceita 'produtor_id'
    # como parâmetro. Ela aceita 'search_term'.
    # Estamos testando a busca pelo nome do produtor.
    count_p1 = execucao_repository.get_execucoes_count(search_term="Produtor 1")
    assert count_p1 == 2
    
    count_p2 = execucao_repository.get_execucoes_count(search_term="Produtor 2")
    assert count_p2 == 1

    # Testando contagem total
    count_total = execucao_repository.get_execucoes_count()
    assert count_total == 3

def test_create_execucao_fails_and_returns_none_with_invalid_produtor_id(setup_test_db):
    """
    Testa se o repositório lida com um FK Error, loga (como vimos!)
    e retorna None (ou o que quer que ele retorne em falha).
    """
    # ARRANGE
    servico = servico_repository.create_servico(Servico(nome="Serviço Teste", valor_unitario=100))
    execucao_invalida = Execucao(
        produtor_id=999, # ID Inválido
        servico_id=servico.servico_id,
        horas_prestadas=1, valor_total=100, data_execucao="2025-11-01"
    )
    
    # ACT
    # Nós chamamos a função e esperamos que ela NÃO quebre
    # (graças ao try...except)
    resultado = execucao_repository.create_execucao(execucao_invalida)
    
    # ASSERT
    # Nós verificamos se ela retornou o que esperamos em caso de falha
    # (No seu repo, ele retorna None em caso de erro)
    assert resultado is None