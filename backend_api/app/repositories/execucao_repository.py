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

# CÓDIGO NOVO (Consulta "Inteligente")
def get_all_execucoes(page: int, per_page: int):
    """
    (R)ead: Busca *todas* as Execucoes no banco (com paginação)
    e já inclui os nomes (Produtor/Serviço) e o total pago.
    Retorna uma *lista de dicionários* pronta para a API.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * per_page
    
    sql = """
        SELECT 
            e.execucao_id,
            e.produtor_id, 
            e.servico_id, 
            e.data_execucao,
            e.valor_total,
            e.horas_prestadas,
            
            p.nome AS produtor_nome,
            p.apelido AS produtor_apelido,
            s.nome AS servico_nome,
            
            -- Se não houver pagamentos (NULL), trata como 0.0
            COALESCE(SUM(pag.valor_pago), 0.0) AS total_pago
            
        FROM 
            execucoes AS e
        
        -- Junta com produtores para pegar o nome/apelido
        INNER JOIN 
            produtores AS p ON e.produtor_id = p.produtor_id
            
        -- Junta com servicos para pegar o nome
        INNER JOIN 
            servicos AS s ON e.servico_id = s.servico_id
            
        -- LEFT JOIN é crucial: pega execuções mesmo sem pagamentos
        LEFT JOIN 
            pagamentos AS pag ON e.execucao_id = pag.execucao_id
            
        -- Agrupa todos os pagamentos de uma mesma execução
        GROUP BY 
            e.execucao_id, e.data_execucao, e.valor_total, e.horas_prestadas,
            p.nome, p.apelido, s.nome
            
        ORDER BY
            e.data_execucao DESC
            
        LIMIT ? OFFSET ?;
    """
    
    cursor.execute(sql, (per_page, offset))
    
    # fetchall() com row_factory nos dá uma lista de "Rows" (tipo dicionário)
    rows = cursor.fetchall()
    
    conn.close()
    
    # --- Monta o DTO (Data Transfer Object) ---
    # Converte o 'Row' do SQLite (que não é JSON) para um dict padrão
    # e calcula o saldo devedor
    
    lista_execucoes = []
    for row in rows:
        valor_total = row['valor_total']
        total_pago = row['total_pago']
        saldo_devedor = valor_total - total_pago
        
        lista_execucoes.append({
            "id": row['execucao_id'], # O frontend espera 'id'
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
            # NOTA: Não precisamos mais de produtor_id ou servico_id no frontend
        })
        
    return lista_execucoes
    
def get_execucoes_count():
    """ Retorna o número total de execuções cadastradas. """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM execucoes")
    total = cursor.fetchone()[0] # Pega o primeiro valor da primeira linha
    
    conn.close()
    return total

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