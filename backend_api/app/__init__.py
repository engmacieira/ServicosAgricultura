# app/__init__.py
from flask import Flask

def create_app():
    """
    Esta é a "Application Factory" (Fábrica de Aplicação).
    Ela cria, configura e "monta" nossa aplicação Flask.
    """
    app = Flask(__name__)

    # --- Registro de Blueprints ---
    # Mark Construtor: Importamos todos os nossos módulos de rotas.
    
    # 1. Blueprint de Produtores
    from app.routers.produtor_routes import produtor_bp
    
    # 2. Blueprint de Serviços
    from app.routers.servico_routes import servico_bp
    
    # 3. Blueprint de Execuções
    from app.routers.execucao_routes import execucao_bp
    
    # 4. Blueprint de Pagamentos
    from app.routers.pagamento_routes import pagamento_bp
    
    # 5. Blueprint de Relatórios (NOVO)
    from app.routers.relatorio_routes import relatorio_bp
    
    
    # Mark Construtor: Agora, registramos (plugamos) todos eles na aplicação.
    
    app.register_blueprint(produtor_bp, url_prefix='/api')   # Rotas /api/produtores
    app.register_blueprint(servico_bp, url_prefix='/api')    # Rotas /api/servicos
    app.register_blueprint(execucao_bp, url_prefix='/api')   # Rotas /api/execucoes
    app.register_blueprint(pagamento_bp, url_prefix='/api')  # Rotas /api/pagamentos e aninhadas
    app.register_blueprint(relatorio_bp, url_prefix='/api')  # Rotas /api/relatorios (NOVO)
    

    # Rota de verificação de saúde (Health Check)
    @app.route('/health')
    def health_check():
        """Verifica se o servidor está no ar."""
        return "Servidor Flask (Refatorado) no ar e saudável!"

    return app