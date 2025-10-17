// ==================== CONFIG.GS =====================
// ID da planilha de destino
const SHEET_ID = '1Gv431at73GX-Im-KMOOkSc1gFA0eiqnGcpEjqhUWC5g';
const SHEET_NAME = 'Webhook_Deals'; // a aba será criada se não existir

// Define o token fixo do Pipedrive em Script Properties (rode uma vez no editor)
function setToken() {
  PropertiesService.getScriptProperties()
    .setProperty('PIPEDRIVE_TOKEN', '592fa4db75e415cbb9e8bebbee497e3c24527f16');
}

/** Retorna a sheet e cria cabeçalho se preciso */
function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);

  const header = ['Timestamp', 'Deal ID', 'Título', 'Ação', 'Alterado', 'Campos Atualizados'];
  const firstRow = sh.getRange(1, 1, 1, header.length).getValues()[0];
  if (firstRow.join('').trim() === '') {
    sh.getRange(1, 1, 1, header.length).setValues([header]);
  }
  return sh;
}

/** Adiciona log na planilha de erro */
function logError(event, error, functionName) {
  Logger.log(error.stack);
  console.error(`Erro em ${functionName}:`, error.message);
  
  try {
    const planilhaLog = SpreadsheetApp.openById(SHEET_ID);
    let sheetErros = planilhaLog.getSheetByName("Erros");
    
    // Cria a aba de erros se não existir
    if (!sheetErros) {
      sheetErros = planilhaLog.insertSheet("Erros");
      sheetErros.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Event', 'Error Message', 'Stack Trace', 'Function']]);
    }
    
    sheetErros.appendRow([
      new Date(),
      JSON.stringify(event),
      error.message,
      error.stack,
      functionName
    ]);
  } catch (logErr) {
    console.error("Erro ao logar erro:", logErr.message);
  }
}

/** Timestamp no fuso de São Paulo */
function fmtDate_(d) {
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
}

function appendLog_({ timestamp, dealId, title, action, altered, fields }) {
  try {
    const sh = getSheet_();
    const row = [
      timestamp || new Date(),
      String(dealId || ''),
      String(title || ''),
      String(action || ''),
      String(altered || ''),
      String(fields || '')
    ];
    sh.appendRow(row);
    console.log("Log adicionado à planilha:", row);
  } catch (error) {
    console.error("Erro ao adicionar log:", error.message);
  }
}

function jsonOut_(obj) {
  console.log("Retorno do Webhook:", obj);
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

//** Função para configurar o token (executar uma vez) */
//function configurarToken() {
  //setToken();
  //console.log("Token configurado com sucesso!");
//}