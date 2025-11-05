import sqlite3
import pytest
import os
from app.core import database 
import database_setup

TEST_DB_PATH = 'test_gestao.db'

@pytest.fixture
def setup_test_db(monkeypatch):
    """
    Fixture COMPARTILHADA para todos os testes.
    1. Aponta o app para um banco de teste limpo (TEST_DB_PATH).
    2. USA O SCRIPT REAL 'database_setup.py' para criar as tabelas.
    3. Limpa (apaga) o banco de teste após a execução.
    """
    
    monkeypatch.setattr(database, "DATABASE", TEST_DB_PATH)
    monkeypatch.setattr(database_setup, "DB_NAME", TEST_DB_PATH)

    database_setup.setup_database()
    database_setup.run_migrations()
    
    yield
    
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)