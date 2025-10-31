# app/models/produtor_model.py

class Produtor:
    """
    Este é o nosso Model (POCO - Plain Old CLR Object).
    Ele representa a "forma" dos dados, mas não sabe 
    como interagir com o banco de dados.
    """
    
    def __init__(self, nome, apelido=None, cpf=None, regiao=None, referencia=None, 
                 telefone=None, produtor_id=None):
        """
        Este é o construtor do nosso objeto Produtor.
        """
        self.produtor_id = produtor_id
        self.nome = nome # Obrigatório (NOT NULL)
        self.apelido = apelido
        self.cpf = cpf
        self.regiao = regiao
        self.referencia = referencia
        self.telefone = telefone

    def __repr__(self):
        """
        Ajuda a debugar, mostrando o objeto de forma legível.
        """
        return f"<Produtor {self.produtor_id}: {self.nome}>"

    def to_dict(self):
        """
        Método auxiliar para facilitar a conversão para JSON.
        """
        return {
            'id': self.produtor_id,
            'nome': self.nome,
            'apelido': self.apelido,
            'cpf': self.cpf,
            'regiao': self.regiao,
            'referencia': self.referencia,
            'telefone': self.telefone
        }