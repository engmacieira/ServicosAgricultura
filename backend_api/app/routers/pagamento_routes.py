# app/routers/pagamento_routes.py
from flask import Blueprint, jsonify, request
from app.models.pagamento_model import Pagamento
import app.repositories.pagamento_repository as pagamento_repository
import app.repositories.execucao_repository as execucao_repository # Para checagem

# Mark Construtor: Criamos um novo Blueprint para 'pagamentos'
pagamento_bp = Blueprint('pagamento_bp', __name__)


# --- ROTA 1: Listar pagamentos de UMA execução (Aninhada) ---
@pagamento_bp.route('/execucoes/<int:execucao_id>/pagamentos', methods=['GET'])
def get_pagamentos_por_execucao_api(execucao_id):
    """
    Endpoint para LER (GET) todos os pagamentos de uma execução específica.
    """
    # 1. Verifica se a execução "mãe" existe
    if not execucao_repository.get_execucao_by_id(execucao_id):
        return jsonify({'erro': 'Execução não encontrada'}), 404
        
    # 2. Busca os pagamentos "filhos"
    pagamentos = pagamento_repository.get_pagamentos_by_execucao_id(execucao_id)
    return jsonify([p.to_dict() for p in pagamentos]), 200


# --- ROTA 2: Criar um pagamento para UMA execução (Aninhada) ---
@pagamento_bp.route('/execucoes/<int:execucao_id>/pagamentos', methods=['POST'])
def create_pagamento_api(execucao_id):
    """
    Endpoint para CRIAR (POST) um novo pagamento para uma execução específica.
    """
    # 1. Verifica se a execução "mãe" existe
    if not execucao_repository.get_execucao_by_id(execucao_id):
        return jsonify({'erro': 'Execução não encontrada'}), 404
        
    dados = request.json
    
    # 2. Validação de campos obrigatórios
    if 'valor_pago' not in dados or 'data_pagamento' not in dados:
        msg = 'Os campos "valor_pago" e "data_pagamento" são obrigatórios'
        return jsonify({'erro': msg}), 400

    # 3. Criamos o Model. Note que forçamos o execucao_id da URL
    novo_pagamento = Pagamento(
        execucao_id=execucao_id, # Pega da URL, garantindo a relação
        valor_pago=dados['valor_pago'],
        data_pagamento=dados['data_pagamento']
    )
    
    # 4. Mandamos o Repositório salvar
    # (Não precisamos de try/except aqui, pois já checamos a FK no passo 1)
    pagamento_salvo = pagamento_repository.create_pagamento(novo_pagamento)
        
    return jsonify(pagamento_salvo.to_dict()), 201 # 201 = Created


# --- ROTA 3: Buscar um pagamento específico (Direta) ---
@pagamento_bp.route('/pagamentos/<int:pagamento_id>', methods=['GET'])
def get_pagamento_api(pagamento_id):
    """
    Endpoint para LER (GET) um pagamento específico pelo seu ID.
    """
    pagamento = pagamento_repository.get_pagamento_by_id(pagamento_id)
    if pagamento:
        return jsonify(pagamento.to_dict())
    else:
        return jsonify({'erro': 'Pagamento não encontrado'}), 404


# --- ROTA 4: Atualizar um pagamento específico (Direta) ---
@pagamento_bp.route('/pagamentos/<int:pagamento_id>', methods=['PUT'])
def update_pagamento_api(pagamento_id):
    """
    Endpoint para ATUALIZAR (PUT) um pagamento existente.
    """
    # 1. Verifica se o pagamento existe
    if not pagamento_repository.get_pagamento_by_id(pagamento_id):
        return jsonify({'erro': 'Pagamento não encontrado'}), 404
        
    dados = request.json
    
    # 2. Validação
    campos_obrigatorios = ['execucao_id', 'valor_pago', 'data_pagamento']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({'erro': f'O campo "{campo}" é obrigatório'}), 400

    # 3. Cria o objeto atualizado
    pagamento_atualizado = Pagamento(
        pagamento_id=pagamento_id, # ID da URL
        execucao_id=dados['execucao_id'],
        valor_pago=dados['valor_pago'],
        data_pagamento=dados['data_pagamento']
    )
    
    # 4. Manda o repositório salvar
    pagamento_salvo = pagamento_repository.update_pagamento(pagamento_atualizado)
    
    # 5. Trata erro de FK (se o novo execucao_id for inválido)
    if pagamento_salvo is None:
        return jsonify({'erro': 'Falha ao atualizar. Verifique se o "execucao_id" existe.'}), 409
        
    return jsonify(pagamento_salvo.to_dict()), 200 # 200 = OK


# --- ROTA 5: Excluir um pagamento específico (Direta) ---
@pagamento_bp.route('/pagamentos/<int:pagamento_id>', methods=['DELETE'])
def delete_pagamento_api(pagamento_id):
    """
    Endpoint para EXCLUIR (DELETE) um pagamento.
    """
    # 1. Verifica se existe
    if not pagamento_repository.get_pagamento_by_id(pagamento_id):
        return jsonify({'erro': 'Pagamento não encontrado'}), 404
        
    # 2. Manda excluir
    sucesso = pagamento_repository.delete_pagamento(pagamento_id)
    
    if sucesso:
        return jsonify({'mensagem': 'Pagamento excluído com sucesso'}), 200
    else:
        return jsonify({'erro': 'Erro ao excluir pagamento'}), 500