const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const aiService = require('../services/aiService');
const ragService = require('../services/ragService');

router.post('/chat', async (req, res) => {
  try {
    const { message, audit_id } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message required' });
    let auditContext = {};
    if (audit_id) {
      const audit = db.getAuditById(audit_id);
      if (audit) auditContext = { audit };
    }
    const ragResults = ragService.retrieveRelevantContext(message, { limit: 5 });
    ragService.logRAGRetrieval(audit_id, message, ragResults);
    const response = await aiService.chat(message, auditContext, ragService);
    res.json({
      success: true,
      data: {
        response,
        rag_sources: ragResults.map(r => ({ title: r.title, category: r.category, score: r.score }))
      }
    });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/knowledge', (req, res) => {
  try {
    const { category } = req.query;
    const entries = category ? db.getKnowledgeByCategory(category) : db.getAllKnowledge();
    res.json({ success: true, data: entries });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/knowledge/search', (req, res) => {
  try {
    const { query, category, limit } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'query required' });
    const results = ragService.retrieveRelevantContext(query, { category, limit: limit || 5, minScore: 0.02 });
    res.json({
      success: true,
      data: results.map(r => ({
        id: r.id, title: r.title, category: r.category, source: r.source,
        keywords: r.keywords, relevance_score: r.score,
        content_preview: r.content.slice(0, 200) + '...',
        content: r.content
      }))
    });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/knowledge/:id', (req, res) => {
  try {
    const entry = db.getKnowledgeById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, error: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
