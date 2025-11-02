from app.core.database import get_db_connection
from app.models.servico_model import Servico
import logging

def get_servico_by_id(servico_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM servicos WHERE servico_id = ? AND deletado_em IS NULL", (servico_id,))
    data = cursor.fetchone()     
    conn.close()
    if data is None:
        return None 
    return Servico(
        servico_id=data['servico_id'],
        nome=data['nome'],
        valor_unitario=data['valor_unitario']
    )

def get_all_servicos(page: int, per_page: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    offset = (page - 1) * per_page
    sql = "SELECT * FROM servicos WHERE deletado_em IS NULL ORDER BY nome LIMIT ? OFFSET ?"
    cursor.execute(sql, (per_page, offset))
    data = cursor.fetchall() 
    conn.close()
    return [
        Servico(
            servico_id=row['servico_id'],
            nome=row['nome'],
            valor_unitario=row['valor_unitario']
        ) for row in data
    ]

def get_servicos_count():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM servicos WHERE deletado_em IS NULL")
    total = cursor.fetchone()[0] 
    conn.close()
    return total

def create_servico(servico: Servico):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        INSERT INTO servicos (nome, valor_unitario)
        VALUES (?, ?)
    """
    try:
        cursor.execute(sql, (servico.nome, servico.valor_unitario))
        servico.servico_id = cursor.lastrowid
        conn.commit()    
        logging.info(f"Serviço salvo! ID: {servico.servico_id}")
        return servico
    except conn.IntegrityError:
        logging.error(f"Erro: O nome de serviço '{servico.nome}' já existe.")
        return None 
    finally:
        conn.close()

def update_servico(servico: Servico):
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
        logging.info(f"Serviço atualizado! ID: {servico.servico_id}")
        return servico   
    except conn.IntegrityError:
        logging.error(f"Erro: O nome de serviço '{servico.nome}' já existe.")
        return None 
    finally:
        conn.close()

def delete_servico(servico_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE servicos SET deletado_em = CURRENT_TIMESTAMP WHERE servico_id = ?"
    try:
        cursor.execute(sql, (servico_id,))
        conn.commit()
        updated = cursor.rowcount > 0
        conn.close()
        if updated:
            logging.info(f"Soft delete do Servico ID: {servico_id} realizado com sucesso.")
        else:
            logging.warn(f"Tentativa de soft delete do Servico ID: {servico_id} falhou (ID não encontrado).")
        return updated
    except conn.Error as e:
        logging.error(f"Erro ao tentar fazer soft delete do Servico ID {servico_id}: {e}")
        conn.close()
        return False