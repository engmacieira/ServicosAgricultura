from flask import Blueprint, jsonify, request
import logging
import pandas as pd
import math 

import app.repositories.produtor_repository as produtor_repository
import app.repositories.servico_repository as servico_repository
import app.repositories.execucao_repository as execucao_repository
import app.repositories.pagamento_repository as pagamento_repository
from app.models.pagamento_model import Pagamento
from app.models.execucao_model import Execucao
from app.models.produtor_model import Produtor
from app.models.servico_model import Servico

admin_bp = Blueprint('admin_bp', __name__)

def importar_produtores(df):
    total_importados = 0
    erros = []
    
    mapeamento_colunas = {
        'Nome': 'nome',
        'Apelido': 'apelido',
        'CPF': 'cpf',
        'Região': 'regiao',
        'Referência': 'referencia',
        'Telefone': 'telefone'
    }
    df.rename(columns=mapeamento_colunas, inplace=True)

    for index, row in df.iterrows():
        if 'nome' not in row or pd.isna(row['nome']):
            logging.warn(f"[Import] Linha {index+2} pulada: 'Nome' está vazio.")
            continue
        
        try:
            novo_produtor = Produtor(
                nome=row['nome'],
                apelido=row.get('apelido') if pd.notna(row.get('apelido')) else None,
                cpf=str(row.get('cpf')) if pd.notna(row.get('cpf')) else None, 
                regiao=row.get('regiao') if pd.notna(row.get('regiao')) else None,
                referencia=row.get('referencia') if pd.notna(row.get('referencia')) else None,
                telefone=str(row.get('telefone')) if pd.notna(row.get('telefone')) else None 
            )
            produtor_repository.create_produtor(novo_produtor)
            total_importados += 1
        except Exception as e:
            logging.error(f"[Import] Erro ao importar produtor na linha {index+2}: {e}")
            erros.append(f"Linha {index+2}: {e}")

    return total_importados, erros

def importar_servicos(df):
    total_importados = 0
    erros = []
    
    mapeamento_colunas = {
        'Nome': 'nome',
        'Valor Unitário': 'valor_unitario',
        'Valor': 'valor_unitario' 
    }
    df.rename(columns=mapeamento_colunas, inplace=True)

    for index, row in df.iterrows():
        if 'nome' not in row or pd.isna(row['nome']) or 'valor_unitario' not in row or pd.isna(row['valor_unitario']):
            logging.warn(f"[Import] Linha {index+2} pulada: 'Nome' ou 'Valor Unitário' estão vazios.")
            continue
            
        try:
            novo_servico = Servico(
                nome=row['nome'],
                valor_unitario=float(row['valor_unitario'])
            )
            servico_salvo = servico_repository.create_servico(novo_servico)
            if servico_salvo:
                total_importados += 1
            else:
                 erros.append(f"Linha {index+2}: Serviço '{row['nome']}' já existe ou falhou ao salvar.")
        except Exception as e:
            logging.error(f"[Import] Erro ao importar serviço na linha {index+2}: {e}")
            erros.append(f"Linha {index+2}: {e}")
            
    return total_importados, erros

def importar_execucoes(df):
    total_importados = 0
    erros = []
    
    mapeamento_colunas = {
        'Produtor': 'produtor_nome',     
        'Serviço': 'servico_nome',      
        'Data': 'data_execucao',      
        'Horas': 'horas_prestadas',   
        'Valor Total': 'valor_total'  
    }
    df.rename(columns=mapeamento_colunas, inplace=True)

    for index, row in df.iterrows():
        try:   
            nome_produtor = row.get('produtor_nome')
            nome_servico = row.get('servico_nome')
            data_execucao = row.get('data_execucao')

            if pd.isna(nome_produtor) or pd.isna(nome_servico) or pd.isna(data_execucao):
                erros.append(f"Linha {index+2}: Produtor, Serviço ou Data estão vazios. Linha pulada.")
                continue
            
            produtor_id = produtor_repository.get_produtor_by_nome(nome_produtor)
            servico_id = servico_repository.get_servico_by_nome(nome_servico)

            if not produtor_id:
                erros.append(f"Linha {index+2}: Produtor '{nome_produtor}' não encontrado no banco. (Verifique maiúsculas/minúsculas). Linha pulada.")
                continue
            if not servico_id:
                erros.append(f"Linha {index+2}: Serviço '{nome_servico}' não encontrado no banco. (Verifique maiúsculas/minúsculas). Linha pulada.")
                continue
            
            horas = row.get('horas_prestadas')
            valor = row.get('valor_total')
            
            data_formatada = str(data_execucao).split(' ')[0]

            nova_execucao = Execucao(
                produtor_id=produtor_id,
                servico_id=servico_id,
                data_execucao=data_formatada,
                horas_prestadas=float(horas) if pd.notna(horas) else 0.0,
                valor_total=float(valor) if pd.notna(valor) else 0.0
            )
            execucao_repository.create_execucao(nova_execucao)
            total_importados += 1
        except Exception as e:
            logging.error(f"[Import] Erro ao importar execução na linha {index+2}: {e}")
            erros.append(f"Linha {index+2}: {e}")

    return total_importados, erros

