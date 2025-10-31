# app/routers/produtor_routes.py
from flask import Blueprint, jsonify, request
from app.models.produtor_model import Produtor
import app.repositories.produtor_repository as produtor_repository
import math

produtor_bp = Blueprint('produtor_bp', __name__)


# --- ROTA (GET ALL) ---
# CÓDIGO NOVO (com paginação)
@produtor_bp.route('/produtores', methods=['GET'])
def get_produtores_api():
    """ Endpoint para LER (GET) todos os produtores (com paginação) """
    
    # 1. Lê os parâmetros da URL. Padrão: Página 1, 10 por página.
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 2. Busca o total de itens (para calcular o total de páginas)
    total_items = produtor_repository.get_produtores_count()
    if total_items == 0:
        return jsonify({
            'produtores': [],
            'total_pages': 0,
            'current_page': 1,
            'total_items': 0
        })

    # 3. Calcula o total de páginas (Ex: 53 itens / 10 = 5.3 -> teto = 6 páginas)
    total_pages = math.ceil(total_items / per_page)
    
    # 4. Busca os produtores da PÁGINA ATUAL
    produtores = produtor_repository.get_all_produtores(page, per_page)
    
    # 5. Retorna o objeto de paginação completo
    return jsonify({
        'produtores': [p.to_dict() for p in produtores], # A lista de dados
        'total_pages': total_pages,    # O total de páginas
        'current_page': page,          # A página atual
        'total_items': total_items     # O total de registros
    }), 200


# --- ROTA (GET BY ID) ---
@produtor_bp.route('/produtores/<int:produtor_id>', methods=['GET'])
def get_produtor_api(produtor_id):
    """ Endpoint para LER (GET) um produtor específico """
    produtor = produtor_repository.get_produtor_by_id(produtor_id)
    if produtor:
        return jsonify(produtor.to_dict())
    else:
        return jsonify({'erro': 'Produtor não encontrado'}), 404


# --- ROTA (CREATE) ---
@produtor_bp.route('/produtores', methods=['POST'])
def create_produtor_api():
    """ Endpoint para CRIAR (POST) um novo produtor """
    dados = request.json
    if 'nome' not in dados or not dados['nome']:
        return jsonify({'erro': 'O campo "nome" é obrigatório'}), 400

    novo_produtor = Produtor(
        nome=dados['nome'],
        apelido=dados.get('apelido'),
        cpf=dados.get('cpf'),
        regiao=dados.get('regiao'),
        referencia=dados.get('referencia'),
        telefone=dados.get('telefone')
    )
    produtor_salvo = produtor_repository.create_produtor(novo_produtor)
    return jsonify(produtor_salvo.to_dict()), 201


# --- ROTA (UPDATE) ---
@produtor_bp.route('/produtores/<int:produtor_id>', methods=['PUT'])
def update_produtor_api(produtor_id):
    """ Endpoint para ATUALIZAR (PUT) um produtor existente """
    if not produtor_repository.get_produtor_by_id(produtor_id):
        return jsonify({'erro': 'Produtor não encontrado'}), 404
        
    dados = request.json
    if 'nome' not in dados or not dados['nome']:
        return jsonify({'erro': 'O campo "nome" é obrigatório'}), 400

    produtor_atualizado = Produtor(
        produtor_id=produtor_id,
        nome=dados['nome'],
        apelido=dados.get('apelido'),
        cpf=dados.get('cpf'),
        regiao=dados.get('regiao'),
        referencia=dados.get('referencia'),
        telefone=dados.get('telefone')
    )
    produtor_salvo = produtor_repository.update_produtor(produtor_atualizado)
    return jsonify(produtor_salvo.to_dict()), 200


# --- ROTA (DELETE) ---
@produtor_bp.route('/produtores/<int:produtor_id>', methods=['DELETE'])
def delete_produtor_api(produtor_id):
    """ Endpoint para EXCLUIR (DELETE) um produtor """
    if not produtor_repository.get_produtor_by_id(produtor_id):
        return jsonify({'erro': 'Produtor não encontrado'}), 404
        
    sucesso = produtor_repository.delete_produtor(produtor_id)
    
    if sucesso:
        return jsonify({'mensagem': 'Produtor excluído com sucesso'}), 200
    else:
        # Erro de integridade (ON DELETE RESTRICT)
        return jsonify({'erro': 'Erro ao excluir produtor. Verifique se ele possui execuções.'}), 409