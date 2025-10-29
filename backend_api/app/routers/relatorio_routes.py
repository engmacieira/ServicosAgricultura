# app/routers/relatorio_routes.py
from flask import Blueprint, jsonify, request
import app.repositories.relatorio_repository as relatorio_repository
import app.repositories.produtor_repository as produtor_repository # Para validar

# Mark Construtor: Este é o Blueprint para nossos endpoints
# de lógica de negócios e relatórios.
relatorio_bp = Blueprint('relatorio_bp', __name__)


@relatorio_bp.route('/api/relatorios/produtor/<int:produtor_id>/dividas', methods=['GET'])
def get_relatorio_dividas_produtor_api(produtor_id):
    """
    Endpoint para LER (GET) o relatório de dívidas
    (execuções não pagas) de um produtor específico.
    """
    
    # 1. (Boa Prática) Validar se o produtor existe
    #    antes de rodar uma consulta complexa.
    produtor = produtor_repository.get_produtor_by_id(produtor_id)
    if not produtor:
        return jsonify({'erro': 'Produtor não encontrado'}), 404
        
    # 2. O Controlador (Rota) chama o Repositório
    #    que faz todo o trabalho pesado de SQL.
    try:
        relatorio_dividas = relatorio_repository.get_dividas_por_produtor(produtor_id)
        
        # 3. Retorna a lista (DTO) pronta que o repositório montou
        return jsonify(relatorio_dividas), 200
        
    except Exception as e:
        # Uma proteção genérica caso algo dê errado na consulta
        print(f"Erro ao gerar relatório de dívidas: {e}")
        return jsonify({'erro': 'Erro interno ao processar o relatório'}), 500