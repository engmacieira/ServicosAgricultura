# app/repositories/servico_repository.py
from app.core.database import get_db_connection
from app.models.servico_model import Servico

# Mark Construtor: Esta é a camada de Acesso a Dados para 'Servicos'.
# Implementamos o CRUD completo, mais uma função "Listar Todos".

def get_servico_by_id(servico_id: int):
    """
    (R)ead: Busca um Servico no banco pelo seu ID
    e retorna um *objeto* do tipo Servico.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM servicos WHERE servico_id = ?", (servico_id,))
    data = cursor.fetchone() # Pega o primeiro (e único) resultado
    
    conn.close()
    
    if data is None:
        return None # Não achamos o serviço
    
    # Mapeia os dados do banco para o nosso objeto Servico
    return Servico(
        servico_id=data['servico_id'],
        nome=data['nome'],
        valor_unitario=data['valor_unitario']
    )

def get_all_servicos(page: int, per_page: int):
    """
    (R)ead: Busca Servicos no banco com paginação.
    Retorna uma *lista* de objetos Servico.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Calcula o OFFSET
    offset = (page - 1) * per_page
    
    # 2. SQL com LIMIT e OFFSET
    sql = "SELECT * FROM servicos ORDER BY nome LIMIT ? OFFSET ?"
    
    cursor.execute(sql, (per_page, offset))
    data = cursor.fetchall() # Pega apenas a página atual
    
    conn.close()
    
    # Mapeia cada 'row' do banco para um objeto Servico
    return [
        Servico(
            servico_id=row['servico_id'],
            nome=row['nome'],
            valor_unitario=row['valor_unitario']
        ) for row in data
    ]

def get_servicos_count():
    """ Retorna o número total de serviços cadastrados. """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM servicos")
    total = cursor.fetchone()[0] # Pega o primeiro valor da primeira linha
    
    conn.close()
    return total

def create_servico(servico: Servico):
    """
    (C)reate: Salva um *objeto* Servico no banco (INSERT).
    Atualiza o ID do objeto com o ID gerado pelo banco.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO servicos (nome, valor_unitario)
        VALUES (?, ?)
    """
    
    # 💡 Mentoria: Usamos um try/except aqui por uma boa razão.
    # A tabela 'servicos' tem uma restrição 'UNIQUE' no 'nome'.
    # Se tentarmos inserir um nome que já existe, o banco dará um erro.
    try:
        cursor.execute(sql, (servico.nome, servico.valor_unitario))
        servico.servico_id = cursor.lastrowid
        conn.commit()
        print(f"Serviço salvo! ID: {servico.servico_id}")
        return servico
        
    except conn.IntegrityError:
        print(f"Erro: O nome de serviço '{servico.nome}' já existe.")
        return None # Retorna None para indicar que falhou
        
    finally:
        conn.close()


def update_servico(servico: Servico):
    """
    (U)pdate: Atualiza um Servico existente no banco (UPDATE).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE servicos 
        SET nome = ?, valor_unitario = ?
        WHERE servico_id = ?
    """
    
    params = (
        servico.nome, 
        servico.valor_unitario,
        servico.servico_id
    )
    
    try:
        cursor.execute(sql, params)
        conn.commit()
        print(f"Serviço atualizado! ID: {servico.servico_id}")
        return servico
        
    except conn.IntegrityError:
        print(f"Erro: O nome de serviço '{servico.nome}' já existe.")
        return None # Falha devido à restrição UNIQUE
        
    finally:
        conn.close()

def delete_servico(servico_id: int):
    """
    (D)elete: Exclui um Servico do banco pelo seu ID (DELETE).
    Retorna True se foi bem-sucedido, False caso contrário.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 💡 Mentoria: Note a Foreign Key!
    # O schema 'execucoes' tem 'ON DELETE RESTRICT'.
    # Isso significa que o banco VAI FALHAR esta exclusão
    # se qualquer 'execucao' estiver usando este 'servico_id'.
    sql = "DELETE FROM servicos WHERE servico_id = ?"
    
    try:
        cursor.execute(sql, (servico_id,))
        conn.commit()
        
        # .rowcount nos diz quantas linhas foram afetadas.
        deleted = cursor.rowcount > 0
        print(f"Tentativa de exclusão do ID: {servico_id}. Sucesso: {deleted}")
        return deleted
        
    except conn.IntegrityError as e:
        # Isso captura o erro 'FOREIGN KEY constraint failed'
        print(f"Erro de integridade ao excluir ID {servico_id}: {e}")
        print("Provavelmente este serviço está sendo usado em uma 'execução'.")
        return False # Retorna False para indicar falha
        
    finally:
        conn.close()