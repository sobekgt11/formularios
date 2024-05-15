document.addEventListener("DOMContentLoaded", function() {
    // Evento de clique para o botão "Enviar"
    const enviarButton = document.getElementById('enviarButton');

    const formData = {
        "novoDistribuidor": "",
        "cnpjNovoDistribuidor": "",
        "nomeCessionario": "",
        "cnpjCessionario": "",
        "emailCessionario": "",
        "contaCedente": {"value": "", "id": "null"},
        "contaCessionario": "",
        "fundos": [
            {"fundo": {"value": "", "id": "null"}, "montante": "", "quantidadeCotas": ""}
        ],
        "metadados": {
            "novoDistribuidor": {"readOnly": true, "required": true},
            "cnpjNovoDistribuidor": {"readOnly": true, "required": true},
            "nomeCessionario": {"required": true},
            "cnpjCessionario": {"required": true},
            "emailCessionario": {"required": true},
            "contaCedente": {"required": true},
            "contaCessionario": {"required": true},
            "fundos": {"required": true}
        },
        "sugestoesCessionario": [
            { "nome": "Banco BTG Pactual", "cnpj": "12.345.678/0001-90", "email": "contato@btgpactual.com" },
            { "nome": "XP Investimentos", "cnpj": "23.456.789/0001-10", "email": "contato@xpi.com.br" }
        ]
    };

    const contaCedenteOptions = [
        { "value": "Conta Cedente 1", "id": "1" },
        { "value": "Conta Cedente 2", "id": "2" },
        { "value": "Conta Cedente 3", "id": "3" }
    ];

    const fundosOptions = [
        { "value": "Fundo XYZ", "id": "123" },
        { "value": "Fundo ABC", "id": "456" },
        { "value": "Fundo DEF", "id": "789" }
    ];

    // Função para preencher os campos do formulário com os dados e metadados
    for (const key in formData) {
        if (formData.hasOwnProperty(key) && key !== "fundos" && key !== "contaCedente" && key !== "metadados" && key !== "sugestoesCessionario") {
            const field = document.getElementById(key);
            if (field) {
                field.value = formData[key];
            }
        }
    }

    // Função para aplicar metadados
    function aplicarMetadados() {
        for (const key in formData.metadados) {
            if (formData.metadados.hasOwnProperty(key)) {
                const field = document.getElementById(key);
                const metadados = formData.metadados[key];
                if (field) {
                    if (metadados.readOnly) {
                        field.readOnly = true;
                    }
                    if (metadados.required === false) {
                        field.required = false;
                    } else {
                        field.required = true; // Padrão é obrigatório
                    }
                }
            }
        }
    }

    aplicarMetadados();

    // Função para preencher as opções do select de conta cedente
    function preencherSelectContaCedente(selectElement) {
        // Certificar que a lista está vazia antes de adicionar novas opções
        selectElement.innerHTML = "";

        const emptyOption = document.createElement('option');
        emptyOption.value = "null";
        emptyOption.textContent = "Selecione uma conta";
        selectElement.appendChild(emptyOption);

        contaCedenteOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.value;
            opt.dataset.id = option.id;
            selectElement.appendChild(opt);
        });

        // Selecionar "Selecione uma conta" por padrão
        selectElement.value = "null";
    }

    // Função para preencher as opções do select de fundos
    function preencherSelectFundos(selectElement, selectedOptions = []) {
        // Certificar que a lista está vazia antes de adicionar novas opções
        const currentSelection = selectElement.value;

        selectElement.innerHTML = "";

        const emptyOption = document.createElement('option');
        emptyOption.value = "null";
        emptyOption.textContent = "Selecione um fundo";
        selectElement.appendChild(emptyOption);

        fundosOptions.forEach(option => {
            if (!selectedOptions.includes(option.id) || option.value === currentSelection) {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.value;
                opt.dataset.id = option.id;
                selectElement.appendChild(opt);
            }
        });

        // Selecionar "Selecione um fundo" por padrão
        selectElement.value = "null";
    }

    const contaCedenteSelect = document.getElementById('contaCedente');
    preencherSelectContaCedente(contaCedenteSelect);

    const fundosTable = document.getElementById('fundosTable').getElementsByTagName('tbody')[0];
    let selectedFundos = [];

    // Função para adicionar uma linha à tabela com dados opcionais
    function adicionarLinha(fundo = {"value": "", "id": "null"}, montante = '', quantidadeCotas = '') {
        const row = fundosTable.insertRow();
        const selectCell = document.createElement('select');
        selectCell.name = "fundo[]";
        preencherSelectFundos(selectCell, selectedFundos);

        selectCell.addEventListener('change', function() {
            selectedFundos = Array.from(document.querySelectorAll('select[name="fundo[]"]'))
                .map(select => select.options[select.selectedIndex].dataset.id)
                .filter(id => id !== "null");
                                                          
            // Adicionar nova linha se não houver linha vazia e houver opções disponíveis
            if (!Array.from(document.querySelectorAll('select[name="fundo[]"]')).some(select => select.value === "null") && fundosOptions.length > selectedFundos.length) {
                adicionarLinha();
            }

            removerLinhasVazias();
            atualizarFundos();
        });

        row.innerHTML = `
            <td></td>
            <td><input type="text" name="montante[]" value="${montante}"></td>
            <td><input type="text" name="quantidadeCotas[]" value="${quantidadeCotas}"></td>
        `;

        row.cells[0].appendChild(selectCell);
    }

    function atualizarFundos() {
        const selects = document.querySelectorAll('select[name="fundo[]"]');
        selects.forEach(select => {
            const currentSelection = select.value;
            preencherSelectFundos(select, selectedFundos);
            select.value = currentSelection;
        });

        // Adicionar uma nova linha se não houver linha vazia e houver opções disponíveis
        if (!Array.from(selects).some(select => select.value === "null") && fundosOptions.length > selectedFundos.length) {
            adicionarLinha();
        }
    }

    // Limpar tabela e adicionar uma linha inicial
    function inicializarTabela() {
        fundosTable.innerHTML = '';
        adicionarLinha();
    }

    inicializarTabela();

    // Remover linhas vazias exceto a primeira e a última
    function removerLinhasVazias() {
        const rows = fundosTable.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const select = row.querySelector('select[name="fundo[]"]');
            if (select && select.value === "null" && index !== rows.length - 1) {
                row.remove();
            }
        });

        // Adicionar uma nova linha se não houver linha vazia e houver opções disponíveis
        if (Array.from(fundosTable.querySelectorAll('tr')).every(row => row.querySelector('select[name="fundo[]"]').value !== "null") && fundosOptions.length > selectedFundos.length) {
            adicionarLinha();
        }
    }

    // Adicionar nova linha ao clicar no botão "Adicionar Linha"
    document.getElementById('fundosTable').addEventListener('change', function(event) {
        if (event.target && event.target.name === "fundo[]") {
            removerLinhasVazias();
            atualizarFundos();
        }
    });

    // Adicionar sugestões ao campo "Nome do Distribuidor Cessionário"
    const nomeCessionarioSelect = document.getElementById('nomeCessionario');
    const nomeCessionarioOutroInput = document.getElementById('nomeCessionarioOutro');
    const cnpjCessionarioInput = document.getElementById('cnpjCessionario');
    const emailCessionarioInput = document.getElementById('emailCessionario');

    const novoDistribuidorInput = document.getElementById('novoDistribuidor');
    const cnpjNovoDistribuidorInput = document.getElementById('cnpjNovoDistribuidor');

    function preencherSugestoes() {
        nomeCessionarioSelect.innerHTML = '';

        const emptyOption = document.createElement('option');
        emptyOption.value = "null";
        emptyOption.textContent = "Selecione um nome";
        nomeCessionarioSelect.appendChild(emptyOption);

        formData.sugestoesCessionario.forEach(sugestao => {
            const option = document.createElement('option');
            option.value = sugestao.nome;
            option.textContent = sugestao.nome;
            option.dataset.cnpj = sugestao.cnpj;
            option.dataset.email = sugestao.email;
            nomeCessionarioSelect.appendChild(option);
        });

        const outroOption = document.createElement('option');
        outroOption.value = "outro";
        outroOption.textContent = "Outro";
        nomeCessionarioSelect.appendChild(outroOption);

        nomeCessionarioSelect.value = "null";
    }

    preencherSugestoes();

    nomeCessionarioSelect.addEventListener('change', function() {
        const selectedNome = this.value;
        if (selectedNome === "null") {
            nomeCessionarioOutroInput.style.display = 'none';
            nomeCessionarioOutroInput.value = '';
            cnpjCessionarioInput.value = '';
            emailCessionarioInput.value = '';
            cnpjCessionarioInput.readOnly = true;
            emailCessionarioInput.readOnly = true;
            novoDistribuidorInput.value = '';
            cnpjNovoDistribuidorInput.value = '';
        } else if (selectedNome === "outro") {
            nomeCessionarioOutroInput.style.display = 'block';
            nomeCessionarioOutroInput.value = '';
            cnpjCessionarioInput.value = '';
            emailCessionarioInput.value = '';
            cnpjCessionarioInput.readOnly = false;
            emailCessionarioInput.readOnly = false;
            novoDistribuidorInput.value = '';
            cnpjNovoDistribuidorInput.value = '';
        } else {
            nomeCessionarioOutroInput.style.display = 'none';
            nomeCessionarioOutroInput.value = '';
            const sugestaoSelecionada = formData.sugestoesCessionario.find(sugestao => sugestao.nome === selectedNome);
            if (sugestaoSelecionada) {
                cnpjCessionarioInput.value = sugestaoSelecionada.cnpj;
                emailCessionarioInput.value = sugestaoSelecionada.email;
                cnpjCessionarioInput.readOnly = true;
                emailCessionarioInput.readOnly = true;
                novoDistribuidorInput.value = sugestaoSelecionada.nome;
                cnpjNovoDistribuidorInput.value = sugestaoSelecionada.cnpj;
            }
        }
    });

    // Atualizar campos de novo distribuidor quando os campos de cessionário forem alterados
    nomeCessionarioSelect.addEventListener('input', function() {
        novoDistribuidorInput.value = this.value;
    });

    nomeCessionarioOutroInput.addEventListener('input', function() {
        novoDistribuidorInput.value = this.value;
    });

    cnpjCessionarioInput.addEventListener('input', function() {
        cnpjNovoDistribuidorInput.value = this.value;
    });

    // Função de validação dos campos obrigatórios
    function validarCampos() {
        const requiredFields = document.querySelectorAll('[required]');
        let firstInvalidField = null;
    
        requiredFields.forEach(field => {
            const isSelectField = field.tagName.toLowerCase() === 'select';
            const isFundSelectField = field.name === 'fundo[]';
            const fundRows = document.querySelectorAll('select[name="fundo[]"]');
            const isLastSelectInTable = isFundSelectField && 
                fundRows[fundRows.length - 1] === field;
            
            if (isSelectField && (field.value === 'null' || field.value === 'Selecione um fundo') && !(isLastSelectInTable && fundRows.length > 1)) {
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                field.style.border = '2px solid red';
            } else if (!isSelectField && !field.value) {
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                field.style.border = '2px solid red';
                field.placeholder = `${field.placeholder} (campo obrigatório)`;
            } else {
                field.style.border = '';
                if (!isSelectField) {
                    field.placeholder = field.placeholder.replace(' (campo obrigatório)', '');
                }
            }
        });
    
        // Validação específica para os campos na tabela de "Fundos a Transferir"
        const fundRows = document.querySelectorAll('#fundosTable tbody tr');
        fundRows.forEach(row => {
            const fundSelect = row.querySelector('select[name="fundo[]"]');
            const montanteInput = row.querySelector('input[name="montante[]"]');
            const quantidadeCotasInput = row.querySelector('input[name="quantidadeCotas[]"]');
            const isLastRow = row === fundRows[fundRows.length - 1];
    
            if (fundSelect && (fundSelect.value === 'null' || fundSelect.value === 'Selecione um fundo') && !(isLastRow && fundRows.length > 1)) {
                fundSelect.style.border = '2px solid red';
                if (!firstInvalidField) {
                    firstInvalidField = fundSelect;
                }
            }
    
            if (fundSelect && fundSelect.value !== 'null' && fundSelect.value !== 'Selecione um fundo') {
                if (montanteInput && !montanteInput.value) {
                    montanteInput.style.border = '2px solid red';
                    if (!firstInvalidField) {
                        firstInvalidField = montanteInput;
                    }
                    montanteInput.placeholder = `${montanteInput.placeholder} (campo obrigatório)`;
                } else if (montanteInput) {
                    montanteInput.style.border = '';
                    montanteInput.placeholder = montanteInput.placeholder.replace(' (campo obrigatório)', '');
                }
    
                if (quantidadeCotasInput && !quantidadeCotasInput.value) {
                    quantidadeCotasInput.style.border = '2px solid red';
                    if (!firstInvalidField) {
                        firstInvalidField = quantidadeCotasInput;
                    }
                    quantidadeCotasInput.placeholder = `${quantidadeCotasInput.placeholder} (campo obrigatório)`;
                } else if (quantidadeCotasInput) {
                    quantidadeCotasInput.style.border = '';
                    quantidadeCotasInput.placeholder = quantidadeCotasInput.placeholder.replace(' (campo obrigatório)', '');
                }
            }
        });
    
        return firstInvalidField;
    }
    
    async function enviarFormulario(event) {
        event.preventDefault();
        const form = document.querySelector('form'); // Referência ao formulário dentro da função
        const firstInvalidField = validarCampos();
    
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({ behavior: 'smooth' });
            firstInvalidField.focus();
        } else {
            const formData = new FormData(form);
    
            // Converte FormData para um objeto
            const formObject = {};
            formData.forEach((value, key) => {
                if (key === "fundo[]") {
                    if (!formObject.fundos) {
                        formObject.fundos = [];
                    }
                    formObject.fundos.push({ nome: value });
                } else if (key === "montante[]" || key === "quantidadeCotas[]") {
                    const index = formObject.fundos.length - 1;
                    formObject.fundos[index][key.replace('[]', '')] = value;
                } else {
                    formObject[key] = value;
                }
            });

            console.log("Form obj ", formObject)
    
            // Ajusta os dados para o formato esperado no servidor
            const formObjectAdjusted = {
                nomeCessionario: formObject.nomeCessionario,
                cnpjCessionario: formObject.cnpjCessionario,
                emailCessionario: formObject.emailCessionario,
                novoDistribuidor: formObject.novoDistribuidor,
                cnpjNovoDistribuidor: formObject.cnpjNovoDistribuidor,
                contaCedente: formObject.contaCedente,
                contaCessionario: formObject.contaCessionario,
                fundos: formObject.fundos
            };
    
            console.log("Dados do Formulário Enviado:", formObjectAdjusted);
    
            try {
                const response = await fetch('/generate-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formObjectAdjusted)
                });
    
                if (response.ok) {
                    alert('Formulário enviado com sucesso!');
                } else {
                    alert('Erro ao enviar o formulário. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                alert('Erro ao enviar o formulário. Tente novamente.');
            }
        }
    }
    
    enviarButton.addEventListener('click', enviarFormulario);
    
});
