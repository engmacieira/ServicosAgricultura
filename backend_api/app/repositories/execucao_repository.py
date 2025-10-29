# app/repositories/execucao_repository.py
from app.core.database import get_db_connection
from app.models.execucao_model import Execucao

# Mark Construtor: Esta é a camada de Acesso a Dados para 'Execucoes'.
# Ela lida com as restrições de Chave Estrangeira.

def get_execucao_by_id(execucao_id: int):
    """
    (R)ead: Busca uma Execucao no banco pelo seu ID
    e retorna um *objeto* do tipo Execucao.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM execucoes WHERE execucao_id = ?", (execucao_id,))
    data = cursor.fetchone()
    
    conn.close()
    
    if data is None:
        return None # Não achamos a execução
    
    # Mapeia os dados do banco para o nosso objeto Execucao
    return Execucao(
        execucao_id=data['execucao_id'],
        produtor_id=data['produtor_id'],
        servico_id=data['servico_id'],
        data_execucao=data['data_execucao'],
        horas_prestadas=data['horas_prestadas'],
        valor_total=data['valor_total']
    )

def get_all_execucoes():
    """
    (R)ead: Busca *todas* as Execucoes no banco.
    Retorna uma *lista* de objetos Execucao.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ordenar por data (mais recente primeiro) é uma boa prática
    cursor.execute("SELECT * FROM execucoes ORDER BY data_execucao DESC")
    data = cursor.fetchall()
    
    conn.close()
    
    # Mapeia cada 'row' do banco para um objeto Execucao
    return [
        Execucao(
            execucao_id=row['execucao_id'],
            produtor_id=row['produtor_id'],
            servico_id=row['servico_id'],
            data_execucao=row['data_execucao'],
            horas_prestadas=row['horas_prestadas'],
            valor_total=row['valor_total']
        ) for row in data
    ]

def create_execucao(execucao: Execucao):
    """
    (C)reate: Salva um *objeto* Execucao no banco (INSERT).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO execucoes (produtor_id, servico_id, data_execucao, 
                               horas_prestadas, valor_total)
        VALUES (?, ?, ?, ?, ?)
    """
    
    params = (
        execucao.produtor_id,
        execucao.servico_id,
        execucao.data_execucao,
        execucao.horas_prestadas,
        execucao.valor_total
    )
    
    try:
        cursor.execute(sql, params)
        execucao.execucao_id = cursor.lastrowid
        conn.commit()
        print(f"Execução salva! ID: {execucao.execucao_id}")
        return execucao
        
    except conn.IntegrityError as e:
        # 💡 Mentoria: Isso captura o erro 'FOREIGN KEY constraint failed'
        print(f"Erro de integridade ao criar execução: {e}")
        print("Verifique se o 'produtor_id' e 'servico_id' existem.")
        return None # Retorna None para indicar que falhou
        
    finally:
        conn.close()

def update_execucao(execucao: Execucao):
    """
    (U)pdate: Atualiza uma Execucao existente no banco (UPDATE).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE execucoes 
        SET produtor_id = ?, servico_id = ?, data_execucao = ?, 
            horas_prestadas = ?, valor_total = ?
        WHERE execucao_id = ?
    """
    
    params = (
        execucao.produtor_id,
        execucao.servico_id,
        execucao.data_execucao,
        execucao.horas_prestadas,
        execucao.valor_total,
        execucao.execucao_id # ID é o último, para o WHERE
    )
    
    try:
        cursor.execute(sql, params)
        conn.commit()
        print(f"Execução atualizada! ID: {execucao.execucao_id}")
        return execucao
        
    except conn.IntegrityError as e:
        print(f"Erro de integridade ao atualizar execução: {e}")
        print("Verifique se o 'produtor_id' e 'servico_id' existem.")
        return None # Falha devido à restrição FK
        
    finally:
        conn.close()

def delete_execucao(execucao_id: int):
    """
    (D)elete: Exclui uma Execucao do banco pelo seu ID (DELETE).
    Retorna True se foi bem-sucedido, False caso contrário.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "DELETE FROM execucoes WHERE execucao_id = ?"
    
    try:
        cursor.execute(sql, (execucao_id,))
        conn.commit()
        
        deleted = cursor.rowcount > 0
        print(f"Tentativa de exclusão da execução ID: {execucao_id}. Sucesso: {deleted}")
        # Lembre-se: Pagamentos ligados a esta execução
        # foram deletados em CASCADE.
        return deleted
        
    except conn.IntegrityError as e:
        # Embora não deva acontecer no DELETE (só no CREATE/UPDATE),
        # é uma boa prática manter.
        print(f"Erro de integridade ao excluir execução: {e}")
        return False
        
    finally:
        conn.close()