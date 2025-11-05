from app.core.database import get_db_connection
from app.models.execucao_model import Execucao
import logging
import sqlite3

def get_execucao_by_id(execucao_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM execucoes WHERE execucao_id = ? AND deletado_em IS NULL", (execucao_id,))
        data = cursor.fetchone()
        
        if data is None:
            return None 
            
        return Execucao(
            execucao_id=data['execucao_id'],
            produtor_id=data['produtor_id'],
            servico_id=data['servico_id'],
            data_execucao=data['data_execucao'],
            horas_prestadas=data['horas_prestadas'],
            valor_total=data['valor_total']
        )
    finally:
        if conn:
            conn.close()

def get_all_execucoes(page: int, per_page: int, status: str = 'todos', search_term: str = None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        offset = (page - 1) * per_page
        params = []
        where_clause = "WHERE e.deletado_em IS NULL" 
        if search_term:
            where_clause += """
            AND (
                p.nome LIKE ? OR 
                p.apelido LIKE ? OR 
                s.nome LIKE ? OR 
                e.data_execucao LIKE ? OR
                strftime('%d/%m/%Y', e.data_execucao) LIKE ?
            )
            """
            search_like = f"%{search_term}%"
            params.extend([search_like, search_like, search_like, search_like, search_like])
        
        sql_base = """
            SELECT 
                e.execucao_id, e.produtor_id, e.servico_id, 
                e.data_execucao, e.valor_total, e.horas_prestadas,
                p.nome AS produtor_nome, p.apelido AS produtor_apelido,
                s.nome AS servico_nome,
                COALESCE(SUM(pag.valor_pago), 0.0) AS total_pago
            FROM 
                execucoes AS e
            INNER JOIN 
                produtores AS p ON e.produtor_id = p.produtor_id
            INNER JOIN 
                servicos AS s ON e.servico_id = s.servico_id
            LEFT JOIN 
                pagamentos AS pag ON e.execucao_id = pag.execucao_id
        """
    
        having_clause = ""
        if status == 'pendentes':
            having_clause = "HAVING e.valor_total > COALESCE(SUM(pag.valor_pago), 0.0)"
        elif status == 'pagas':
            having_clause = "HAVING e.valor_total <= COALESCE(SUM(pag.valor_pago), 0.0)"

        group_by_clause = """
            GROUP BY 
                e.execucao_id, e.produtor_id, e.servico_id,
                e.data_execucao, e.valor_total, e.horas_prestadas,
                p.nome, p.apelido, s.nome
        """
        order_limit_clause = " ORDER BY e.data_execucao DESC LIMIT ? OFFSET ?;"

        sql = sql_base + where_clause + group_by_clause + having_clause + order_limit_clause
    
        params.extend([per_page, offset])
    
        cursor.execute(sql, params)
    
        rows = cursor.fetchall()
    
        lista_execucoes = []
        for row in rows:
            valor_total = row['valor_total']
            total_pago = row['total_pago']
        
            valor_total_float = float(valor_total or 0.0)
            total_pago_float = float(total_pago or 0.0)
        
            saldo_devedor = valor_total_float - total_pago_float
        
            lista_execucoes.append({
                "id": row['execucao_id'],
                "produtor_id": row['produtor_id'], 
                "servico_id": row['servico_id'],  
                "data_execucao": row['data_execucao'],
                "valor_total": valor_total,
                "horas_prestadas": row['horas_prestadas'],
                "produtor_nome": row['produtor_nome'],
                "produtor_apelido": row['produtor_apelido'],
                "servico_nome": row['servico_nome'],
                "total_pago": total_pago,
                "saldo_devedor": saldo_devedor
            })
        
        return lista_execucoes

    finally:
        if conn:
            conn.close()
    
def get_execucoes_count(status: str = 'todos', search_term: str = None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        params = []
        where_clause = "WHERE e.deletado_em IS NULL"
        if search_term:
            where_clause += """
            AND (
                p.nome LIKE ? OR 
                p.apelido LIKE ? OR 
                s.nome LIKE ? OR 
                e.data_execucao LIKE ? OR
                strftime('%d/%m/%Y', e.data_execucao) LIKE ?
            )
            """
            search_like = f"%{search_term}%"
            params.extend([search_like, search_like, search_like, search_like, search_like])

        having_clause = ""
        if status == 'pendentes':
            having_clause = "HAVING e.valor_total > COALESCE(SUM(pag.valor_pago), 0.0)"
        elif status == 'pagas':
            having_clause = "HAVING e.valor_total <= COALESCE(SUM(pag.valor_pago), 0.0)"

        sql_subquery = f"""
            SELECT e.execucao_id
            FROM execucoes AS e
            INNER JOIN 
                produtores AS p ON e.produtor_id = p.produtor_id
            INNER JOIN 
                servicos AS s ON e.servico_id = s.servico_id
            LEFT JOIN 
                pagamentos AS pag ON e.execucao_id = pag.execucao_id
            {where_clause}
            GROUP BY e.execucao_id, e.valor_total
            {having_clause}
        """
        
        if status == 'todos' and not search_term:
            cursor.execute("SELECT COUNT(*) FROM execucoes")
        else:
            cursor.execute(f"SELECT COUNT(*) FROM ({sql_subquery}) AS sub", params)
        
        total = cursor.fetchone()[0]
        
        return total
    
    finally:
        if conn:
            conn.close()
    
def create_execucao(execucao: Execucao):
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
        logging.info(f"Agendamento salvo! ID: {execucao.execucao_id}")
        return execucao   
    except sqlite3.Error as e:
        logging.error(f"Erro de integridade ao criar execução: {e}")
        logging.error("Verifique se o 'produtor_id' e 'servico_id' existem.")
        return None 
    finally:
        conn.close()

def update_execucao(execucao: Execucao):
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
        execucao.execucao_id 
    )
    try:
        cursor.execute(sql, params)
        conn.commit()
        logging.info(f"Execução atualizada! ID: {execucao.execucao_id}")
        return execucao   
    except conn.IntegrityError as e:
        logging.error(f"Erro de integridade ao atualizar execução: {e}")
        logging.error("Verifique se o 'produtor_id' e 'servico_id' existem.")
        return None 
    finally:
        conn.close()

def delete_execucao(execucao_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE execucoes SET deletado_em = CURRENT_TIMESTAMP WHERE execucao_id = ?"
    try:
        cursor.execute(sql, (execucao_id,))
        conn.commit()
        updated = cursor.rowcount > 0
        conn.close()
        if updated:
            logging.info(f"Soft delete da Execucao ID: {execucao_id} realizado com sucesso.")
        else:
            logging.warn(f"Tentativa de soft delete da Execucao ID: {execucao_id} falhou (ID não encontrado).")
        return updated
        
    except conn.Error as e:
        logging.error(f"Erro ao tentar fazer soft delete da Execucao ID {execucao_id}: {e}")
        conn.close()
        return False
    
def get_execucao_by_details(produtor_id: int, servico_id: int, data_execucao: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        SELECT execucao_id FROM execucoes 
        WHERE produtor_id = ? 
          AND servico_id = ? 
          AND data_execucao = ? 
          AND deletado_em IS NULL
    """
    data_limpa = str(data_execucao).split(' ')[0]
    
    cursor.execute(sql, (produtor_id, servico_id, data_limpa))
    data = cursor.fetchone()
    conn.close()
    if data:
        return data['execucao_id']
    return None