# app/routers/execucao_routes.py
from flask import Blueprint, jsonify, request
import math # <-- ADICIONE ISSO
from app.models.execucao_model import Execucao
import app.repositories.execucao_repository as execucao_repository
import app.repositories.produtor_repository as produtor_repository # Para checagem
import app.repositories.servico_repository as servico_repository # Para checagem

# Mark Construtor: Criamos um novo Blueprint para 'execucoes'
execucao_bp = Blueprint('execucao_bp', __name__)


# --- ROTA DE LEITURA (GET ALL) ---
# CÓDIGO NOVO (com paginação)
@execucao_bp.route('/execucoes', methods=['GET'])
def get_execucoes_api():
    """
    Endpoint para LER (GET) todas as execuções (com paginação).
    """
    
    # 1. Lê os parâmetros da URL.
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', 'todos', type=str)
    
    # 2. Busca o total de itens
    total_items = execucao_repository.get_execucoes_count(status)
    if total_items == 0:
        return jsonify({
            'execucoes': [],
            'total_pages': 0,
            'current_page': 1,
            'total_items': 0
        })

    # 3. Calcula o total de páginas
    total_pages = math.ceil(total_items / per_page)
    
    # 4. Busca as execuções da PÁGINA ATUAL
    execucoes = execucao_repository.get_all_execucoes(page, per_page, status)
    
    # 5. Retorna o objeto de paginação completo
    # CÓDIGO NOVO (Não precisa mais de .to_dict())
    return jsonify({
        'execucoes': execucoes, # 'execucoes' já é uma lista de dicts
        'total_pages': total_pages,
        'current_page': page,
        'total_items': total_items
    }), 200


# --- ROTA DE LEITURA (GET BY ID) ---
@execucao_bp.route('/execucoes/<int:execucao_id>', methods=['GET'])
def get_execucao_api(execucao_id):
    """
    Endpoint para LER (GET) uma execução específica pelo ID.
    """
    execucao = execucao_repository.get_execucao_by_id(execucao_id)
    
    if execucao:
        return jsonify(execucao.to_dict())
    else:
        return jsonify({'erro': 'Execução não encontrada'}), 404


# --- ROTA DE CRIAÇÃO (POST) ---
@execucao_bp.route('/execucoes', methods=['POST'])
def create_execucao_api():
    """
    Endpoint para CRIAR (POST) uma nova execução.
    """
    dados = request.json
    
    # 1. Validação de campos obrigatórios
    campos_obrigatorios = ['produtor_id', 'servico_id', 'data_execucao']
    for campo in campos_obrigatorios:
        if campo not in dados or dados[campo] is None:
            return jsonify({'erro': f'O campo "{campo}" é obrigatório'}), 400

    # 2. Criamos a instância do Model
    nova_execucao = Execucao(
        produtor_id=dados['produtor_id'],
        servico_id=dados['servico_id'],
        data_execucao=dados['data_execucao'],
        horas_prestadas=dados.get('horas_prestadas', 0.0),
        valor_total=dados.get('valor_total', 0.0)
    )
    
    # 3. Mandamos o Repositório salvar
    execucao_salva = execucao_repository.create_execucao(nova_execucao)

    # 4. Tratamos o caso de falha (FK não encontrada)
    if execucao_salva is None:
        msg = "Não foi possível criar a execução. Verifique se o 'produtor_id' e o 'servico_id' existem."
        return jsonify({'erro': msg}), 409 # 409 = Conflito
        
    return jsonify(execucao_salva.to_dict()), 201 # 201 = Created


# --- ROTA DE ATUALIZAÇÃO (PUT) ---
@execucao_bp.route('/execucoes/<int:execucao_id>', methods=['PUT'])
def update_execucao_api(execucao_id):
    """
    Endpoint para ATUALIZAR (PUT) uma execução existente.
    """
    # 1. Verifica se a execução que queremos atualizar existe
    if not execucao_repository.get_execucao_by_id(execucao_id):
        return jsonify({'erro': 'Execução não encontrada'}), 404
        
    dados = request.json
    
    # 2. Validação (igual ao POST)
    campos_obrigatorios = ['produtor_id', 'servico_id', 'data_execucao']
    for campo in campos_obrigatorios:
        if campo not in dados or dados[campo] is None:
            return jsonify({'erro': f'O campo "{campo}" é obrigatório'}), 400

    # 3. Cria o objeto com os dados atualizados
    execucao_atualizada = Execucao(
        execucao_id=execucao_id, # Importante: Usamos o ID da URL
        produtor_id=dados['produtor_id'],
        servico_id=dados['servico_id'],
        data_execucao=dados['data_execucao'],
        horas_prestadas=dados.get('horas_prestadas', 0.0),
        valor_total=dados.get('valor_total', 0.0)
    )
    
    # 4. Mandamos o repositório atualizar
    execucao_salva = execucao_repository.update_execucao(execucao_atualizada)

    # 5. Tratamos o caso de falha (FK não encontrada)
    if execucao_salva is None:
        msg = "Não foi possível atualizar a execução. Verifique se o 'produtor_id' e o 'servico_id' existem."
        return jsonify({'erro': msg}), 409 # 409 = Conflito
        
    return jsonify(execucao_salva.to_dict()), 200 # 200 = OK


# --- ROTA DE EXCLUSÃO (DELETE) ---
@execucao_bp.route('/execucoes/<int:execucao_id>', methods=['DELETE'])
def delete_execucao_api(execucao_id):
    """
    Endpoint para EXCLUIR (DELETE) uma execução.
    """
    # 1. (Boa prática) Verificamos se existe
    if not execucao_repository.get_execucao_by_id(execucao_id):
        return jsonify({'erro': 'Execução não encontrada'}), 404
        
    # 2. Mandamos o repositório excluir
    # (Lembrete: o banco vai apagar os pagamentos em CASCADE)
    sucesso = execucao_repository.delete_execucao(execucao_id)
    
    if sucesso:
        return jsonify({'mensagem': 'Execução e pagamentos associados excluídos com sucesso'}), 200
    else:
        # Isso só aconteceria em um caso muito raro de erro no DB
        return jsonify({'erro': 'Erro ao excluir execução'}), 500