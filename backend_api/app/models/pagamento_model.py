# app/models/pagamento_model.py

class Pagamento:
    """
    Este é o Model (POCO) para a tabela 'pagamentos'.
    
    Ele representa um "pagamento filho" associado a uma
    'Execucao' (mãe).
    """
    
    def __init__(self, execucao_id: int, valor_pago: float, 
                 data_pagamento: str, pagamento_id: int = None):
        """
        Construtor baseado no schema 'pagamentos' (database_setup.py).
        """
        self.pagamento_id = pagamento_id
        self.execucao_id = execucao_id  # Foreign Key (Obrigatório)
        self.valor_pago = valor_pago      # Obrigatório
        self.data_pagamento = data_pagamento # Obrigatório (ex: "2025-11-01")

    def __repr__(self):
        """
        (Boa prática) Ajuda a debugar.
        """
        return (f"<Pagamento {self.pagamento_id}: "
                f"R$ {self.valor_pago} para Exec. {self.execucao_id}>")

    def to_dict(self):
        """
        Método auxiliar para facilitar a conversão para JSON
        na camada de Rota (Router).
        """
        return {
            'id': self.pagamento_id,
            'execucao_id': self.execucao_id,
            'valor_pago': self.valor_pago,
            'data_pagamento': self.data_pagamento
        }