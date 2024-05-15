import pandas as pd

def load_form_data(hash_code):
    file_path = os.path.join('data', f'{hash_code}.yaml')
    with open(file_path, 'r') as file:
        data = yaml.safe_load(file)
    return pd.DataFrame(data)
