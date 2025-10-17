// ==================== PIPEDRIVE.GS =====================
// Chamada à API do Pipedrive com proteção + rate limit leve.

function callPipedrive(endpoint, method, payload) {
  if (!endpoint || endpoint.trim() === '') throw new Error('Endpoint vazio.');
  if (endpoint.includes('undefined')) throw new Error(`Endpoint inválido: ${endpoint}`);

  const token = PropertiesService.getScriptProperties().getProperty('PIPEDRIVE_TOKEN');
  if (!token) throw new Error('Token ausente: rode setToken().');

  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `https://api.pipedrive.com/v1/${endpoint}${sep}api_token=${token}`;

  // --- rate limit simples (evita estouros em rajada) ---
  rateLimit_();

  const opts = {
    method: method ? method.toUpperCase() : 'GET',
    contentType: 'application/json',
    muteHttpExceptions: true,
  };
  if (payload && typeof payload === 'object' && Object.keys(payload).length > 0) {
    opts.payload = JSON.stringify(payload);
  }

  const res = UrlFetchApp.fetch(url, opts);
  const code = res.getResponseCode();
  const body = res.getContentText();
  console.log(`API Call: ${url}`, opts);

  if (code >= 400) {
    throw new Error(`HTTP ${code} - ${body}`);
  }

  const json = JSON.parse(body);
  if (!json.success) throw new Error(json.error || 'Erro na API do Pipedrive');

  return json.data;
}

/** Converte um evento de Webhook 2.0 em 1.0 */
function getOldObject(webhookEventData) {
  const { custom_fields } = webhookEventData;
  let newObject = Object.assign({}, webhookEventData);
  
  // CORREÇÃO: Verifica se custom_fields existe e é um objeto
  if (custom_fields && typeof custom_fields === 'object') {
    newObject = Object.assign(newObject, custom_fields);
    delete newObject.custom_fields;
  }

  // Se o valor do campo vier como objeto, retorna apenas o valor do objeto
  Object.keys(newObject).forEach(key => {
    const value = newObject[key];
    if (value && typeof value === "object" && value.hasOwnProperty('value')) {
      newObject[key] = value.value;
    }
  });

  return newObject;
}

/** Serializa chamadas e impõe ~400ms entre requisições */
function rateLimit_() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    const props = PropertiesService.getScriptProperties();
    const last = Number(props.getProperty('PD_LAST_TS') || 0);
    const now = Date.now();
    const gap = 400; // ms
    const wait = (last + gap) - now;
    if (wait > 0) Utilities.sleep(wait);
    props.setProperty('PD_LAST_TS', String(Date.now()));
  } finally {
    try { 
      lock.releaseLock(); 
    } catch (_) {
      // Ignora erros de release
    }
  }
}