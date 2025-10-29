# app/models/servico_model.py

class Servico:
    """
    Este é o Model (POCO) para a tabela 'servicos'.
    Ele representa a "forma" dos dados, mas não sabe 
    como interagir com o banco de dados.
    """
    
    def __init__(self, nome, valor_unitario=0.0, servico_id=None):
        """
        Construtor baseado no schema 'servicos' (database_setup.py).
        """
        self.servico_id = servico_id
        self.nome = nome # Obrigatório (NOT NULL, UNIQUE)
        self.valor_unitario = valor_unitario # Obrigatório (NOT NULL, DEFAULT 0.0)

    def __repr__(self):
        """
        (Boa prática) Ajuda a debugar, mostrando o objeto de forma legível.
        """
        return f"<Servico {self.servico_id}: {self.nome} (R$ {self.valor_unitario})>"

    def to_dict(self):
        """
        Método auxiliar para facilitar a conversão para JSON
        na camada de Rota (Router).
        """
        return {
            'id': self.servico_id,
            'nome': self.nome,
            'valor_unitario': self.valor_unitario
        }