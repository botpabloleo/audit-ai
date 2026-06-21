const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const adapter = new FileSync(path.join(DATA_DIR, 'auditai.json'));
const db = low(adapter);

// Schema defaults
db.defaults({
  audits: [],
  audit_phases: [],
  requirements: [],
  evaluation_designs: [],
  rag_knowledge_base: [],
  automation_logs: []
}).write();

// Seed knowledge base if empty
if (db.get('rag_knowledge_base').size().value() === 0) {
  const entries = [
    {
      id: uuidv4(), category: 'fases_auditoria',
      title: 'Fase 1: Planificación de la Auditoría',
      content: `La fase de planificación es el punto de partida de cualquier auditoría de software. Incluye: 
1) Definición del alcance y objetivos: determinar qué sistemas, componentes y procesos serán auditados.
2) Identificación de partes interesadas: clientes, usuarios finales, equipo de desarrollo, gerencia.
3) Evaluación de riesgos inicial: identificar áreas críticas y potenciales vulnerabilidades.
4) Asignación de recursos: equipo auditor, herramientas, tiempo y presupuesto.
5) Cronograma: establecer hitos, fechas de entrega y puntos de control.
6) Criterios de éxito: definir métricas y estándares de referencia (ISO 25010, OWASP, CMMI).`,
      keywords: 'planificacion,alcance,objetivos,recursos,cronograma,riesgos',
      source: 'ISO/IEC 25040, ISACA COBIT', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'fases_auditoria',
      title: 'Fase 2: Recolección de Información',
      content: `En esta fase se recopila toda la evidencia necesaria para la auditoría:
1) Revisión de documentación: especificaciones técnicas, manuales, arquitectura del sistema.
2) Entrevistas: con desarrolladores, administradores de sistemas, usuarios clave.
3) Observación directa: análisis del entorno de operación y procesos en uso.
4) Análisis de código fuente: revisión estática del código para detectar vulnerabilidades.
5) Análisis de logs: examinación de registros del sistema para patrones anómalos.
6) Herramientas automatizadas: escaners de vulnerabilidades, analizadores estáticos (SonarQube, Checkmarx).`,
      keywords: 'recoleccion,evidencia,documentacion,entrevistas,codigo,logs',
      source: 'NIST SP 800-115, ISO/IEC 27001', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'fases_auditoria',
      title: 'Fase 3: Análisis y Evaluación',
      content: `El análisis transforma la evidencia en hallazgos concretos:
1) Evaluación de cumplimiento: contrastar hallazgos con estándares y normativas aplicables.
2) Análisis de vulnerabilidades: clasificar por severidad (CVSS), impacto y probabilidad.
3) Revisión de controles: verificar efectividad de controles de seguridad y calidad existentes.
4) Pruebas funcionales: validar que el software cumple con sus requisitos funcionales.
5) Pruebas de rendimiento: evaluar tiempos de respuesta, escalabilidad y disponibilidad.
6) Análisis de seguridad: penetration testing, revisión de autenticación y autorización.`,
      keywords: 'analisis,evaluacion,vulnerabilidades,cumplimiento,pruebas,controles',
      source: 'OWASP Testing Guide, ISO/IEC 25010', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'fases_auditoria',
      title: 'Fase 4: Informe de Resultados',
      content: `La fase de reporte comunica los hallazgos a los interesados:
1) Informe ejecutivo: resumen de alto nivel para la gerencia con hallazgos críticos.
2) Informe técnico detallado: descripción completa de hallazgos, evidencias y recomendaciones.
3) Plan de remediación: priorización de acciones correctivas con plazos y responsables.
4) Clasificación de hallazgos: crítico, alto, medio, bajo según impacto y riesgo.
5) Métricas de calidad: puntuación de calidad del software según ISO 25010.
6) Lecciones aprendidas: recomendaciones para mejorar el proceso de desarrollo.`,
      keywords: 'informe,reporte,hallazgos,remediacion,recomendaciones,metricas',
      source: 'ISACA, IIA Standards', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'fases_auditoria',
      title: 'Fase 5: Seguimiento y Cierre',
      content: `La fase final garantiza la implementación de mejoras:
1) Verificación de remediaciones: comprobar que las acciones correctivas fueron implementadas.
2) Re-auditoría parcial: pruebas de regresión sobre áreas críticas corregidas.
3) Cierre formal: documentación del cierre y firma por parte de los responsables.
4) Lecciones aprendidas: reunión de retrospectiva con el equipo auditor.
5) Archivo de documentación: preservar toda la evidencia y el expediente de auditoría.
6) Mejora continua: recomendaciones para futuras auditorías y ciclo PDCA.`,
      keywords: 'seguimiento,cierre,remediacion,verificacion,mejora,retrospectiva',
      source: 'ISO 19011, IIA Standards', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'requerimientos_evaluacion',
      title: 'Requisitos Funcionales de Evaluación',
      content: `Los requisitos funcionales definen QUÉ debe hacer el software:
1) Completitud funcional: todas las funciones especificadas están implementadas.
2) Corrección funcional: las funciones producen resultados correctos según especificaciones.
3) Pertinencia funcional: las funciones facilitan el logro de los objetivos del usuario.
4) Cobertura de casos de uso: todos los flujos principales y alternativos están cubiertos.
5) Manejo de errores: el sistema gestiona apropiadamente entradas inválidas y condiciones de error.
6) Trazabilidad: cada requisito puede rastrearse hasta su implementación y prueba correspondiente.
Estándar de referencia: ISO/IEC 25010 - Característica de Adecuación Funcional.`,
      keywords: 'funcionales,completitud,correccion,pertinencia,casos de uso,trazabilidad',
      source: 'ISO/IEC 25010, IEEE 830', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'requerimientos_evaluacion',
      title: 'Requisitos No Funcionales de Evaluación',
      content: `Los requisitos no funcionales definen CÓMO debe comportarse el software:
1) Rendimiento: tiempos de respuesta (<2s para operaciones normales), throughput, uso de recursos.
2) Confiabilidad: MTBF (Mean Time Between Failures), disponibilidad objetivo (99.9%).
3) Usabilidad: facilidad de aprendizaje, eficiencia de uso, satisfacción del usuario (SUS score).
4) Seguridad: autenticación, autorización, cifrado, protección de datos (GDPR, Ley 19.628 Chile).
5) Mantenibilidad: modularidad, reusabilidad, analizabilidad, modificabilidad.
6) Portabilidad: adaptabilidad, instalabilidad, coexistencia con otros sistemas.
Estándar de referencia: ISO/IEC 25010 - Modelo de Calidad.`,
      keywords: 'no funcionales,rendimiento,confiabilidad,usabilidad,seguridad,mantenibilidad',
      source: 'ISO/IEC 25010, NIST Cybersecurity Framework', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'requerimientos_evaluacion',
      title: 'Requisitos de Seguridad',
      content: `La evaluación de seguridad cubre múltiples dimensiones:
1) Autenticación y Autorización: verificar implementación de MFA, RBAC, principio de mínimo privilegio.
2) Protección de datos: cifrado en tránsito (TLS 1.3+) y en reposo (AES-256).
3) Gestión de sesiones: tokens seguros, expiración, revocación, protección CSRF.
4) Validación de entradas: prevención de SQL Injection, XSS, Command Injection (OWASP Top 10).
5) Registro y monitoreo: logging de eventos de seguridad, detección de anomalías.
6) Gestión de dependencias: análisis de vulnerabilidades en librerías de terceros (CVE database).
Herramientas: OWASP ZAP, Burp Suite, Nessus, SonarQube Security.`,
      keywords: 'seguridad,autenticacion,cifrado,vulnerabilidades,OWASP,inyeccion',
      source: 'OWASP Top 10, NIST SP 800-53, ISO/IEC 27034', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'diseno_evaluacion',
      title: 'Técnicas de Evaluación: Pruebas Estáticas',
      content: `Las técnicas estáticas analizan el software sin ejecutarlo:
1) Revisión de código (Code Review): inspección manual o con herramientas del código fuente.
2) Análisis estático (SAST): uso de herramientas como SonarQube, Checkmarx, Fortify.
3) Inspección de arquitectura: revisión de diagramas, patrones de diseño, acoplamiento/cohesión.
4) Revisión de documentación: verificar completitud, coherencia y actualización de docs técnicos.
5) Análisis de métricas de código: complejidad ciclomática, cobertura de código, deuda técnica.
6) Revisión de configuración: verificar configuraciones seguras en servidores, bases de datos, APIs.
Métricas clave: Lines of Code (LOC), Code Coverage (>80%), Cyclomatic Complexity (<10).`,
      keywords: 'estaticas,codigo,SAST,inspeccion,metricas,complejidad',
      source: 'IEEE 1028, OWASP Code Review Guide', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'diseno_evaluacion',
      title: 'Técnicas de Evaluación: Pruebas Dinámicas',
      content: `Las técnicas dinámicas evalúan el software en ejecución:
1) Pruebas unitarias: verificar componentes individuales con frameworks (JUnit, pytest, Jest).
2) Pruebas de integración: validar la interacción entre módulos y servicios.
3) Pruebas de sistema: evaluar el sistema completo contra requisitos funcionales.
4) Pruebas de rendimiento: carga (JMeter, Gatling), estrés, escalabilidad, resistencia.
5) Pruebas de seguridad dinámicas (DAST): OWASP ZAP, Burp Suite para detectar vulnerabilidades en runtime.
6) Pruebas de aceptación de usuario (UAT): validación con usuarios finales reales.
Métricas: tasa de fallos, tiempo de respuesta P95/P99, throughput (req/s).`,
      keywords: 'dinamicas,unitarias,integracion,rendimiento,DAST,aceptacion',
      source: 'ISTQB Foundation, IEEE 829', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'diseno_evaluacion',
      title: 'Diseño de Evaluación: Metodología de Muestreo',
      content: `La selección de muestras asegura representatividad y eficiencia:
1) Muestreo basado en riesgo: focalizar en áreas críticas de alto impacto/probabilidad.
2) Muestreo por funcionalidad: seleccionar casos representativos de cada módulo.
3) Muestreo estadístico: tamaño de muestra calculado según confianza requerida (90-95%).
4) Pruebas de regresión: verificar que cambios no rompen funcionalidad existente.
5) Pruebas exploratorias: sesiones no estructuradas para descubrir defectos inesperados.
6) Partición de equivalencia: agrupar entradas en clases que deben comportarse igual.
Fórmula muestral: n = Z²·p·(1-p) / e² (donde Z=1.96 para 95%, e=error aceptado).`,
      keywords: 'muestreo,riesgo,estadistico,regresion,exploratorio,equivalencia',
      source: 'ISTQB Advanced, ISO/IEC 29119', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'diseno_evaluacion',
      title: 'Criterios de Evaluación y Métricas de Calidad',
      content: `Los criterios definen qué constituye un resultado aceptable:
1) Umbrales de aceptación: % de casos de prueba exitosos (>95% funcionales, 100% críticos).
2) Densidad de defectos: defectos por KLOC (objetivo: <1 defecto crítico por KLOC).
3) Cobertura de código: líneas, ramas, condiciones cubiertas (mínimo 80% cobertura total).
4) Índice de calidad ISO 25010: puntuación ponderada de características de calidad (>75/100).
5) MTBF y MTTR: tiempo medio entre fallos y tiempo medio de recuperación.
6) Puntuación de seguridad: número de vulnerabilidades críticas (objetivo: 0 críticas abiertas).
Herramientas de métricas: SonarQube Quality Gate, CAST Highlight, Coverity.`,
      keywords: 'criterios,metricas,calidad,umbrales,cobertura,defectos,ISO25010',
      source: 'ISO/IEC 25040, CMMi Level 3', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'estandares',
      title: 'ISO/IEC 25010 - Modelo de Calidad del Producto Software',
      content: `ISO 25010 define ocho características de calidad para software:
1) Adecuación Funcional: grado en que el producto provee funciones que satisfacen necesidades.
2) Eficiencia de Desempeño: rendimiento relativo a la cantidad de recursos usados.
3) Compatibilidad: capacidad de intercambiar información con otros sistemas.
4) Usabilidad: capacidad de ser usado por usuarios específicos para lograr objetivos.
5) Fiabilidad: capacidad de realizar funciones bajo condiciones y durante un período determinado.
6) Seguridad: protección de información contra acceso no autorizado.
7) Mantenibilidad: facilidad con que puede ser modificado para corregir o mejorar.
8) Portabilidad: facilidad con que puede ser transferido de un entorno a otro.`,
      keywords: 'ISO25010,calidad,funcionalidad,rendimiento,usabilidad,seguridad,fiabilidad',
      source: 'ISO/IEC 25010:2011', created_at: new Date().toISOString()
    },
    {
      id: uuidv4(), category: 'herramientas',
      title: 'Herramientas para Auditoría de Software',
      content: `Herramientas recomendadas por categoría:
ANÁLISIS ESTÁTICO (SAST): SonarQube (open source), Checkmarx, Fortify, Coverity, Bandit (Python), ESLint (JS).
ANÁLISIS DINÁMICO (DAST): OWASP ZAP (open source), Burp Suite Professional, Nessus, Nikto.
GESTIÓN DE DEPENDENCIAS: OWASP Dependency-Check, Snyk, WhiteSource, npm audit, pip-audit.
PRUEBAS DE RENDIMIENTO: Apache JMeter, Gatling, k6, Locust (Python), Artillery.
COBERTURA DE CÓDIGO: JaCoCo (Java), Istanbul/NYC (JS), Coverage.py (Python), dotCover (.NET).
GESTIÓN DE DEFECTOS: Jira, Azure DevOps, Bugzilla, GitHub Issues.
CI/CD INTEGRATION: Jenkins, GitHub Actions, GitLab CI, Azure Pipelines.`,
      keywords: 'herramientas,SAST,DAST,SonarQube,OWASP ZAP,JMeter,cobertura',
      source: 'OWASP, NIST, ISACA', created_at: new Date().toISOString()
    }
  ];
  
  db.set('rag_knowledge_base', entries).write();
  console.log('✅ Knowledge base seeded with', entries.length, 'entries');
}

