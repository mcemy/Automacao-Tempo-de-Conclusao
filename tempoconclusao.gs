// ==================== TEMPOCONCLUSAO.GS =====================
// Cálculo de tempos e webhook do Pipedrive (sem gatilhos).

const DATA_INICIO_REGISTRO_ID = 'd04018fd5ac9c09019c1e22792c4062f04f17756';
const DATA_PREENCHIMENTO_FORMULARIO_ID = '758ec614bc1f8ed67513d72745d678a5285c3319';
const DATA_INICIO_CANCELAMENTO = '6d8f75654372cc2840fa3caace245d26477a027d';

const labeld = {
  "805da6c38feba0a8180a93a87f324bb2d7f98d1f": "Tempo de Conclusão da Triagem"
};

const F = {
  Tempo_Conclusao_Triagem: '805da6c38feba0a8180a93a87f324bb2d7f98d1f',
  Tempo_Conclusao_Contratos: 'ee93c29cd3a985cd5f5b02854990bd93392c2cdf',
  Tempo_Conclusao_ITBI: '4227f89d6110e8a766b912e60f692c9c117e9fb7',
  Tempo_Conclusao_Titularidade: 'c3504d7cdd710ad4e875e88951aee63c8798d5de',
  Tempo_Conclusao_Registro: '5263bd1aef269f07057feb6b84b8cd11ecbbeb65',
  Tempo_Conclusao_Desocupacao: 'd84b48cc4d4e49fe4b4cceb511c1543acb7cab80',
  Tempo_Conclusao_IPTU: '8727111cb44299cc2bafd3cd43f81c87abd5b85e',
  Tempo_Conclusao_Condominio: 'be392614e606772a4956220f94c131a6cb742f6f',
  Tempo_Conclusao_Leiloes: 'ff8374792a45911353191926bde7aea0ab694a02',
  Tempo_Conclusao_Cancelamento: '57575df54b52514d6908735a2652770a0f13a20e'
};

const TERMINO_ID = {
  TRIAGEM: "fb1aa427746a8e05d6dadc6eccfc51dd1cdc992d",
  CONTRATO: "f7eba1ca53326f57f7e2d5da4d4fe9d155e99651",
  ITBI: "069bf183917fb89a77a63f5cf793db5c7a2b2c48",
  REGISTRO: "8e1b76dc0501ad8514f3ac51616746851028840e",
  DESOCUPACAO: "7b8d8be1f1e06a6f33930aa8e59ac82fcfc3f0ea",
  IPTU: "46f5eea72dbdcd18c9c19d2ddee73bff046fc14b",
  CONDOMINIO: "2c3da637bcb6a12f68f20a24f734c89698d98f81",
  LEILOES: "d477e9641dba9e9c71a49c181b0997b94705fa54",
  TITULARIDADE: "3022a1c39e2c992e3cb38fe82e0f22ef421cc033",
  CANCELAMENTO: '9cb3ef6dd183152cee2cf6c31f6806154bddbd12'
};

