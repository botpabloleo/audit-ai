/**
 * Demo fallback data - used when no ANTHROPIC_API_KEY is configured
 */

function getDemoPhases(auditData) {
  return [
    {
      phase_number: 1,
      phase_name: "Planificación y Definición del Alcance",
      phase_type: "planificacion",
      objectives: `Definir el alcance, objetivos y criterios de éxito de la auditoría de ${auditData.software_name}. Identificar partes interesadas y asignar recursos.`,
      activities: "Reunión inicial con stakeholders|Definición del alcance técnico|Identificación de riesgos iniciales|Elaboración del plan de auditoría|Asignación de roles y responsabilidades",
      deliverables: "Plan de auditoría aprobado|Matriz de riesgos inicial|Cronograma detallado",
      criteria: "Plan aprobado por todas las partes interesadas. Alcance documentado y firmado. Recursos asignados al 100%.",
      responsible: "Líder Auditor",
      notes: `Considerar estándares ISO/IEC 25010 y COBIT 2019 como referencias principales para ${auditData.audit_type}.`
    },
    {
      phase_number: 2,
      phase_name: "Recolección de Información y Evidencia",
      phase_type: "recoleccion",
      objectives: `Recopilar toda la evidencia técnica necesaria sobre ${auditData.software_name}: documentación, código fuente, configuraciones y logs del sistema.`,
      activities: "Revisión de documentación técnica|Entrevistas con equipo de desarrollo|Análisis estático de código fuente (SAST)|Revisión de configuraciones del sistema|Análisis de logs y registros de eventos",
      deliverables: "Inventario de evidencia recolectada|Informe de entrevistas|Reporte de análisis estático inicial",
      criteria: "Cobertura del 100% de módulos en alcance. Documentación técnica completa. Al menos 3 entrevistas realizadas.",
      responsible: "Equipo Auditor Técnico",
      notes: "Usar SonarQube para análisis estático. Aplicar OWASP Testing Guide v4 como referencia metodológica."
    },
    {
      phase_number: 3,
      phase_name: "Análisis y Evaluación Técnica",
      phase_type: "analisis",
      objectives: `Analizar la evidencia recolectada, identificar vulnerabilidades y evaluar el cumplimiento de ${auditData.software_name} con los estándares de calidad aplicables.`,
      activities: "Análisis de vulnerabilidades (CVSS)|Pruebas dinámicas de seguridad (DAST)|Evaluación de cumplimiento ISO 25010|Pruebas de rendimiento y carga|Verificación de controles de seguridad",
      deliverables: "Informe de vulnerabilidades clasificadas|Reporte de pruebas dinámicas|Matriz de cumplimiento ISO 25010",
      criteria: "0 vulnerabilidades críticas sin documentar. Cobertura de pruebas >80%. Evaluación completa de las 8 características ISO 25010.",
      responsible: "Especialista en Seguridad y QA",
      notes: "Clasificar hallazgos por severidad CVSS v3.1: Crítico, Alto, Medio, Bajo. Usar OWASP ZAP para DAST."
    },
    {
      phase_number: 4,
      phase_name: "Elaboración del Informe de Resultados",
      phase_type: "reporte",
      objectives: `Documentar todos los hallazgos de la auditoría de ${auditData.software_name} con evidencias, recomendaciones priorizadas y plan de remediación.`,
      activities: "Consolidación de hallazgos|Redacción de informe ejecutivo|Elaboración de informe técnico detallado|Definición del plan de remediación|Revisión y validación del informe",
      deliverables: "Informe ejecutivo para gerencia|Informe técnico detallado|Plan de remediación priorizado|Presentación de resultados",
      criteria: "Informe revisado y aprobado por el equipo. 100% de hallazgos documentados con evidencia. Plan de remediación con responsables y plazos.",
      responsible: "Líder Auditor",
      notes: "Clasificar recomendaciones por prioridad: inmediata (<30 días), corto plazo (<90 días), largo plazo (<180 días)."
    },
    {
      phase_number: 5,
      phase_name: "Seguimiento y Cierre",
      phase_type: "seguimiento",
      objectives: `Verificar la implementación de las correcciones identificadas en ${auditData.software_name} y cerrar formalmente la auditoría.`,
      activities: "Verificación de remediaciones implementadas|Re-testing de vulnerabilidades corregidas|Validación de controles implementados|Reunión de cierre con stakeholders|Archivo de documentación de auditoría",
      deliverables: "Informe de verificación de remediaciones|Acta de cierre firmada|Expediente completo de auditoría",
      criteria: "100% de hallazgos críticos y altos remediados. Acta de cierre firmada por todas las partes. Documentación archivada correctamente.",
      responsible: "Líder Auditor + Equipo Técnico",
      notes: "Aplicar ciclo PDCA para mejora continua. Programar auditoría de seguimiento en 6 meses."
    }
  ];
}

