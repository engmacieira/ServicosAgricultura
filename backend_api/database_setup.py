import sqlite3
import os

DB_NAME = 'gestao.db'

# --- SQL para Criação das Tabelas ---
# (Já atualizado com 'apelido' para NOVOS bancos)
SQL_CREATE_PRODUTORES = """
CREATE TABLE IF NOT EXISTS produtores (
    produtor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT UNIQUE,
    nome TEXT NOT NULL, 
    apelido TEXT, /* <-- Nossa nova coluna */
    regiao TEXT,
    referencia TEXT,
    telefone TEXT
);
"""

SQL_CREATE_SERVICOS = """
CREATE TABLE IF NOT EXISTS servicos (
    servico_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    valor_unitario REAL NOT NULL DEFAULT 0.0
);
"""

SQL_CREATE_EXECUCOES = """
CREATE TABLE IF NOT EXISTS execucoes (
    execucao_id INTEGER PRIMARY KEY AUTOINCREMENT,
    produtor_id INTEGER NOT NULL,
    servico_id INTEGER NOT NULL,
    horas_prestadas REAL NOT NULL DEFAULT 0.0,
    valor_total REAL NOT NULL DEFAULT 0.0,
    data_execucao TEXT NOT NULL,
    
    FOREIGN KEY (produtor_id) REFERENCES produtores (produtor_id) ON DELETE RESTRICT,
    FOREIGN KEY (servico_id) REFERENCES servicos (servico_id) ON DELETE RESTRICT
);
"""

SQL_CREATE_PAGAMENTOS = """
CREATE TABLE IF NOT EXISTS pagamentos (
    pagamento_id INTEGER PRIMARY KEY AUTOINCREMENT,
    execucao_id INTEGER NOT NULL,
    valor_pago REAL NOT NULL,
    data_pagamento TEXT NOT NULL,
    
    FOREIGN KEY (execucao_id) REFERENCES execucoes (execucao_id) ON DELETE CASCADE
);
"""

def setup_database():
    """
    Função principal para criar o banco e as tabelas (se não existirem).
    """
    db_exists = os.path.exists(DB_NAME)
    conn = None
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()
        
        if not db_exists:
            print(f"Banco de dados '{DB_NAME}' não encontrado. Criando...")
        else:
            print(f"Conectado ao banco '{DB_NAME}'...")

        cursor.execute(SQL_CREATE_PRODUTORES)
        print("Tabela 'produtores' verificada/criada.")
        
        cursor.execute(SQL_CREATE_SERVICOS)
        print("Tabela 'servicos' verificada/criada.")
        
        cursor.execute(SQL_CREATE_EXECUCOES)
        print("Tabela 'execucoes' verificada/criada.")
        
        cursor.execute(SQL_CREATE_PAGAMENTOS)
        print("Tabela 'pagamentos' verificada/criada.")

        conn.commit()
        
        if not db_exists:
            print("Banco de dados configurado com sucesso!")

    except sqlite3.Error as e:
        print(f"Erro ao configurar o banco de dados: {e}")
        if conn:
            conn.rollback()
            
    finally:
        if conn:
            conn.close()
            # Não printa "fechado" aqui, deixa a migração fazer isso

# --- NOSSA NOVA FUNÇÃO DE MIGRAÇÃO ---
def run_migrations():
    """
    Verifica e aplica alterações de schema (migrações) 
    em um banco de dados existente.
    """
    print("Verificando migrações pendentes...")
    conn = None
    try:
        conn = sqlite3.connect(DB_NAME)
        
        # Isso faz o SQLite nos retornar dicionários
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()

        # --- Migração 1: Adicionar 'apelido' a 'produtores' ---
        
        # 1. Verifica quais colunas existem em 'produtores'
        cursor.execute("PRAGMA table_info(produtores)")
        columns = [row['name'] for row in cursor.fetchall()]
        
        # 2. Se 'apelido' NÃO estiver na lista, adiciona
        if 'apelido' not in columns:
            print("... Migração pendente: Adicionando 'apelido' a 'produtores'.")
            
            # 3. Executa o comando de alteração NÃO DESTRUTIVO
            cursor.execute("ALTER TABLE produtores ADD COLUMN apelido TEXT")
            conn.commit()
            print("... Migração 'apelido' concluída com sucesso!")
        else:
            print("... Coluna 'apelido' já existe. Nenhuma migração necessária.")

        # (Aqui poderíamos adicionar futuras migrações, ex: if 'outra_coluna' ...)

    except sqlite3.Error as e:
        print(f"Erro ao rodar migrações: {e}")
        if conn:
            conn.rollback()
            
    finally:
        if conn:
            conn.close()
            print("Conexão com o banco fechada.")


# 5. Executa a função de setup E DEPOIS a de migração
if __name__ == "__main__":
    setup_database()  # Garante que as tabelas existam
    run_migrations()  # Garante que as colunas estejam atualizadas