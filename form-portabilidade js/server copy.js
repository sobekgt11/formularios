const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para gerar e enviar o PDF
app.post('/generate-pdf', async (req, res) => {
    try {
        const formData = req.body;
        console.log("Dados do Formulário Recebidos:", formData);

        // Cria um HTML a partir dos dados do formulário
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Formulário de Portabilidade</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { background: #fff; padding: 40px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); max-width: 800px; margin: auto; }
                    h2, p { text-align: left; color: #333; margin: 0; line-height: 1.6; }
                    .bold { font-weight: bold; }
                    label { display: block; margin-top: 10px; }
                    input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; border: 1px solid #ddd; }
                    input[readonly] { border: none; background-color: transparent; }
                    .form-group { margin-bottom: 15px; }
                    .form-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
                    .form-row .form-group { flex: 1; margin-right: 10px; }
                    .form-row .form-group:last-child { margin-right: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    table, th, td { border: 1px solid #ddd; }
                    th, td { padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .spacing { margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <p>Belo Horizonte,</p>
                    <p>À<br>
                    <span class="bold">Nome do Distribuidor Cedente:</span> INTER DTVM LTDA<br>
                    <span class="bold">Endereço do Distribuidor Cedente:</span> Avenida Barbacena, 1219 - Santo Agostinho CEP 30190-924 - Belo Horizonte<br>
                    <span class="bold">CNPJ do Distribuidor Cedente:</span> 18.945.670/0001-46<br>
                    <span class="bold">E-mail do Distribuidor Cedente:</span> transferencia.fundos@bancointer.com.br</p>
                    
                    <p class="spacing">Com cópia para:<br>
                    <span class="bold">Nome do Distribuidor Cessionário:</span> ${formData.nomeCessionario}<br>
                    <span class="bold">CNPJ do Distribuidor Cessionário:</span> ${formData.cnpjCessionario}<br>
                    <span class="bold">E-mail do Distribuidor Cessionário:</span> ${formData.emailCessionario}</p>
                    
                    <p class="bold spacing">Ref. Solicitação de Alteração de Distribuidor</p>
                    <p>Prezados senhores,</p>
                    <p>Venho, pela presente, solicitar ao INTER DTVM LTDA, inscrito no CNPJ/ MF sob o nº 18.945.670/0001-46, na qualidade de Distribuidor, que minha(s) posição(ões) de investimento no(s) produto(s) e condições descritas abaixo, com a minha devida identificação como investidor, sejam transferidas ao 
                    ${formData.novoDistribuidor}, inscrito no CNPJ/MF sob o nº ${formData.cnpjNovoDistribuidor}, mantendo a titularidade da(s) minha(s) posição(ões) de investimento.</p>

                    <div class="form-row spacing">
                        <div class="form-group">
                            <label for="contaCedente" class="bold">Conta Cedente:</label>
                            ${formData.contaCedente}
                        </div>
                        <div class="form-group">
                            <label for="contaCessionario" class="bold">Conta Cessionário:</label>
                            ${formData.contaCessionario}
                        </div>
                    </div>

                    <h3 class="spacing">Fundos a Transferir</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Fundos a Transferir</th>
                                <th>Montante</th>
                                <th>Quantidade de Cotas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.fundos.map(fundo => `
                                <tr>
                                    <td>${fundo.nome}</td>
                                    <td>${fundo.montante}</td>
                                    <td>${fundo.quantidadeCotas}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        // Configura o Puppeteer para gerar o PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        // Salvar o PDF em um arquivo temporário
        const filePath = path.join(__dirname, 'formulario.pdf');
        fs.writeFileSync(filePath, pdfBuffer);

        console.log("PDF gerado e salvo com sucesso.");

        // Enviar o PDF para a API do webhook
        const formDataToSend = new FormData();
        formDataToSend.append('file', fs.createReadStream(filePath));

        console.log("Enviando PDF para o webhook...");

        axios.post('https://webhook.site/45b8f2f6-3c0a-46fc-9934-b53416ac9c19', formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            console.log("Resposta do webhook:", response.data);
            res.send('Formulário enviado com sucesso!');
        })
        .catch(error => {
            console.error("Erro ao enviar o formulário para o webhook:", error);
            res.status(500).send('Erro ao enviar o formulário.');
        });
    } catch (error) {
        console.error("Erro ao processar o formulário:", error);
        res.status(500).send('Erro ao processar o formulário.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
