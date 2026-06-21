const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const aiService = require('../services/aiService');
const ragService = require('../services/ragService');
const automationService = require('../services/automationService');

router.get('/', (req, res) => {
  try {
    const audits = db.getAllAudits().map(a => ({
      ...a,
      phases_count: db.getPhasesByAudit(a.id).length,
      requirements_count: db.getRequirementsByAudit(a.id).length,
      progress: automationService.calculateAuditProgress(a.id).progress
    }));
    res.json({ success: true, data: audits });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/:id', (req, res) => {
  try {
    if (req.params.id === 'system') return res.json({ success: true, data: [] }); // skip system route
    const audit = db.getAuditById(req.params.id);
    if (!audit) return res.status(404).json({ success: false, error: 'Audit not found' });
    const phases = db.getPhasesByAudit(req.params.id);
    const requirements = db.getRequirementsByAudit(req.params.id);
    const evaluationDesign = db.getEvalDesignByAudit(req.params.id);
    const progress = automationService.calculateAuditProgress(req.params.id);
    res.json({ success: true, data: { audit, phases, requirements, evaluationDesign, progress } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const { name, software_name, software_version, organization, audit_type, description, scope, objectives } = req.body;
    if (!name || !software_name || !audit_type) return res.status(400).json({ success: false, error: 'name, software_name and audit_type are required' });
    const audit = db.createAudit({ name, software_name, software_version, organization, audit_type, description, scope, objectives });
    automationService.logAutomation(audit.id, 'audit_created', 'success', { name, software_name, audit_type });
    res.status(201).json({ success: true, data: audit });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const { name, software_name, software_version, organization, audit_type, description, scope, objectives, status } = req.body;
    const fields = {};
    if (name !== undefined) fields.name = name;
    if (software_name !== undefined) fields.software_name = software_name;
    if (software_version !== undefined) fields.software_version = software_version;
    if (organization !== undefined) fields.organization = organization;
    if (audit_type !== undefined) fields.audit_type = audit_type;
    if (description !== undefined) fields.description = description;
    if (scope !== undefined) fields.scope = scope;
    if (objectives !== undefined) fields.objectives = objectives;
    if (status !== undefined) fields.status = status;
    const audit = db.updateAudit(req.params.id, fields);
    res.json({ success: true, data: audit });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.deleteAudit(req.params.id);
    res.json({ success: true, message: 'Audit deleted' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/:id/generate-plan', async (req, res) => {
  const auditId = req.params.id;
  try {
    const audit = db.getAuditById(auditId);
    if (!audit) return res.status(404).json({ success: false, error: 'Audit not found' });
    automationService.logAutomation(auditId, 'generate_plan_start', 'pending', {});
    
    const ragResults = ragService.retrieveRelevantContext(`auditoria ${audit.audit_type} ${audit.software_name}`, { limit: 6 });
    ragService.logRAGRetrieval(auditId, `generate plan for ${audit.software_name}`, ragResults);
    
    const phases = await aiService.generateAuditPlan(audit, ragService);
    db.deletePhasesByAudit(auditId);
    for (const phase of phases) {
      db.insertPhase({ audit_id: auditId, phase_number: phase.phase_number, phase_name: phase.phase_name, phase_type: phase.phase_type || 'general', objectives: phase.objectives, activities: phase.activities, deliverables: phase.deliverables, criteria: phase.criteria, responsible: phase.responsible, notes: phase.notes });
    }
    
    const requirements = await aiService.generateRequirements(audit, ragService);
    db.deleteRequirementsByAudit(auditId);
    for (const req of requirements) {
      db.insertRequirement({ audit_id: auditId, category: req.category, description: req.description, priority: req.priority || 'medium', verification_method: req.verification_method, source: req.source });
    }
    
    const evalDesign = await aiService.generateEvaluationDesign(audit, ragService);
    db.deleteEvalDesignByAudit(auditId);
    db.insertEvalDesign({ audit_id: auditId, technique: evalDesign.technique, methodology: evalDesign.methodology, tools: evalDesign.tools, sample_size: evalDesign.sample_size, criteria: evalDesign.criteria, metrics: evalDesign.metrics, schedule: evalDesign.schedule, resources: evalDesign.resources, risks: evalDesign.risks });
    
    automationService.autoUpdateAuditStatus(auditId);
    aiService.logAICall(auditId, 'generate_full_plan', 'success', { phases: phases.length, requirements: requirements.length });
    
    res.json({
      success: true,
      data: {
        audit: db.getAuditById(auditId),
        phases: db.getPhasesByAudit(auditId),
        requirements: db.getRequirementsByAudit(auditId),
        evaluationDesign: db.getEvalDesignByAudit(auditId),
        rag_sources: ragResults.length,
        progress: automationService.calculateAuditProgress(auditId)
      }
    });
  } catch (err) {
    automationService.logAutomation(auditId, 'generate_plan_error', 'error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/checklist', (req, res) => {
  try {
    const checklist = automationService.generateAuditChecklist(req.params.id);
    if (!checklist) return res.status(404).json({ success: false, error: 'Audit not found' });
    res.json({ success: true, data: checklist });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/:id/logs', (req, res) => {
  try {
    const logs = automationService.getAutomationLogs(req.params.id, 100);
    res.json({ success: true, data: logs });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.patch('/:id/phases/batch-status', (req, res) => {
  try {
    const { statusMap } = req.body;
    if (!statusMap) return res.status(400).json({ success: false, error: 'statusMap required' });
    const result = automationService.batchUpdatePhaseStatuses(req.params.id, statusMap);
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/:id/phases/:phaseId', (req, res) => {
  try {
    const { status, notes, start_date, end_date } = req.body;
    const fields = {};
    if (status !== undefined) fields.status = status;
    if (notes !== undefined) fields.notes = notes;
    if (start_date !== undefined) fields.start_date = start_date;
    if (end_date !== undefined) fields.end_date = end_date;
    const phase = db.updatePhase(req.params.phaseId, fields);
    automationService.autoUpdateAuditStatus(req.params.id);
    res.json({ success: true, data: phase });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/:id/requirements/:reqId', (req, res) => {
  try {
    const { status, evidence, notes } = req.body;
    const fields = {};
    if (status !== undefined) fields.status = status;
    if (evidence !== undefined) fields.evidence = evidence;
    if (notes !== undefined) fields.notes = notes;
    const reqData = db.updateRequirement(req.params.reqId, fields);
    automationService.autoUpdateAuditStatus(req.params.id);
    res.json({ success: true, data: reqData });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