/** ==== Cálculo dos tempos por deal ==== */
function calculaTempoDeConclusao(deal, changedKeys = []) {
  console.log(`Iniciando cálculo para Deal ${deal?.id}`);
  console.log(`Campos alterados:`, changedKeys);

  let camposDeGatilho = Object.values(TERMINO_ID).concat(Object.values(F));
  camposDeGatilho = camposDeGatilho.concat([DATA_INICIO_REGISTRO_ID]);
  camposDeGatilho = camposDeGatilho.concat([DATA_PREENCHIMENTO_FORMULARIO_ID]);
  camposDeGatilho = camposDeGatilho.concat([DATA_INICIO_CANCELAMENTO]);

  const hasChanges = camposDeGatilho.some(field => {
    return changedKeys.includes(field);
  });

  if (!hasChanges) {
    console.log("Nenhum campo de gatilho foi alterado");
    return "Nenhum campo de gatilho para a função calculaTempoDeConclusao foi alterado.";
  }
  
  if (!deal) throw Error("Não foi passado dados para a função calculaTempoDeConclusao");

  let patch = {};
  const camposAfetados = [];

  function setOngoing(fieldId, iniRaw, terminoRaw, label) {
    const isTerminoInvalido = !terminoRaw || new Date(terminoRaw).getTime() < new Date(2022, 0, 1).getTime();
    const isIniInvalido = !iniRaw || new Date(iniRaw).getTime() < new Date(2022, 0, 1).getTime();
    const atual = deal[fieldId];

    // Data de início ou término vier como nula ou inválida
    if (isTerminoInvalido || isIniInvalido) {
      // Se o campo já tiver um valor, limpa
      if (atual !== null && atual !== '' && atual !== undefined) {
        patch[fieldId] = null;
        camposAfetados.push(`${label} (limpo - sem data de início ou término)`);
      }
      return;
    }

    const dias = Math.round((new Date(terminoRaw).getTime() - new Date(iniRaw).getTime()) / 86400000);
    
    // Se for um número de dias inválido, esvazia tempo de conclusão
    if (isNaN(dias) || dias < 0) {
      if (atual !== null && atual !== '' && atual !== undefined) {
        patch[fieldId] = null;
        camposAfetados.push(`${label} (limpo - cálculo inválido)`);
      }
      return;
    }

    // Se o valor atual do campo mudar, atribui patch
    if (parseInt(atual) !== parseInt(dias)) {
      console.log(`${label} - valor atual: ${atual} !== novo valor: ${dias}`);
      patch[fieldId] = dias;
      camposAfetados.push(`${label} - ${dias} dia${dias !== 1 ? 's' : ''}`);
    }
  }

  // Função específica para cancelamento com ordem correta das datas
  function setCancelamento(fieldId, dataInicio, dataTermino, label) {
    const isTerminoInvalido = !dataTermino || dataTermino === '' || new Date(dataTermino).getTime() < new Date(2022, 0, 1).getTime();
    const isIniInvalido = !dataInicio || dataInicio === '' || new Date(dataInicio).getTime() < new Date(2022, 0, 1).getTime();
    const atual = deal[fieldId];

    // Data de início ou término vier como nula, vazia ou inválida - não calcular
    if (isTerminoInvalido || isIniInvalido) {
      // Se o campo já tiver um valor, limpa
      if (atual !== null && atual !== '' && atual !== undefined) {
        patch[fieldId] = null;
        camposAfetados.push(`${label} (limpo - sem data de início ou término)`);
      }
      return;
    }

    // CÁLCULO CORRETO: Término - Início para cancelamento
    const dias = Math.round((new Date(dataTermino).getTime() - new Date(dataInicio).getTime()) / 86400000);
    
    // Se for um número de dias inválido ou negativo, limpa o campo
    if (isNaN(dias) || dias < 0) {
      if (atual !== null && atual !== '' && atual !== undefined) {
        patch[fieldId] = null;
        camposAfetados.push(`${label} (limpo - cálculo inválido ou negativo)`);
      }
      return;
    }

    // Só atualiza se o valor mudou (evita automação desnecessária)
    if (parseInt(atual) !== parseInt(dias)) {
      console.log(`Cancelamento - valor atual: ${atual} !== novo valor: ${dias}`);
      patch[fieldId] = dias;
      camposAfetados.push(`${label} - ${dias} dia${dias !== 1 ? 's' : ''}`);
    }
  }

  // Cálculos padrão - ALTERAÇÃO: Triagem agora usa DATA_PREENCHIMENTO_FORMULARIO_ID
  setOngoing(F.Tempo_Conclusao_Triagem, deal[DATA_PREENCHIMENTO_FORMULARIO_ID], deal[TERMINO_ID.TRIAGEM], 'Triagem');
  setOngoing(F.Tempo_Conclusao_ITBI, deal[TERMINO_ID.TRIAGEM], deal[TERMINO_ID.ITBI], 'ITBI');
  setOngoing(F.Tempo_Conclusao_Contratos, deal[TERMINO_ID.TRIAGEM], deal[TERMINO_ID.CONTRATO], 'Contratos');
  setOngoing(F.Tempo_Conclusao_Titularidade, deal[TERMINO_ID.TRIAGEM], deal[TERMINO_ID.TITULARIDADE], 'Titularidade');
  setOngoing(F.Tempo_Conclusao_Registro, deal[DATA_INICIO_REGISTRO_ID], deal[TERMINO_ID.REGISTRO], 'Registro');
  setOngoing(F.Tempo_Conclusao_Desocupacao, deal[TERMINO_ID.CONTRATO], deal[TERMINO_ID.DESOCUPACAO], 'Desocupação');
  setOngoing(F.Tempo_Conclusao_IPTU, deal[TERMINO_ID.TRIAGEM], deal[TERMINO_ID.IPTU], 'IPTU');
  setOngoing(F.Tempo_Conclusao_Condominio, deal[TERMINO_ID.TRIAGEM], deal[TERMINO_ID.CONDOMINIO], 'Condomínio');
  setOngoing(F.Tempo_Conclusao_Leiloes, deal[TERMINO_ID.TRIAGEM], deal[TERMINO_ID.LEILOES], 'Leilões');
  
  // CÁLCULO CORRIGIDO DO CANCELAMENTO: Término - Início
  setCancelamento(
    F.Tempo_Conclusao_Cancelamento, 
    deal[DATA_INICIO_CANCELAMENTO], 
    deal[TERMINO_ID.CANCELAMENTO], 
    'Cancelamento'
  );

  // Só executa se houver mudanças (evita chamadas desnecessárias ao Pipedrive)
  if (Object.keys(patch).length > 0) {
    appendLog_({
      timestamp: new Date(),
      dealId: deal.id,
      title: deal.title,
      action: "changed",
      altered: "SIM",
      fields: camposAfetados.join(", ")
    });

    console.log("Alterou os campos:", camposAfetados);
    console.log("Patch a ser enviado:", patch);
    
    try {
      const response = callPipedrive(`deals/${deal.id}`, 'PUT', patch);
      console.log("Response da atualização:", response);
    } catch (error) {
      console.error("Erro ao atualizar deal:", error.message);
      throw error;
    }
  } else {
    console.log("Nenhuma mudança detectada nos cálculos");
  }
}

function labelFields_(keys) {
  const map = buildFieldLabels_();
  return (keys || []).map(k => map[k] || k);
}

function buildFieldLabels_() {
  if (typeof buildFieldLabels_._cache !== 'undefined') return buildFieldLabels_._cache;

  const m = {};
  const beautify = s => s
    .replaceAll(/_/g, ' ')
    .toUpperCase();
  m[DATA_INICIO_REGISTRO_ID] = 'Data Início Registro';
  m[DATA_PREENCHIMENTO_FORMULARIO_ID] = 'Data Preenchimento Formulário';
  m[DATA_INICIO_CANCELAMENTO] = 'Data Início Cancelamento';

  Object.entries(F).forEach(([nome, id]) => {
    const legivel = beautify(nome).replaceAll("CONCLUSAO", "CONCLUSÃO");
    m[id] = legivel;
  });
  Object.entries(TERMINO_ID).forEach(([nome, id]) => {
    m[id] = 'Término ' + beautify(nome);
  });

  buildFieldLabels_._cache = m;
  return m;
}