// ==================== MAIN.GS =====================
/** ==== WEBHOOK: recebe eventos do Pipedrive ==== */
function doPost(e) {
  console.log("=== WEBHOOK CHAMADO ===");
  
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    console.log("Dados brutos recebidos:", raw ? "Dados presentes" : "Sem dados");
    
    if (!raw) {
      const errorMsg = "Evento sem corpo postData";
      console.error(errorMsg);
      throw Error(errorMsg);
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (err) {
      const errorMsg = "JSON Inválido";
      console.error(errorMsg, err.message);
      throw Error(errorMsg);
    }

    console.log("Payload parseado:", JSON.stringify(payload, null, 2));

    const { meta, data, previous } = payload;
    if (!meta) throw Error("Payload sem meta");
    
    const { action, entity } = meta;
    console.log(`Evento: ${action} em ${entity}`);

    if (entity === "deal") {
      if (!data?.id) {
        const errorMsg = "Evento não é de um deal válido";
        console.error(errorMsg);
        throw Error(errorMsg);
      }

      console.log(`Processando Deal ID: ${data.id}`);

      // Sistema de cache para evitar processamento duplicado
      const cache = CacheService.getScriptCache();
      const cacheKey = `lock_deal_${data.id}_${Date.now()}`;
      
      // Verifica se há outro processamento em andamento (últimos 5 segundos)
      const existingLocks = [];
      for (let i = 0; i < 5; i++) {
        const checkKey = `lock_deal_${data.id}_${Date.now() - (i * 1000)}`;
        if (cache.get(checkKey)) {
          existingLocks.push(checkKey);
        }
      }
      
      if (existingLocks.length > 0) {
        console.log(`Execução para o Deal ID ${data.id} já está em andamento. Ignorando este gatilho.`);
        return jsonOut_({ ok: true, message: "Skipped as duplicate." });
      }
      
      // Define lock por 60 segundos
      cache.put(cacheKey, 'locked', 60);

      // Identifica campos alterados
      const customFieldChanged = Object.keys(previous?.custom_fields || {});
      const systemFieldChanged = Object.keys(previous || {}).filter(f => f !== "custom_fields");
      const changedKeys = customFieldChanged.concat(systemFieldChanged);
      
      console.log("Campos alterados (custom):", customFieldChanged);
      console.log("Campos alterados (system):", systemFieldChanged);
      console.log("Todos os campos alterados:", changedKeys);

      // Converte dados do webhook para formato legado
      const oldPayload = getOldObject(data);
      console.log("Payload convertido:", JSON.stringify(oldPayload, null, 2));

      try {
        calculaTempoDeConclusao(oldPayload, changedKeys);
      } catch (error) {
        console.error("Erro na função calculaTempoDeConclusao:", error.message);
        logError(e, error, "calculaTempoDeConclusao()");
        
        appendLog_({
          timestamp: new Date(),
          dealId: data.id,
          title: data.title || '',
          action: action,
          altered: 'ERRO',
          fields: `Erro no cálculo: ${error.message}`
        });
      }
    } else {
      console.log(`Ignorando evento de ${entity} (não é deal)`);
    }

    console.log("=== WEBHOOK PROCESSADO COM SUCESSO ===");
    return jsonOut_({ ok: true, processed: new Date().toISOString() });
    
  } catch (error) {
    console.error("Erro geral no webhook:", error.message);
    console.error("Stack trace:", error.stack);
    
    logError(e, error, "doPost");
    
    return jsonOut_({ 
      ok: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}