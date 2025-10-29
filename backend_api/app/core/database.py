# app/core/database.py
import sqlite3

# Define o caminho do nosso banco de dados
DATABASE = 'gestao.db'

def get_db_connection():
    """
    Função auxiliar que cria e retorna uma conexão com o banco.
    """
    conn = sqlite3.connect(DATABASE)
    
    # Isso faz o SQLite nos retornar dicionários (Rows)
    conn.row_factory = sqlite3.Row 
    return conn