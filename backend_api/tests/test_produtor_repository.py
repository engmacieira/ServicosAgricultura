import pytest
from app.models.produtor_model import Produtor
from app.repositories import produtor_repository
from app.core import database

def test_create_and_get_produtor(setup_test_db):
    novo_produtor = Produtor(
        nome="Matheus Trainee",
        apelido="Sincero",
        cpf="12345678900",
        regiao="Escritório",
        referencia="Perto da cafeteira",
        telefone="99999-8888"
    )

    produtor_criado = produtor_repository.create_produtor(novo_produtor)
    produtor_buscado = produtor_repository.get_produtor_by_id(produtor_criado.produtor_id)

    assert produtor_criado.produtor_id is not None
    assert produtor_criado.produtor_id == 1
    assert produtor_buscado is not None
    assert produtor_buscado.nome == "Matheus Trainee"
    assert produtor_buscado.cpf == "12345678900"
    
    
def test_update_produtor(setup_test_db):

    produtor_inicial = Produtor(
        nome="Produtor Original", 
        cpf="111",
        apelido="Original"
    )
    produtor_criado = produtor_repository.create_produtor(produtor_inicial)
    
    produtor_criado.nome = "Produtor Atualizado"
    produtor_criado.apelido = "Atualizado"
    produtor_repository.update_produtor(produtor_criado)
    
    produtor_buscado = produtor_repository.get_produtor_by_id(produtor_criado.produtor_id)

    assert produtor_buscado is not None
    assert produtor_buscado.nome == "Produtor Atualizado"
    assert produtor_buscado.apelido == "Atualizado"
    assert produtor_buscado.cpf == "111" 


def test_soft_delete_produtor(setup_test_db):
    produtor_para_deletar = Produtor(nome="Produtor a Deletar", cpf="222")
    produtor_criado = produtor_repository.create_produtor(produtor_para_deletar)
    produtor_id = produtor_criado.produtor_id
    
    sucesso = produtor_repository.delete_produtor(produtor_id)
    
    produtor_buscado = produtor_repository.get_produtor_by_id(produtor_id)

    assert sucesso is True
    assert produtor_buscado is None 

    conn = database.get_db_connection() 
    cursor = conn.cursor()
    cursor.execute("SELECT deletado_em FROM produtores WHERE produtor_id = ?", (produtor_id,))
    data = cursor.fetchone()
    conn.close()
    
    assert data is not None
    assert data['deletado_em'] is not None 
    

def test_get_all_produtores_and_pagination(setup_test_db):
    produtor_repository.create_produtor(Produtor(nome="Ana", cpf="111"))
    produtor_repository.create_produtor(Produtor(nome="Bruno", cpf="222"))
    produtor_repository.create_produtor(Produtor(nome="Carlos", cpf="333"))
    
    pagina_1 = produtor_repository.get_all_produtores(page=1, per_page=2)
    
    assert len(pagina_1) == 2
    assert pagina_1[0].nome == "Ana"
    assert pagina_1[1].nome == "Bruno"

    pagina_2 = produtor_repository.get_all_produtores(page=2, per_page=2)

    assert len(pagina_2) == 1
    assert pagina_2[0].nome == "Carlos"


def test_get_all_produtores_with_search(setup_test_db):
    produtor_repository.create_produtor(Produtor(nome="Matheus Sincero", cpf="111"))
    produtor_repository.create_produtor(Produtor(nome="Mark Construtor", cpf="222"))
    produtor_repository.create_produtor(Produtor(nome="Usuário Comum", cpf="333"))
    
    resultado_busca = produtor_repository.get_all_produtores(page=1, per_page=10, search_term="Mark")

    assert len(resultado_busca) == 1
    assert resultado_busca[0].nome == "Mark Construtor"


def test_get_produtores_count(setup_test_db):
    produtor_repository.create_produtor(Produtor(nome="Produtor 1", cpf="111"))
    produtor_repository.create_produtor(Produtor(nome="Produtor 2", cpf="222"))
    produtor_repository.create_produtor(Produtor(nome="Produtor Especial 3", cpf="333"))

    total_sem_busca = produtor_repository.get_produtores_count()
    total_com_busca = produtor_repository.get_produtores_count(search_term="Especial")

    assert total_sem_busca == 3
    assert total_com_busca == 1