// Helper: simulate synchronous SQLite-like API with lowdb
const dbWrapper = {
  // Audits
  getAllAudits() { return db.get('audits').value() || []; },
  getAuditById(id) { return db.get('audits').find({ id }).value() || null; },
  createAudit(data) {
    const audit = { ...data, id: uuidv4(), status: 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    db.get('audits').push(audit).write();
    return audit;
  },
  updateAudit(id, fields) {
    db.get('audits').find({ id }).assign({ ...fields, updated_at: new Date().toISOString() }).write();
    return this.getAuditById(id);
  },
  deleteAudit(id) {
    db.get('audits').remove({ id }).write();
    db.get('audit_phases').remove({ audit_id: id }).write();
    db.get('requirements').remove({ audit_id: id }).write();
    db.get('evaluation_designs').remove({ audit_id: id }).write();
  },

  // Phases
  getPhasesByAudit(audit_id) {
    return db.get('audit_phases').filter({ audit_id }).sortBy('phase_number').value();
  },
  getPhaseById(id) { return db.get('audit_phases').find({ id }).value(); },
  deletePhasesByAudit(audit_id) { db.get('audit_phases').remove({ audit_id }).write(); },
  insertPhase(data) {
    const phase = { ...data, id: uuidv4(), status: 'pending', created_at: new Date().toISOString() };
    db.get('audit_phases').push(phase).write();
    return phase;
  },
  updatePhase(id, fields) {
    db.get('audit_phases').find({ id }).assign(fields).write();
    return this.getPhaseById(id);
  },

  // Requirements
  getRequirementsByAudit(audit_id) { return db.get('requirements').filter({ audit_id }).value(); },
  deleteRequirementsByAudit(audit_id) { db.get('requirements').remove({ audit_id }).write(); },
  insertRequirement(data) {
    const req = { ...data, id: uuidv4(), status: 'pending', created_at: new Date().toISOString() };
    db.get('requirements').push(req).write();
    return req;
  },
  updateRequirement(id, fields) {
    db.get('requirements').find({ id }).assign(fields).write();
    return db.get('requirements').find({ id }).value();
  },
  getRequirementById(id) { return db.get('requirements').find({ id }).value(); },

  // Evaluation Designs
  getEvalDesignByAudit(audit_id) { return db.get('evaluation_designs').find({ audit_id }).value() || null; },
  deleteEvalDesignByAudit(audit_id) { db.get('evaluation_designs').remove({ audit_id }).write(); },
  insertEvalDesign(data) {
    const design = { ...data, id: uuidv4(), created_at: new Date().toISOString() };
    db.get('evaluation_designs').push(design).write();
    return design;
  },

  // RAG Knowledge Base
  getAllKnowledge() { return db.get('rag_knowledge_base').value() || []; },
  getKnowledgeByCategory(category) { return db.get('rag_knowledge_base').filter({ category }).value(); },
  getKnowledgeById(id) { return db.get('rag_knowledge_base').find({ id }).value(); },

  // Automation Logs
  getLogs(audit_id, limit = 100) {
    let logs = db.get('automation_logs').value() || [];
    if (audit_id) logs = logs.filter(l => l.audit_id === audit_id);
    return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
  },
  insertLog(data) {
    const log = { ...data, id: uuidv4(), created_at: new Date().toISOString() };
    db.get('automation_logs').push(log).write();
    return log;
  },

  // Stats
  getStats() {
    return {
      knowledge_base: db.get('rag_knowledge_base').size().value(),
      audits: db.get('audits').size().value(),
      automation_logs: db.get('automation_logs').size().value(),
    };
  }
};

module.exports = { db: dbWrapper };
