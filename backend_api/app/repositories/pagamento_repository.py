from app.core.database import get_db_connection
from app.models.pagamento_model import Pagamento
import logging

def get_pagamento_by_id(pagamento_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pagamentos WHERE pagamento_id = ? AND deletado_em IS NULL", (pagamento_id,))
    data = cursor.fetchone()
    conn.close()
    if data is None:
        return None
    return Pagamento(
        pagamento_id=data['pagamento_id'],
        execucao_id=data['execucao_id'],
        valor_pago=data['valor_pago'],
        data_pagamento=data['data_pagamento']
    )

def get_pagamentos_by_execucao_id(execucao_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM pagamentos WHERE execucao_id = ? AND deletado_em IS NULL ORDER BY data_pagamento", 
        (execucao_id,)
    )
    data = cursor.fetchall()
    conn.close()
    return [
        Pagamento(
            pagamento_id=row['pagamento_id'],
            execucao_id=row['execucao_id'],
            valor_pago=row['valor_pago'],
            data_pagamento=row['data_pagamento']
        ) for row in data
    ]

def create_pagamento(pagamento: Pagamento):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        INSERT INTO pagamentos (execucao_id, valor_pago, data_pagamento)
        VALUES (?, ?, ?)
    """
    params = (
        pagamento.execucao_id,
        pagamento.valor_pago,
        pagamento.data_pagamento
    )
    try:
        cursor.execute(sql, params)
        pagamento.pagamento_id = cursor.lastrowid
        conn.commit()
        logging.info(f"Pagamento salvo! ID: {pagamento.pagamento_id}")
        return pagamento   
    except conn.IntegrityError as e:
        logging.error(f"Erro de integridade ao criar pagamento: {e}")
        logging.error("Verifique se o 'execucao_id' existe.")
        return None 
    finally:
        conn.close()

def update_pagamento(pagamento: Pagamento):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        UPDATE pagamentos 
        SET execucao_id = ?, valor_pago = ?, data_pagamento = ?
        WHERE pagamento_id = ?
    """
    params = (
        pagamento.execucao_id,
        pagamento.valor_pago,
        pagamento.data_pagamento,
        pagamento.pagamento_id 
    )
    try:
        cursor.execute(sql, params)
        conn.commit()
        logging.info(f"Pagamento atualizado! ID: {pagamento.pagamento_id}")
        return pagamento   
    except conn.IntegrityError as e:
        logging.error(f"Erro de integridade ao atualizar pagamento: {e}")
        logging.error("Verifique se o 'execucao_id' existe.")
        return None 
    finally:
        conn.close()

def delete_pagamento(pagamento_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE pagamentos SET deletado_em = CURRENT_TIMESTAMP WHERE pagamento_id = ?"
    try:
        cursor.execute(sql, (pagamento_id,))
        conn.commit()
        updated = cursor.rowcount > 0
        conn.close()
        if updated:
            logging.info(f"Soft delete do Pagamento ID: {pagamento_id} realizado com sucesso.")
        else:
            logging.warn(f"Tentativa de soft delete do Pagamento ID: {pagamento_id} falhou (ID não encontrado).")
        return updated
    except conn.Error as e:
        logging.error(f"Erro ao tentar fazer soft delete do Pagamento ID {pagamento_id}: {e}")
        conn.close()
        return False