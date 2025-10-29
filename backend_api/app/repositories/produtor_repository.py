# app/repositories/produtor_repository.py
from app.core.database import get_db_connection
from app.models.produtor_model import Produtor

# Mark Construtor: Esta é a camada de Acesso a Dados (Repository).
# É a única que deve conter SQL e interagir com o banco.
# Agora está com o CRUD completo!

def get_produtor_by_id(produtor_id):
    """
    (R)ead: Busca um Produtor no banco de dados pelo seu ID
    e retorna um *objeto* do tipo Produtor.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM produtores WHERE produtor_id = ?", (produtor_id,))
    data = cursor.fetchone() # Pega o primeiro (e único) resultado
    
    conn.close()
    
    if data is None:
        return None # Não achamos o produtor
    
    # Mapeia os dados do banco para o nosso objeto Produtor
    return Produtor(
        produtor_id=data['produtor_id'],
        nome=data['nome'],
        cpf=data['cpf'],
        regiao=data['regiao'],
        referencia=data['referencia'],
        telefone=data['telefone']
    )

# --- NOVO CÓDIGO (Listar Todos) ---

def get_all_produtores():
    """
    (R)ead: Busca *todos* os Produtores no banco.
    Retorna uma *lista* de objetos Produtor, ordenados por nome.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Mark Construtor: Exatamente como você pediu na "User Story",
    # estamos ordenando por nome (ordem alfabética).
    cursor.execute("SELECT * FROM produtores ORDER BY nome")
    data = cursor.fetchall() # Pega todos os resultados
    
    conn.close()
    
    # Mapeia cada 'row' do banco para um objeto Produtor
    return [
        Produtor(
            produtor_id=row['produtor_id'],
            nome=row['nome'],
            cpf=row['cpf'],
            regiao=row['regiao'],
            referencia=row['referencia'],
            telefone=row['telefone']
        ) for row in data
    ]

def create_produtor(produtor: Produtor):
    """
    (C)reate: Salva um *objeto* Produtor no banco de dados (INSERT).
    Como é um novo produtor, ele atualiza o ID do objeto.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO produtores (nome, cpf, regiao, referencia, telefone)
        VALUES (?, ?, ?, ?, ?)
    """
    
    cursor.execute(sql, (produtor.nome, produtor.cpf, produtor.regiao, 
                         produtor.referencia, produtor.telefone))
    
    # 💡 Dica: Atualizamos o objeto original com o ID
    # que o banco gerou (autoincrement).
    produtor.produtor_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    print(f"Objeto salvo! ID: {produtor.produtor_id}") # Log de debug
    return produtor

def update_produtor(produtor: Produtor):
    """
    (U)pdate: Atualiza um Produtor existente no banco (UPDATE).
    O produtor_id DEVE estar no objeto.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE produtores 
        SET nome = ?, cpf = ?, regiao = ?, referencia = ?, telefone = ?
        WHERE produtor_id = ?
    """
    
    # A ordem dos parâmetros é crucial e deve bater com o SQL
    params = (
        produtor.nome, 
        produtor.cpf, 
        produtor.regiao, 
        produtor.referencia, 
        produtor.telefone,
        produtor.produtor_id # O ID é o último, para o WHERE
    )
    
    cursor.execute(sql, params)
    
    conn.commit()
    conn.close()
    
    print(f"Objeto atualizado! ID: {produtor.produtor_id}")
    return produtor

def delete_produtor(produtor_id: int):
    """
    (D)elete: Exclui um Produtor do banco pelo seu ID (DELETE).
    Retorna True se foi bem-sucedido, False caso contrário.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "DELETE FROM produtores WHERE produtor_id = ?"
    
    cursor.execute(sql, (produtor_id,))
    
    conn.commit()
    
    # cursor.rowcount nos diz quantas linhas foram afetadas.
    # Se for > 0, significa que o DELETE funcionou.
    deleted = cursor.rowcount > 0
    
    conn.close()
    
    print(f"Tentativa de exclusão do ID: {produtor_id}. Sucesso: {deleted}")
    return deleted