from app.core.database import get_db_connection
from app.models.produtor_model import Produtor
import logging

def get_produtor_by_id(produtor_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM produtores WHERE produtor_id = ? AND deletado_em IS NULL", (produtor_id,))
    data = cursor.fetchone() 
    conn.close()
    if data is None:
        return None 
    return Produtor(
        produtor_id=data['produtor_id'],
        nome=data['nome'],
        apelido=data['apelido'],
        cpf=data['cpf'],
        regiao=data['regiao'],
        referencia=data['referencia'],
        telefone=data['telefone']
    )

def get_all_produtores(page: int, per_page: int, search_term: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    offset = (page - 1) * per_page
    params = []
    where_clause = "WHERE deletado_em IS NULL"
    if search_term:
        where_clause += " AND (nome LIKE ? OR apelido LIKE ? OR cpf LIKE ?)"
        search_like = f"%{search_term}%"
        params.extend([search_like, search_like, search_like])
    sql = f"SELECT * FROM produtores {where_clause} ORDER BY nome LIMIT ? OFFSET ?"
    params.extend([per_page, offset])
    cursor.execute(sql, params)
    data = cursor.fetchall() 
    conn.close()
    return [
        Produtor(
            produtor_id=row['produtor_id'],
            nome=row['nome'],
            apelido=row['apelido'],
            cpf=row['cpf'],
            regiao=row['regiao'],
            referencia=row['referencia'],
            telefone=row['telefone']
        ) for row in data
    ]

def get_produtores_count(search_term: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    params = []
    where_clause = "WHERE deletado_em IS NULL"
    if search_term:
        where_clause += " AND (nome LIKE ? OR apelido LIKE ? OR cpf LIKE ?)"
        search_like = f"%{search_term}%"
        params.extend([search_like, search_like, search_like])
    cursor.execute(f"SELECT COUNT(*) FROM produtores {where_clause}", params)
    total = cursor.fetchone()[0] 
    conn.close()
    return total

def create_produtor(produtor: Produtor):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        INSERT INTO produtores (nome, apelido, cpf, regiao, referencia, telefone)
        VALUES (?, ?, ?, ?, ?, ?)
    """
    cursor.execute(sql, (produtor.nome, produtor.apelido, produtor.cpf, produtor.regiao, produtor.referencia, produtor.telefone))
    produtor.produtor_id = cursor.lastrowid
    conn.commit()
    conn.close()
    logging.info(f"Produtor salvo! ID: {produtor.produtor_id}")
    return produtor

def update_produtor(produtor: Produtor):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        UPDATE produtores 
        SET nome = ?, apelido = ?, cpf = ?, regiao = ?, referencia = ?, telefone = ?
        WHERE produtor_id = ?
    """
    params = (
        produtor.nome,
        produtor.apelido, 
        produtor.cpf, 
        produtor.regiao, 
        produtor.referencia, 
        produtor.telefone,
        produtor.produtor_id 
    )
    cursor.execute(sql, params)
    conn.commit()
    conn.close()
    logging.info(f"Produtor atualizado! ID: {produtor.produtor_id}")
    return produtor

def delete_produtor(produtor_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE produtores SET deletado_em = CURRENT_TIMESTAMP WHERE produtor_id = ?"
    try:
        cursor.execute(sql, (produtor_id,))
        conn.commit()
        updated = cursor.rowcount > 0
        conn.close()
        if updated:
            logging.info(f"Soft delete do Produtor ID: {produtor_id} realizado com sucesso.")
        else:
            logging.warn(f"Tentativa de soft delete do Produtor ID: {produtor_id} falhou (ID não encontrado).")
        return updated
    except conn.Error as e:
        logging.error(f"Erro ao tentar fazer soft delete do Produtor ID {produtor_id}: {e}")
        conn.close()
        return False

def get_produtor_by_nome(nome: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT produtor_id FROM produtores WHERE nome = ? AND deletado_em IS NULL", (nome,))
    data = cursor.fetchone() 
    conn.close()
    if data:
        return data['produtor_id']
    return None