const { db } = require('../models/database');

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\sáéíóúüñ]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function cosineSimilaritySimple(query, content, keywords) {
  const queryTokens = new Set(tokenize(query));
  const contentTokens = new Set(tokenize(content + ' ' + (keywords || '')));
  let intersection = 0;
  for (const token of queryTokens) {
    if (contentTokens.has(token)) intersection++;
  }
  for (const qt of queryTokens) {
    for (const ct of contentTokens) {
      if (qt.length > 4 && ct.includes(qt)) intersection += 0.5;
    }
  }
  const union = queryTokens.size + contentTokens.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function retrieveRelevantContext(query, options = {}) {
  const { category = null, limit = 5, minScore = 0.02 } = options;
  const entries = category ? db.getKnowledgeByCategory(category) : db.getAllKnowledge();
  const scored = entries.map(entry => ({
    ...entry,
    score: cosineSimilaritySimple(query, entry.content, entry.keywords)
  }));
  return scored.filter(e => e.score >= minScore).sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildAuditPrompt(userInput, auditContext = {}) {
  const relevant = retrieveRelevantContext(userInput, { limit: 6 });
  let contextBlock = '';
  if (relevant.length > 0) {
    contextBlock = `\n\n=== BASE DE CONOCIMIENTO (RAG) ===\n`;
    relevant.forEach((entry, i) => {
      contextBlock += `[${i + 1}] **${entry.title}** (Fuente: ${entry.source})\n${entry.content}\n\n`;
    });
    contextBlock += `=== FIN BASE DE CONOCIMIENTO ===\n\n`;
  }
  const auditInfo = auditContext.audit ? `
=== CONTEXTO DE LA AUDITORÍA ACTUAL ===
Software: ${auditContext.audit.software_name} ${auditContext.audit.software_version || ''}
Organización: ${auditContext.audit.organization || 'No especificada'}
Tipo de auditoría: ${auditContext.audit.audit_type}
Descripción: ${auditContext.audit.description || 'No especificada'}
=== FIN CONTEXTO ===\n\n` : '';
  return `Eres AuditAI, un sistema experto en planificación de auditorías de software. Usas estándares ISO/IEC 25010, OWASP, COBIT, ISO 27001 y CMMI. Respondes siempre en español con precisión técnica.
${contextBlock}${auditInfo}
Solicitud del usuario: ${userInput}

Responde de forma estructurada, técnica y accionable.`;
}

function buildPhasesPrompt(auditData) {
  const relevant = retrieveRelevantContext('fases auditoria software planificacion', { category: 'fases_auditoria', limit: 5 });
  const contextBlock = relevant.map((e, i) => `[${i+1}] ${e.title}:\n${e.content}`).join('\n\n');
  return `Eres AuditAI, experto en auditorías de software según estándares ISO/IEC 25010, OWASP y COBIT.

BASE DE CONOCIMIENTO RECUPERADA (RAG):
${contextBlock}

DATOS DE LA AUDITORÍA:
- Software: ${auditData.software_name} ${auditData.software_version || ''}
- Organización: ${auditData.organization || 'No especificada'}
- Tipo: ${auditData.audit_type}
- Descripción: ${auditData.description || 'No especificada'}
- Alcance: ${auditData.scope || 'A definir'}
- Objetivos: ${auditData.objectives || 'A definir'}

Genera un plan de auditoría completo con exactamente 5 fases. Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional:

{"phases":[{"phase_number":1,"phase_name":"nombre","phase_type":"planificacion","objectives":"objetivos específicos","activities":"actividad1|actividad2|actividad3","deliverables":"entregable1|entregable2","criteria":"criterios medibles","responsible":"rol responsable","notes":"notas técnicas"}]}`;
}

function buildRequirementsPrompt(auditData) {
  const relevant = retrieveRelevantContext('requisitos evaluacion software funcionales seguridad', { category: 'requerimientos_evaluacion', limit: 5 });
  const contextBlock = relevant.map((e, i) => `[${i+1}] ${e.title}:\n${e.content}`).join('\n\n');
  return `Eres AuditAI, experto en requisitos de evaluación de software.

BASE DE CONOCIMIENTO RECUPERADA (RAG):
${contextBlock}

SOFTWARE: ${auditData.software_name} - ${auditData.audit_type}
Descripción: ${auditData.description || 'Sistema de software'}

Genera 12 requisitos de evaluación específicos. Responde ÚNICAMENTE con JSON válido:

{"requirements":[{"category":"funcional","description":"descripción específica del requisito","priority":"high","verification_method":"método concreto","source":"estándar de referencia"}]}`;
}

function buildEvaluationDesignPrompt(auditData) {
  const relevant = retrieveRelevantContext('diseño evaluacion tecnicas metodologia pruebas criterios', { category: 'diseno_evaluacion', limit: 5 });
  const contextBlock = relevant.map((e, i) => `[${i+1}] ${e.title}:\n${e.content}`).join('\n\n');
  return `Eres AuditAI, experto en diseño de evaluaciones de software.

BASE DE CONOCIMIENTO RECUPERADA (RAG):
${contextBlock}

SOFTWARE: ${auditData.software_name} - Tipo: ${auditData.audit_type}

Genera un diseño de evaluación completo. Responde ÚNICAMENTE con JSON válido:

{"evaluation_design":{"technique":"técnica principal","methodology":"metodología detallada","tools":"herramienta1|herramienta2","sample_size":"descripción del muestreo","criteria":"criterios de aceptación medibles","metrics":"métricas con umbrales","schedule":"cronograma por fases","resources":"recursos necesarios","risks":"riesgos y mitigaciones"}}`;
}

function logRAGRetrieval(auditId, query, results) {
  try {
    db.insertLog({
      audit_id: auditId || null,
      action: 'rag_retrieval',
      status: 'success',
      details: JSON.stringify({ query: query.slice(0, 100), results_count: results.length, top_score: results[0]?.score })
    });
  } catch (e) {}
}

module.exports = { retrieveRelevantContext, buildAuditPrompt, buildPhasesPrompt, buildRequirementsPrompt, buildEvaluationDesignPrompt, logRAGRetrieval };
