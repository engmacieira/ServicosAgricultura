import sqlite3
import pytest
import os
from app.models.produtor_model import Produtor
from app.repositories import produtor_repository
from app.core import database 

TEST_DB_PATH = 'test_gestao.db'

@pytest.fixture
def setup_test_db(monkeypatch):
    monkeypatch.setattr(database, "DATABASE", TEST_DB_PATH)

    conn = sqlite3.connect(TEST_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtores (
            produtor_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            apelido TEXT,
            cpf TEXT,
            regiao TEXT,
            referencia TEXT,
            telefone TEXT,
            deletado_em DATETIME
        )
    """)
    conn.commit()
    conn.close()

    yield
    
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)

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