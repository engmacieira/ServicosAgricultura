# app/routers/servico_routes.py
from flask import Blueprint, jsonify, request
from app.models.servico_model import Servico
import app.repositories.servico_repository as servico_repository

# Mark Construtor: Criamos um novo Blueprint para 'servicos'
servico_bp = Blueprint('servico_bp', __name__)


# --- ROTA DE LEITURA (GET ALL) ---
@servico_bp.route('/api/servicos', methods=['GET'])
def get_servicos_api():
    """
    Endpoint para LER (GET) todos os serviços.
    """
    # O Controlador chama o Repositório
    servicos = servico_repository.get_all_servicos()
    
    # Convertemos cada objeto Servico em um dicionário
    return jsonify([s.to_dict() for s in servicos])


# --- ROTA DE LEITURA (GET BY ID) ---
@servico_bp.route('/api/servicos/<int:servico_id>', methods=['GET'])
def get_servico_api(servico_id):
    """
    Endpoint para LER (GET) um serviço específico pelo ID.
    """
    servico = servico_repository.get_servico_by_id(servico_id)
    
    if servico:
        return jsonify(servico.to_dict())
    else:
        return jsonify({'erro': 'Serviço não encontrado'}), 404


# --- ROTA DE CRIAÇÃO (POST) ---
@servico_bp.route('/api/servicos', methods=['POST'])
def create_servico_api():
    """
    Endpoint para CRIAR (POST) um novo serviço.
    """
    dados = request.json
    
    # 1. Validação dos dados de entrada
    if 'nome' not in dados or not dados['nome']:
        return jsonify({'erro': 'O campo "nome" é obrigatório'}), 400
    if 'valor_unitario' not in dados:
        return jsonify({'erro': 'O campo "valor_unitario" é obrigatório'}), 400

    # 2. Criamos a instância do Model
    novo_servico = Servico(
        nome=dados['nome'],
        valor_unitario=float(dados['valor_unitario']) # É bom garantir que é float
    )
    
    # 3. Mandamos o Repositório salvar
    servico_salvo = servico_repository.create_servico(novo_servico)

    # 4. Tratamos o caso de falha (nome duplicado)
    if servico_salvo is None:
        return jsonify({'erro': f"Serviço com nome '{novo_servico.nome}' já existe."}), 409 # 409 = Conflito
        
    return jsonify(servico_salvo.to_dict()), 201 # 201 = Created


# --- ROTA DE ATUALIZAÇÃO (PUT) ---
@servico_bp.route('/api/servicos/<int:servico_id>', methods=['PUT'])
def update_servico_api(servico_id):
    """
    Endpoint para ATUALIZAR (PUT) um serviço existente.
    """
    # 1. Verifica se existe
    if not servico_repository.get_servico_by_id(servico_id):
        return jsonify({'erro': 'Serviço não encontrado'}), 404
        
    dados = request.json
    
    # 2. Validação (igual ao POST)
    if 'nome' not in dados or not dados['nome']:
        return jsonify({'erro': 'O campo "nome" é obrigatório'}), 400
    if 'valor_unitario' not in dados:
        return jsonify({'erro': 'O campo "valor_unitario" é obrigatório'}), 400

    # 3. Cria o objeto com os dados atualizados
    servico_atualizado = Servico(
        servico_id=servico_id, # Importante: Usamos o ID da URL
        nome=dados['nome'],
        valor_unitario=float(dados['valor_unitario'])
    )
    
    # 4. Mandamos o repositório atualizar
    servico_salvo = servico_repository.update_servico(servico_atualizado)

    # 5. Tratamos o caso de falha (nome duplicado)
    if servico_salvo is None:
        return jsonify({'erro': f"Serviço com nome '{servico_atualizado.nome}' já existe."}), 409
        
    return jsonify(servico_salvo.to_dict()), 200 # 200 = OK


# --- ROTA DE EXCLUSÃO (DELETE) ---
@servico_bp.route('/api/servicos/<int:servico_id>', methods=['DELETE'])
def delete_servico_api(servico_id):
    """
    Endpoint para EXCLUIR (DELETE) um serviço.
    """
    # 1. (Boa prática) Verificamos se existe
    if not servico_repository.get_servico_by_id(servico_id):
        return jsonify({'erro': 'Serviço não encontrado'}), 404
        
    # 2. Mandamos o repositório excluir
    sucesso = servico_repository.delete_servico(servico_id)
    
    if sucesso:
        return jsonify({'mensagem': 'Serviço excluído com sucesso'}), 200
    else:
        # 💡 Mentoria: Este é o erro de 'FOREIGN KEY'
        # que tratamos no repositório.
        return jsonify({'erro': 'Este serviço não pode ser excluído pois está em uso por uma ou mais execuções.'}), 409 # 409 = Conflito