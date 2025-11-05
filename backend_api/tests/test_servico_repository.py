import pytest
from app.models.servico_model import Servico
from app.repositories import servico_repository
from app.core import database 

def test_create_and_get_servico(setup_test_db):
    novo_servico = Servico(
        nome="Roçada",
        valor_unitario=150.0
    )

    servico_criado = servico_repository.create_servico(novo_servico)
    servico_buscado = servico_repository.get_servico_by_id(servico_criado.servico_id)

    assert servico_criado.servico_id == 1
    assert servico_buscado is not None
    assert servico_buscado.nome == "Roçada"
    assert servico_buscado.valor_unitario == 150.0

def test_update_servico(setup_test_db):
    servico_inicial = Servico(nome="Serviço Antigo", valor_unitario=10.0)
    servico_criado = servico_repository.create_servico(servico_inicial)

    servico_criado.nome = "Serviço Novo"
    servico_criado.valor_unitario = 99.0
    servico_repository.update_servico(servico_criado)
    
    servico_buscado = servico_repository.get_servico_by_id(servico_criado.servico_id)

    assert servico_buscado is not None
    assert servico_buscado.nome == "Serviço Novo"
    assert servico_buscado.valor_unitario == 99.0

def test_soft_delete_servico(setup_test_db):
    servico_para_deletar = Servico(nome="Serviço a Deletar", valor_unitario=1.0)
    servico_criado = servico_repository.create_servico(servico_para_deletar)
    servico_id = servico_criado.servico_id
    
    sucesso = servico_repository.delete_servico(servico_id)
    servico_buscado = servico_repository.get_servico_by_id(servico_id)

    assert sucesso is True
    assert servico_buscado is None

    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT deletado_em FROM servicos WHERE servico_id = ?", (servico_id,))
    data = cursor.fetchone()
    conn.close()
    
    assert data is not None
    assert data['deletado_em'] is not None

def test_get_all_servicos_and_pagination(setup_test_db):
    servico_repository.create_servico(Servico(nome="Arado", valor_unitario=100.0))
    servico_repository.create_servico(Servico(nome="Colheita", valor_unitario=200.0))
    servico_repository.create_servico(Servico(nome="Plantio", valor_unitario=300.0))
    
    pagina_1 = servico_repository.get_all_servicos(page=1, per_page=2)
    
    assert len(pagina_1) == 2
    assert pagina_1[0].nome == "Arado"
    assert pagina_1[1].nome == "Colheita"

    pagina_2 = servico_repository.get_all_servicos(page=2, per_page=2)

    assert len(pagina_2) == 1
    assert pagina_2[0].nome == "Plantio"

def test_get_servicos_count(setup_test_db):
    servico_repository.create_servico(Servico(nome="Serviço A", valor_unitario=100.0))
    servico_repository.create_servico(Servico(nome="Serviço B", valor_unitario=200.0))
    servico_repository.create_servico(Servico(nome="Serviço Especial C", valor_unitario=300.0))

    total_sem_busca = servico_repository.get_servicos_count()

    assert total_sem_busca == 3