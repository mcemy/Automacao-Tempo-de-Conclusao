# Configuração e Deploy

## 📋 Pré-requisitos

- Conta no Google Apps Script
- Conta no Pipedrive com acesso à API
- Planilha no Google Sheets para logs

## 🔧 Configuração Passo a Passo

### 1. Configurar Google Apps Script

1. Acesse [Google Apps Script](https://script.google.com)
2. Clique em **Novo Projeto**
3. Renomeie o projeto para "Automação Tempo de Conclusão"
4. Delete o arquivo `Code.gs` padrão
5. Crie os seguintes arquivos e copie o conteúdo:
   - `main.gs`
   - `tempoconclusao.gs`
   - `pipedrive.gs`
   - `config.gs`

### 2. Configurar Token do Pipedrive

1. No Pipedrive, vá em **Configurações** → **Pessoal** → **Tokens de API**
2. Copie seu token de API
3. No Google Apps Script, execute a função `setToken()` uma única vez para salvar o token

### 3. Configurar Planilha de Logs

1. Crie uma planilha no Google Sheets
2. Copie o ID da planilha (da URL)
3. Atualize a constante `SHEET_ID` no arquivo `config.gs`

### 4. Obter IDs dos Campos Customizados

Para obter os IDs dos campos do Pipedrive:

```javascript
// Execute no console do navegador na página do Pipedrive
function getFieldIds() {
  fetch('https://api.pipedrive.com/v1/dealFields?api_token=SEU_TOKEN')
    .then(r => r.json())
    .then(data => {
      data.data.forEach(field => {
        console.log(`${field.name}: ${field.key}`);
      });
    });
}
getFieldIds();
```

### 5. Atualizar IDs no Código

Substitua os IDs nos arquivos `tempoconclusao.gs` pelos IDs reais dos seus campos:

- `DATA_INICIO_REGISTRO_ID`
- `DATA_PREENCHIMENTO_FORMULARIO_ID`
- `DATA_INICIO_CANCELAMENTO`
- Todos os campos em `F` (tempos de conclusão)
- Todos os campos em `TERMINO_ID`

### 6. Deploy do Google Apps Script

1. No editor, clique em **Implantar** → **Nova implantação**
2. Escolha o tipo: **Aplicativo da web**
3. Configure:
   - **Executar como**: Eu
   - **Quem tem acesso**: Qualquer pessoa
4. Clique em **Implantar**
5. Copie a URL gerada

### 7. Configurar Webhook no Pipedrive

1. No Pipedrive, vá em **Configurações** → **Webhooks**
2. Clique em **Criar webhook**
3. Configure:
   - **URL do endpoint**: Cole a URL do Google Apps Script
   - **Objeto de evento**: Deal
   - **Ações de evento**: updated, added
   - **Versão HTTP**: HTTP/1.1
4. Salve o webhook

## 🧪 Teste da Configuração

### Teste Manual

1. No Google Apps Script, execute a função `doPost` com dados de teste
2. Verifique os logs no console
3. Confirme se a planilha de logs foi criada

### Teste com Pipedrive

1. Faça uma alteração em um deal no Pipedrive
2. Verifique os logs no Google Apps Script
3. Confirme se os campos foram atualizados corretamente

## 🔍 Troubleshooting

### Webhook não está funcionando

1. Verifique se a URL do webhook está correta
2. Confirme se o Google Apps Script está implantado como aplicativo web
3. Verifique se as permissões estão configuradas corretamente

### Campos não estão sendo atualizados

1. Confirme se os IDs dos campos estão corretos
2. Verifique se o token do Pipedrive tem as permissões necessárias
3. Analise os logs de erro na planilha

### Erros de Rate Limit

A automação já possui proteção contra rate limit, mas se ocorrerem erros:

1. Aumente o tempo de espera na função `rateLimit_()`
2. Verifique se não há outras integrações fazendo muitas chamadas simultâneas

## 📊 Monitoramento

### Logs no Google Apps Script

- Vá em **Execuções** para ver logs detalhados
- Use `console.log()` para debug adicional

### Logs na Planilha

A planilha automaticamente criará abas:
- `Webhook_Deals`: Logs de operações normais
- `Erros`: Logs de erros e exceções

### Alertas

Configure alertas no Google Sheets para ser notificado de:
- Erros frequentes
- Falhas de webhook
- Campos não calculados

## 🔄 Manutenção

### Backup

- Exporte regularmente o código do Google Apps Script
- Faça backup da planilha de logs
- Mantenha registro dos IDs dos campos

### Atualizações

- Teste sempre em ambiente de desenvolvimento primeiro
- Use versionamento para controlar mudanças
- Documente todas as alterações nos IDs de campos