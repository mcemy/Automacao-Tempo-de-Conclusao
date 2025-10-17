# 🚀 Automação - Tempo de Conclusão

<div align="center">
  <img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Apps Script">
  <img src="https://img.shields.io/badge/Pipedrive-FF6B35?style=for-the-badge&logo=pipedrive&logoColor=white" alt="Pipedrive">
  <img src="https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white" alt="Google Sheets">
</div>

## 📋 Descrição

Sistema de automação desenvolvido em Google Apps Script que calcula automaticamente o tempo de conclusão de diferentes setores baseado em eventos de webhook do Pipedrive. A automação monitora mudanças em deals e calcula os tempos entre etapas de diferentes processos.

## ⚡ Funcionalidades

- **Webhook Pipedrive**: Recebe eventos em tempo real do Pipedrive
- **Cálculo Automático**: Calcula tempos de conclusão entre etapas
- **Rate Limiting**: Controle de chamadas à API para evitar limites
- **Sistema de Cache**: Evita processamento duplicado
- **Logs Detalhados**: Registra todas as operações em Google Sheets
- **Tratamento de Erros**: Sistema robusto de tratamento e log de erros

## 🏗️ Setores Monitorados

A automação calcula o tempo de conclusão para os seguintes setores:

- 📋 **Triagem**
- 📄 **Contratos** 
- 🏛️ **ITBI**
- 👤 **Titularidade**
- 📝 **Registro**
- 🏠 **Desocupação**
- 🏛️ **IPTU**
- 🏢 **Condomínio**
- ⚖️ **Leilões**
- ❌ **Cancelamento**

## 📁 Estrutura do Projeto

```
├── main.gs              # Webhook principal e processamento de eventos
├── tempoconclusao.gs    # Lógica de cálculo dos tempos
├── pipedrive.gs         # Integração com API do Pipedrive
├── config.gs            # Configurações e utilidades
├── .env.example         # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
└── README.md            # Este arquivo
```

## 🔧 Configuração

### 1. Preparar o Ambiente

1. Clone este repositório
2. Copie `.env.example` para `.env`
3. Configure suas variáveis de ambiente no `.env`

### 2. Configurar Google Apps Script

1. Acesse [Google Apps Script](https://script.google.com)
2. Crie um novo projeto
3. Copie o conteúdo dos arquivos `.gs` para o editor
4. Configure as propriedades do script com seu token do Pipedrive

### 3. Configurar Webhook no Pipedrive

1. No Pipedrive, vá em **Configurações** > **Webhooks**
2. Crie um novo webhook para eventos de **Deal**
3. Configure a URL do seu Google Apps Script
4. Selecione os eventos: `updated`, `added`

### 4. Configurar Google Sheets

1. Crie uma planilha no Google Sheets
2. Copie o ID da planilha
3. Configure o ID no arquivo `config.gs`

## 🔑 Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

| Variável | Descrição |
|----------|-----------|
| `PIPEDRIVE_TOKEN` | Token de API do Pipedrive |
| `SHEET_ID` | ID da planilha Google Sheets |
| `SHEET_NAME` | Nome da aba da planilha |
| `DATA_INICIO_REGISTRO_ID` | ID do campo de data de início do registro |
| `DATA_PREENCHIMENTO_FORMULARIO_ID` | ID do campo de data de preenchimento |
| `DATA_INICIO_CANCELAMENTO` | ID do campo de data de início do cancelamento |

> **⚠️ Importante**: Nunca commite o arquivo `.env` com dados reais!

## 🚀 Deploy

### Google Apps Script

1. No editor do Google Apps Script, clique em **Implantar**
2. Escolha **Nova implantação**
3. Selecione o tipo **Aplicativo da web**
4. Configure as permissões de acesso
5. Copie a URL gerada para configurar no Pipedrive

### Webhook do Pipedrive

Configure a URL do webhook no Pipedrive apontando para sua implantação do Google Apps Script.

## 📊 Logs e Monitoramento

A automação registra logs detalhados em uma planilha Google Sheets com as seguintes informações:

- **Timestamp**: Data e hora do evento
- **Deal ID**: ID do deal processado
- **Título**: Título do deal
- **Ação**: Tipo de ação realizada
- **Alterado**: Se houve alterações
- **Campos Atualizados**: Lista dos campos modificados

## 🔄 Como Funciona

1. **Webhook**: Pipedrive envia evento quando deal é modificado
2. **Validação**: Sistema valida se é um evento de deal válido
3. **Cache**: Verifica se não há processamento duplicado em andamento
4. **Cálculo**: Calcula tempos baseado nas datas de início e término
5. **Atualização**: Atualiza os campos de tempo no Pipedrive
6. **Log**: Registra a operação na planilha de logs

## 🛠️ Principais Funções

### `doPost(e)`
Função principal que recebe o webhook do Pipedrive e processa os eventos.

### `calculaTempoDeConclusao(deal, changedKeys)`
Calcula os tempos de conclusão baseado nas datas de início e término de cada setor.

### `callPipedrive(endpoint, method, payload)`
Faz chamadas à API do Pipedrive com rate limiting e tratamento de erros.

### `getOldObject(webhookEventData)`
Converte dados do webhook 2.0 para formato legado compatível.

## 🔒 Segurança

- Token do Pipedrive armazenado em Properties do Google Apps Script
- Rate limiting para evitar spam de requisições
- Sistema de cache para evitar processamento duplicado
- Validação rigorosa de dados de entrada
- Logs detalhados para auditoria

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas:

- Abra uma [Issue](https://github.com/mcemy/Automacao-Tempo-de-Conclusao/issues)
- Entre em contato através das issues do GitHub

---

<div align="center">
  Desenvolvido com ❤️ para otimizar processos de vendas
</div>
