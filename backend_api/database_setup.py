import sqlite3
import os # Vamos usar a lib 'os' para verificar se o DB já existe

# Define o nome do arquivo do banco
DB_NAME = 'gestao.db'

# --- SQL para Criação das Tabelas ---

# Usamos """ (aspas triplas) para escrever SQL em múltiplas linhas.
# IF NOT EXISTS: é uma boa prática. Evita erro se a tabela já existir.

SQL_CREATE_PRODUTORES = """
CREATE TABLE IF NOT EXISTS produtores (
    produtor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT UNIQUE,
    nome TEXT NOT NULL, 
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
    
    -- Definindo as Chaves Estrangeiras (FKs)
    -- ON DELETE RESTRICT: Impede apagar um produtor se ele tiver execuções
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
    
    -- Se uma execução for deletada (o que não deve acontecer facilmente),
    -- os pagamentos somem junto (CASCADE)
    FOREIGN KEY (execucao_id) REFERENCES execucoes (execucao_id) ON DELETE CASCADE
);
"""

def setup_database():
    """
    Função principal para criar o banco e as tabelas.
    """
    
    # Verifica se o banco já existe para não printar "criado" toda vez
    db_exists = os.path.exists(DB_NAME)
    
    conn = None # Inicializa a conexão como nula
    try:
        # 1. Conecta (ou cria) o banco de dados
        conn = sqlite3.connect(DB_NAME)
        
        # Habilita o suporte a chaves estrangeiras (importante!)
        conn.execute("PRAGMA foreign_keys = ON;")
        
        cursor = conn.cursor()
        
        if not db_exists:
            print(f"Banco de dados '{DB_NAME}' não encontrado. Criando...")
        else:
            print(f"Conectado ao banco '{DB_NAME}'...")

        # 2. Executa os comandos de criação de tabela
        cursor.execute(SQL_CREATE_PRODUTORES)
        print("Tabela 'produtores' verificada/criada.")
        
        cursor.execute(SQL_CREATE_SERVICOS)
        print("Tabela 'servicos' verificada/criada.")
        
        cursor.execute(SQL_CREATE_EXECUCOES)
        print("Tabela 'execucoes' verificada/criada.")
        
        cursor.execute(SQL_CREATE_PAGAMENTOS)
        print("Tabela 'pagamentos' verificada/criada.")

        # 3. Salva (comita) as mudanças no banco
        conn.commit()
        
        if not db_exists:
            print("Banco de dados configurado com sucesso!")

    except sqlite3.Error as e:
        print(f"Erro ao configurar o banco de dados: {e}")
        # Se deu erro, desfazemos qualquer mudança pendente
        if conn:
            conn.rollback()
            
    finally:
        # 4. Fecha a conexão (independentemente de ter dado erro ou não)
        if conn:
            conn.close()
            print("Conexão com o banco fechada.")

# 5. Executa a função de setup
if __name__ == "__main__":
    setup_database()