# app/models/execucao_model.py

class Execucao:
    """
    Este é o Model (POCO) para a tabela 'execucoes'.
    
    Ela é uma "tabela de ligação" que registra um evento,
    conectando um Produtor (produtor_id) a um Servico (servico_id)
    em uma data específica e com valores associados.
    """
    
    def __init__(self, produtor_id: int, servico_id: int, data_execucao: str,
                 horas_prestadas: float = 0.0, valor_total: float = 0.0, 
                 execucao_id: int = None):
        """
        Construtor baseado no schema 'execucoes' (database_setup.py).
        """
        self.execucao_id = execucao_id
        self.produtor_id = produtor_id   # Foreign Key (Obrigatório)
        self.servico_id = servico_id    # Foreign Key (Obrigatório)
        self.data_execucao = data_execucao # Obrigatório (TEXT, ex: "2025-10-28")
        self.horas_prestadas = horas_prestadas
        self.valor_total = valor_total

    def __repr__(self):
        """
        (Boa prática) Ajuda a debugar.
        """
        return (f"<Execucao {self.execucao_id}: "
                f"Prod. {self.produtor_id} -> Serv. {self.servico_id} "
                f"em {self.data_execucao}>")

    def to_dict(self):
        """
        Método auxiliar para facilitar a conversão para JSON
        na camada de Rota (Router).
        """
        return {
            'id': self.execucao_id,
            'produtor_id': self.produtor_id,
            'servico_id': self.servico_id,
            'data_execucao': self.data_execucao,
            'horas_prestadas': self.horas_prestadas,
            'valor_total': self.valor_total
        }