function getDemoRequirements(auditData) {
  return [
    { category: "funcional", description: `Verificar que todas las funciones principales de ${auditData.software_name} operen correctamente según las especificaciones documentadas`, priority: "high", verification_method: "Pruebas funcionales manuales y automatizadas", source: "ISO/IEC 25010 - Adecuación Funcional" },
    { category: "funcional", description: "Validar que el sistema maneje correctamente todos los casos de error y entradas inválidas sin fallar", priority: "high", verification_method: "Pruebas de caja negra con casos límite", source: "IEEE 829, ISO/IEC 25010" },
    { category: "seguridad", description: "Verificar que el sistema implementa autenticación robusta con soporte para MFA y política de contraseñas seguras", priority: "high", verification_method: "Revisión de código + pruebas de penetración", source: "OWASP Top 10 A07, NIST SP 800-63" },
    { category: "seguridad", description: "Confirmar que no existen vulnerabilidades de inyección SQL, XSS o Command Injection en ningún punto de entrada", priority: "high", verification_method: "DAST con OWASP ZAP + revisión manual de código", source: "OWASP Top 10 A03:2021" },
    { category: "seguridad", description: "Verificar que todos los datos sensibles se transmiten cifrados (TLS 1.3+) y se almacenan con cifrado AES-256", priority: "high", verification_method: "Análisis de tráfico de red + revisión de configuración", source: "OWASP Top 10 A02, ISO/IEC 27001" },
    { category: "rendimiento", description: "El sistema debe responder a operaciones normales en menos de 2 segundos bajo carga estándar (hasta 100 usuarios concurrentes)", priority: "medium", verification_method: "Pruebas de carga con Apache JMeter", source: "ISO/IEC 25010 - Eficiencia de Desempeño" },
    { category: "rendimiento", description: "El sistema debe mantener disponibilidad mínima del 99.5% en horario de operación definido", priority: "medium", verification_method: "Monitoreo de uptime durante período de prueba", source: "ISO/IEC 25010 - Fiabilidad" },
    { category: "usabilidad", description: "La interfaz debe cumplir estándares de accesibilidad WCAG 2.1 nivel AA para usuarios con necesidades especiales", priority: "medium", verification_method: "Auditoría con herramientas axe y WAVE + revisión manual", source: "WCAG 2.1, ISO/IEC 25010 - Usabilidad" },
    { category: "no_funcional", description: "El código fuente debe mantener cobertura de pruebas unitarias superior al 80% en módulos críticos", priority: "medium", verification_method: "Análisis con herramientas de cobertura (Istanbul, JaCoCo)", source: "ISO/IEC 25010 - Mantenibilidad" },
    { category: "no_funcional", description: "Todas las dependencias de terceros deben estar actualizadas sin vulnerabilidades CVE conocidas de severidad alta o crítica", priority: "high", verification_method: "Escaneo con OWASP Dependency-Check o Snyk", source: "OWASP Top 10 A06:2021" },
    { category: "mantenibilidad", description: "La complejidad ciclomática de los módulos no debe superar 10 para garantizar mantenibilidad del código", priority: "low", verification_method: "Análisis estático con SonarQube", source: "ISO/IEC 25010 - Mantenibilidad" },
    { category: "mantenibilidad", description: "El sistema debe contar con documentación técnica actualizada: arquitectura, APIs y manual de despliegue", priority: "low", verification_method: "Revisión documental contra checklist estándar", source: "ISO/IEC 25010, IEEE 1063" }
  ];
}

function getDemoEvaluationDesign(auditData) {
  return {
    technique: `Evaluación híbrida: Análisis Estático (SAST) + Pruebas Dinámicas (DAST) + Revisión Manual para auditoría de tipo ${auditData.audit_type}`,
    methodology: `1. Revisión estática con SonarQube sobre código fuente completo\n2. Pruebas dinámicas con OWASP ZAP sobre endpoints expuestos\n3. Pruebas de carga con JMeter (100, 500, 1000 usuarios concurrentes)\n4. Revisión manual de controles críticos de seguridad\n5. Evaluación de cumplimiento ISO 25010 por característica`,
    tools: "SonarQube (SAST)|OWASP ZAP (DAST)|Apache JMeter (rendimiento)|OWASP Dependency-Check (dependencias)|axe DevTools (accesibilidad)|Burp Suite (seguridad manual)",
    sample_size: "Cobertura del 100% de endpoints de API y módulos críticos. Para pruebas de carga: muestreo estadístico con n=385 (confianza 95%, margen error 5%). Para revisión de código: 100% módulos de autenticación y datos sensibles, 30% muestra aleatoria del resto.",
    criteria: "✓ 0 vulnerabilidades críticas (CVSS ≥9.0) abiertas\n✓ Tiempo de respuesta P95 < 2 segundos bajo 100 usuarios\n✓ Cobertura de código > 80% en módulos críticos\n✓ Score ISO 25010 > 75/100\n✓ 0 dependencias con CVE crítico sin parchear\n✓ Cumplimiento WCAG 2.1 AA en interfaz",
    metrics: "Densidad de defectos: <1 crítico por KLOC|Cobertura de pruebas: >80%|Tiempo respuesta P95: <2s|Disponibilidad: >99.5%|Score CVSS máximo aceptable: <7.0 (medio)|Deuda técnica SonarQube: <5 días",
    schedule: "Semana 1-2: Recolección y análisis estático|Semana 3: Pruebas dinámicas y de seguridad|Semana 4: Pruebas de rendimiento y usabilidad|Semana 5: Consolidación y elaboración de informe|Semana 6: Revisión, aprobación y entrega",
    resources: "1 Líder Auditor (senior)|2 Auditores Técnicos (seguridad y QA)|1 Especialista en Rendimiento|Licencias: SonarQube Community, Burp Suite Pro|Ambiente de pruebas equivalente a producción",
    risks: "Riesgo: Acceso limitado al código fuente → Mitigación: NDA y acuerdo de confidencialidad previo|Riesgo: Ambiente de pruebas no representativo → Mitigación: Validar equivalencia con producción antes de iniciar|Riesgo: Hallazgos críticos que requieran pausa → Mitigación: Protocolo de escalamiento definido en plan"
  };
}

module.exports = { getDemoPhases, getDemoRequirements, getDemoEvaluationDesign };
