import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import yaml
import os
import hashlib
import datetime

app = Flask(__name__)
CORS(app)  # Permitir CORS para todas as rotas

logging.basicConfig(level=logging.DEBUG)

DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def generate_hash():
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
    hash_object = hashlib.sha256(timestamp.encode())
    return hash_object.hexdigest()

@app.route('/generate-form-link', methods=['POST'])
def generate_form_link():
    data = request.get_json()
    form_hash = generate_hash()
    data['dataCriacaoDoFormulario'] = datetime.datetime.now().isoformat()
    data['hash'] = form_hash
    data['status'] = "Enviado"
    data['hashAssinador'] = ""

    # Garantir que o diretório DATA_DIR exista
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    # Save data to a file
    file_path = os.path.join(DATA_DIR, f'{form_hash}.yaml')
    with open(file_path, 'w') as file:
        yaml.dump(data, file)
    
    form_link = f"http://localhost:3000/form-portabilidade?hash={form_hash}"
    return jsonify({"form_link": form_link})

@app.route('/get-form-data', methods=['GET'])
def get_form_data():
    form_hash = request.args.get('hash')
    file_path = os.path.join(DATA_DIR, f'{form_hash}.yaml')
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            data = yaml.safe_load(file)
        return jsonify(data)
    else:
        return jsonify({"error": "Data not found"}), 404

@app.route('/update-form-data', methods=['POST'])
def update_form_data():
    form_hash = request.json.get('hash')
    logging.debug(f"Received hash: {form_hash}")
    file_path = os.path.join(DATA_DIR, f'{form_hash}.yaml')
    
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            data = yaml.safe_load(file)
        
        logging.debug(f"Original data: {data}")

        # Atualizar todos os campos fornecidos no JSON se eles existirem no objeto inicial
        for key, value in request.json.items():
            if key == "fundos":
                logging.debug(f"Updating fundos: {value}")
                data['fundos'] = value  # Atualiza a lista de fundos completamente
            elif key in data:
                logging.debug(f"Updating key: {key} with value: {value}")
                data[key] = value
            else:
                logging.debug(f"Adding new key: {key} with value: {value}")
                data[key] = value
        
        with open(file_path, 'w') as file:
            yaml.dump(data, file)
        
        logging.debug(f"Updated data: {data}")

        return jsonify({"message": "Dados atualizados com sucesso"})
    else:
        return jsonify({"error": "Dados não encontrados"}), 404

if __name__ == '__main__':
    app.run(debug=True)
