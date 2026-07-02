import json
import os

notebook_path = r"C:\CodeProjects\SmartBabyScale\MachineLearning\SmartBabyScale_Training.ipynb"

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

code = []
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        # Comment out magic commands and display functions
        filtered_source = []
        for line in source.split('\n'):
            if line.startswith('%'):
                continue
            if 'display(' in line:
                continue
            filtered_source.append(line)
        code.append('\n'.join(filtered_source))

full_script = "\n\n".join(code)

script_path = r"C:\CodeProjects\SmartBabyScale\MachineLearning\run_notebook.py"
with open(script_path, 'w', encoding='utf-8') as f:
    f.write(full_script)

print(f"Generated {script_path}")
