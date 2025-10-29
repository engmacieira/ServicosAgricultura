# app/repositories/pagamento_repository.py
from app.core.database import get_db_connection
from app.models.pagamento_model import Pagamento

# Mark Construtor: Esta é a camada de Acesso a Dados para 'Pagamentos'.

def get_pagamento_by_id(pagamento_id: int):
    """
    (R)ead: Busca um Pagamento no banco pelo seu ID
    e retorna um *objeto* do tipo Pagamento.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM pagamentos WHERE pagamento_id = ?", (pagamento_id,))
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
    """
    (R)ead: Busca *todos* os Pagamentos associados a uma Execucao específica.
    Retorna uma *lista* de objetos Pagamento.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ordenar por data é uma boa prática
    cursor.execute(
        "SELECT * FROM pagamentos WHERE execucao_id = ? ORDER BY data_pagamento", 
        (execucao_id,)
    )
    data = cursor.fetchall()
    
    conn.close()
    
    # Mapeia cada 'row' do banco para um objeto Pagamento
    return [
        Pagamento(
            pagamento_id=row['pagamento_id'],
            execucao_id=row['execucao_id'],
            valor_pago=row['valor_pago'],
            data_pagamento=row['data_pagamento']
        ) for row in data
    ]

def create_pagamento(pagamento: Pagamento):
    """
    (C)reate: Salva um *objeto* Pagamento no banco (INSERT).
    """
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
        print(f"Pagamento salvo! ID: {pagamento.pagamento_id}")
        return pagamento
        
    except conn.IntegrityError as e:
        # 💡 Mentoria: Isso captura o erro 'FOREIGN KEY constraint failed'
        print(f"Erro de integridade ao criar pagamento: {e}")
        print("Verifique se o 'execucao_id' existe.")
        return None # Retorna None para indicar que falhou
        
    finally:
        conn.close()

def update_pagamento(pagamento: Pagamento):
    """
    (U)pdate: Atualiza um Pagamento existente no banco (UPDATE).
    """
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
        pagamento.pagamento_id # ID é o último, para o WHERE
    )
    
    try:
        cursor.execute(sql, params)
        conn.commit()
        print(f"Pagamento atualizado! ID: {pagamento.pagamento_id}")
        return pagamento
        
    except conn.IntegrityError as e:
        print(f"Erro de integridade ao atualizar pagamento: {e}")
        print("Verifique se o 'execucao_id' existe.")
        return None # Falha devido à restrição FK
        
    finally:
        conn.close()

def delete_pagamento(pagamento_id: int):
    """
    (D)elete: Exclui um Pagamento do banco pelo seu ID (DELETE).
    Retorna True se foi bem-sucedido, False caso contrário.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "DELETE FROM pagamentos WHERE pagamento_id = ?"
    
    try:
        cursor.execute(sql, (pagamento_id,))
        conn.commit()
        
        deleted = cursor.rowcount > 0
        print(f"Tentativa de exclusão do pagamento ID: {pagamento_id}. Sucesso: {deleted}")
        return deleted
        
    except conn.IntegrityError as e:
        # Improvável no DELETE, mas é uma boa prática
        print(f"Erro de integridade ao excluir pagamento: {e}")
        return False
        
    finally:
        conn.close()