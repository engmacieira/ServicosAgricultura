from app.core.database import get_db_connection
import logging

def get_dividas_por_produtor(produtor_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        SELECT 
            e.execucao_id,
            e.data_execucao,
            s.nome AS servico_nome,
            e.valor_total,
            
            -- Se não houver pagamentos (NULL), trata como 0.0
            COALESCE(SUM(p.valor_pago), 0.0) AS total_pago
            
        FROM 
            execucoes AS e
        
        INNER JOIN 
            servicos AS s ON e.servico_id = s.servico_id
            
        LEFT JOIN 
            pagamentos AS p ON e.execucao_id = p.execucao_id
            
        WHERE 
            e.produtor_id = ?
            
        GROUP BY 
            e.execucao_id, e.data_execucao, s.nome, e.valor_total
            
        HAVING 
            e.valor_total > COALESCE(SUM(p.valor_pago), 0.0)
            
        ORDER BY
            e.data_execucao DESC;
    """
    
    cursor.execute(sql, (produtor_id,))
    rows = cursor.fetchall()
    conn.close()
    
    relatorio = []
    for row in rows:
        valor_total = row['valor_total']
        total_pago = row['total_pago']
        saldo_devedor = valor_total - total_pago 
        relatorio.append({
            "execucao_id": row['execucao_id'],
            "data_execucao": row['data_execucao'],
            "servico_nome": row['servico_nome'],
            "valor_total": valor_total,
            "total_pago": total_pago,
            "saldo_devedor": saldo_devedor
        })
    return relatorio

def purge_deleted_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql_pagamentos = "DELETE FROM pagamentos WHERE deletado_em <= date('now', '-30 days')"
    sql_execucoes = "DELETE FROM execucoes WHERE deletado_em <= date('now', '-30 days')"
    sql_produtores = "DELETE FROM produtores WHERE deletado_em <= date('now', '-30 days')"
    sql_servicos = "DELETE FROM servicos WHERE deletado_em <= date('now', '-30 days')"

    total_deleted = 0
    
    try:
        cursor.execute(sql_pagamentos)
        deleted_count = cursor.rowcount
        total_deleted += deleted_count
        if deleted_count > 0:
            logging.info(f"[Purge] {deleted_count} pagamentos antigos excluídos permanentemente.")

        cursor.execute(sql_execucoes)
        deleted_count = cursor.rowcount
        total_deleted += deleted_count
        if deleted_count > 0:
            logging.info(f"[Purge] {deleted_count} execuções antigas excluídas permanentemente.")

        cursor.execute(sql_produtores)
        deleted_count = cursor.rowcount
        total_deleted += deleted_count
        if deleted_count > 0:
            logging.info(f"[Purge] {deleted_count} produtores antigos excluídos permanentemente.")

        cursor.execute(sql_servicos)
        deleted_count = cursor.rowcount
        total_deleted += deleted_count
        if deleted_count > 0:
            logging.info(f"[Purge] {deleted_count} serviços antigos excluídos permanentemente.")

        conn.commit()
        logging.info(f"Rotina de Purge concluída. Total de {total_deleted} registros excluídos.")
        return {"sucesso": True, "total_excluido": total_deleted}

    except conn.Error as e:
        logging.error(f"Erro durante a rotina de Purge: {e}")
        conn.rollback()
        return {"sucesso": False, "erro": str(e)}
        
    finally:
        conn.close()