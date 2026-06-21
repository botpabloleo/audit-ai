const { db } = require('../models/database');

function calculateAuditProgress(auditId) {
  const phases = db.getPhasesByAudit(auditId);
  const requirements = db.getRequirementsByAudit(auditId);
  if (phases.length === 0) return { progress: 0, phases_done: 0, phases_total: 0, reqs_done: 0, reqs_total: 0 };
  const phasesDone = phases.filter(p => p.status === 'completed').length;
  const reqsDone = requirements.filter(r => r.status === 'completed').length;
  const phaseProgress = (phasesDone / phases.length) * 70;
  const reqProgress = requirements.length > 0 ? (reqsDone / requirements.length) * 30 : 0;
  return {
    progress: Math.round(phaseProgress + reqProgress),
    phases_done: phasesDone, phases_total: phases.length,
    reqs_done: reqsDone, reqs_total: requirements.length
  };
}

function autoUpdateAuditStatus(auditId) {
  const progress = calculateAuditProgress(auditId);
  let newStatus = progress.progress === 0 ? 'draft' : progress.progress < 100 ? 'in_progress' : 'completed';
  db.updateAudit(auditId, { status: newStatus });
  logAutomation(auditId, 'auto_status_update', 'success', { new_status: newStatus, progress: progress.progress });
  return { status: newStatus, progress };
}

function validatePhaseCompleteness(phaseId) {
  const phase = db.getPhaseById(phaseId);
  if (!phase) return { valid: false, issues: ['Phase not found'] };
  const issues = [];
  if (!phase.objectives || phase.objectives.length < 10) issues.push('Objetivos insuficientes');
  if (!phase.activities || phase.activities.length < 10) issues.push('Actividades no especificadas');
  if (!phase.deliverables || phase.deliverables.length < 5) issues.push('Entregables no definidos');
  if (!phase.criteria || phase.criteria.length < 10) issues.push('Criterios no establecidos');
  return { valid: issues.length === 0, issues, phase_name: phase.phase_name };
}

function generateAuditChecklist(auditId) {
  const audit = db.getAuditById(auditId);
  if (!audit) return null;
  const phases = db.getPhasesByAudit(auditId);
  const requirements = db.getRequirementsByAudit(auditId);
  logAutomation(auditId, 'generate_checklist', 'success', { phases: phases.length, requirements: requirements.length });
  return {
    audit_name: audit.name, software: audit.software_name,
    generated_at: new Date().toISOString(),
    summary: { total_phases: phases.length, total_requirements: requirements.length, status: audit.status },
    phases_checklist: phases.map(p => ({
      number: p.phase_number, name: p.phase_name, status: p.status,
      activities: p.activities ? p.activities.split('|').map(a => a.trim()) : [],
      deliverables: p.deliverables ? p.deliverables.split('|').map(d => d.trim()) : [],
      validation: validatePhaseCompleteness(p.id)
    })),
    requirements_summary: {
      high_priority: requirements.filter(r => r.priority === 'high').length,
      medium_priority: requirements.filter(r => r.priority === 'medium').length,
      low_priority: requirements.filter(r => r.priority === 'low').length,
      pending: requirements.filter(r => r.status === 'pending').length,
      completed: requirements.filter(r => r.status === 'completed').length
    }
  };
}

function batchUpdatePhaseStatuses(auditId, statusMap) {
  const updated = [];
  for (const [phaseId, status] of Object.entries(statusMap)) {
    const phase = db.getPhaseById(phaseId);
    if (phase && phase.audit_id === auditId) {
      db.updatePhase(phaseId, { status });
      updated.push(phaseId);
    }
  }
  const progress = autoUpdateAuditStatus(auditId);
  logAutomation(auditId, 'batch_phase_update', 'success', { updated_count: updated.length });
  return { updated, progress };
}

function getAutomationLogs(auditId = null, limit = 50) {
  return db.getLogs(auditId, limit);
}

function logAutomation(auditId, action, status, details = {}) {
  try { db.insertLog({ audit_id: auditId, action, status, details: JSON.stringify(details) }); } catch (e) {}
}

module.exports = { calculateAuditProgress, autoUpdateAuditStatus, validatePhaseCompleteness, generateAuditChecklist, batchUpdatePhaseStatuses, getAutomationLogs, logAutomation };
