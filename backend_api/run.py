# run.py
from app import create_app

# Chamamos nossa "fábrica" para criar a aplicação
app = create_app()

# --- Ponto de entrada para rodar o servidor ---
if __name__ == '__main__':
    # Mark Construtor: Usamos debug=True por enquanto, para desenvolvimento.
    app.run(debug=True)