def importar_pagamentos(df):
    total_importados = 0
    erros = []
    
    mapeamento_colunas = {
        'Produtor': 'produtor_nome',     
        'Serviço': 'servico_nome',      
        'Data da Execução': 'data_execucao', 
        'Valor Pago': 'valor_pago',
        'Data do Pagamento': 'data_pagamento' 
    }
    df.rename(columns=mapeamento_colunas, inplace=True)

    for index, row in df.iterrows():
        try:

            nome_produtor = row.get('produtor_nome')
            nome_servico = row.get('servico_nome')
            data_execucao = row.get('data_execucao')
            valor_pago = row.get('valor_pago')
            data_pagamento = row.get('data_pagamento')

            if pd.isna(nome_produtor) or pd.isna(nome_servico) or pd.isna(data_execucao) or pd.isna(valor_pago) or pd.isna(data_pagamento):
                erros.append(f"Linha {index+2}: Uma das colunas obrigatórias está vazia. Linha pulada.")
                continue
            
            produtor_id = produtor_repository.get_produtor_by_nome(nome_produtor)
            servico_id = servico_repository.get_servico_by_nome(nome_servico)

            if not produtor_id or not servico_id:
                erros.append(f"Linha {index+2}: Produtor '{nome_produtor}' ou Serviço '{nome_servico}' não encontrado. Linha pulada.")
                continue

            data_exec_limpa = str(data_execucao).split(' ')[0]
            execucao_id = execucao_repository.get_execucao_by_details(produtor_id, servico_id, data_exec_limpa)
            
            if not execucao_id:
                erros.append(f"Linha {index+2}: Nenhuma execução encontrada para Prod/Serv/Data ({nome_produtor}/{nome_servico}/{data_exec_limpa}). Linha pulada.")
                continue
            
            data_pag_limpa = str(data_pagamento).split(' ')[0]

            novo_pagamento = Pagamento(
                execucao_id=execucao_id,
                valor_pago=float(valor_pago),
                data_pagamento=data_pag_limpa
            )
            pagamento_repository.create_pagamento(novo_pagamento)
            total_importados += 1
        except Exception as e:
            logging.error(f"[Import] Erro ao importar pagamento na linha {index+2}: {e}")
            erros.append(f"Linha {index+2}: {e}")

    return total_importados, erros

@admin_bp.route('/admin/importar/<string:tipo>', methods=['POST'])
def importar_dados_api(tipo):
    dados = request.json
    file_path = dados.get('file_path')

    if not file_path:
        return jsonify({'sucesso': False, 'erro': 'Caminho do arquivo (file_path) não fornecido.'}), 400

    try:
        df = pd.read_excel(file_path, engine='openpyxl')
    except FileNotFoundError:
        return jsonify({'sucesso': False, 'erro': f'Arquivo não encontrado: {file_path}'}), 404
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro ao ler o arquivo Excel: {e}'}), 500

    
    total_importados = 0
    erros = []

    if tipo == 'produtores':
        total_importados, erros = importar_produtores(df)
    elif tipo == 'servicos':
        total_importados, erros = importar_servicos(df)
    elif tipo == 'execucoes':
        total_importados, erros = importar_execucoes(df)
    elif tipo == 'pagamentos':
        total_importados, erros = importar_pagamentos(df)
    else:
        return jsonify({'sucesso': False, 'erro': f'Tipo de importação desconhecido: {tipo}'}), 400

    if total_importados > 0:
        mensagem = f"{total_importados} registro(s) de '{tipo}' importados com sucesso."
        if erros:
            mensagem += f" {len(erros)} linhas falharam."
        return jsonify({
            "sucesso": True,
            "mensagem": mensagem,
            "total": total_importados,
            "erros": erros
        }), 201
    else:
        mensagem_erro = f"Nenhum registro de '{tipo}' foi importado."
        if erros:
             mensagem_erro = f"Falha na importação de '{tipo}'."
        return jsonify({
            "sucesso": False,
            "erro": mensagem_erro,
            "erros": erros
        }), 400