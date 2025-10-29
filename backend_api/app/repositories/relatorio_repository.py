# app/repositories/relatorio_repository.py
from app.core.database import get_db_connection

# Mark Construtor: Este repositório é diferente.
# Ele não faz CRUD. Ele executa consultas complexas (lógica de negócios)
# para gerar relatórios que a nossa API precisa.

def get_dividas_por_produtor(produtor_id: int):
    """
    Busca todas as execuções de um produtor que NÃO estão totalmente pagas.
    
    Ele calcula a soma de todos os pagamentos de uma execução e
    compara com o valor_total daquela execução.
    
    Retorna uma lista de dicionários, pronta para ser convertida em JSON.
    """
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Esta é a nossa consulta SQL "inteligente"
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
        
        -- Junta com servicos para pegar o nome
        INNER JOIN 
            servicos AS s ON e.servico_id = s.servico_id
            
        -- LEFT JOIN é crucial: pega execuções mesmo sem pagamentos
        LEFT JOIN 
            pagamentos AS p ON e.execucao_id = p.execucao_id
            
        WHERE 
            e.produtor_id = ?
            
        -- Agrupa todos os pagamentos de uma mesma execução
        GROUP BY 
            e.execucao_id, e.data_execucao, s.nome, e.valor_total
            
        -- Esta é a lógica de negócio: "em aberto"
        -- Filtra os grupos onde o total devido é > total pago
        HAVING 
            e.valor_total > COALESCE(SUM(p.valor_pago), 0.0)
            
        ORDER BY
            e.data_execucao DESC;
    """
    
    cursor.execute(sql, (produtor_id,))
    
    # fetchall() nos dá uma lista de "Rows" (tipo dicionário)
    # graças ao 'conn.row_factory = sqlite3.Row' do nosso database.py
    rows = cursor.fetchall()
    
    conn.close()
    
    # --- Monta o DTO (Data Transfer Object) ---
    # Mark Construtor: Agora, transformamos os dados do banco
    # na resposta JSON limpa que o frontend espera.
    
    relatorio = []
    for row in rows:
        valor_total = row['valor_total']
        total_pago = row['total_pago']
        saldo_devedor = valor_total - total_pago # Calculamos o que falta
        
        relatorio.append({
            "execucao_id": row['execucao_id'],
            "data_execucao": row['data_execucao'],
            "servico_nome": row['servico_nome'],
            "valor_total": valor_total,
            "total_pago": total_pago,
            "saldo_devedor": saldo_devedor
        })
        
    return relatorio