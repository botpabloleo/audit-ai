require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => { console.log(`${new Date().toISOString()} ${req.method} ${req.path}`); next(); });

app.use('/api/audits', require('./routes/audits'));
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (req, res) => {
  const aiConfigured = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: aiConfigured ? 'production (Gemini)' : 'demo',
    ai_configured: aiConfigured,
    stats: db.getStats()
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'AuditAI API', version: '1.0.0',
    mode: process.env.ANTHROPIC_API_KEY ? 'production' : 'demo',
    endpoints: {
      health: 'GET /api/health',
      audits: { list: 'GET /api/audits', get: 'GET /api/audits/:id', create: 'POST /api/audits', update: 'PUT /api/audits/:id', delete: 'DELETE /api/audits/:id', generatePlan: 'POST /api/audits/:id/generate-plan', checklist: 'GET /api/audits/:id/checklist', logs: 'GET /api/audits/:id/logs' },
      ai: { chat: 'POST /api/ai/chat', knowledge: 'GET /api/ai/knowledge', search: 'POST /api/ai/knowledge/search' }
    }
  });
});

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ success: false, error: 'Internal server error' }); });

app.listen(PORT, () => {
  const aiConfigured = !!process.env.ANTHROPIC_API_KEY;
  console.log(`🚀 AuditAI Backend on port ${PORT}`);
  console.log(`🤖 Modo: ${aiConfigured ? '✅ Producción (Groq llama-3.1-8b)' : '⚠️  Demo (datos pre-generados)'}`);
  console.log(`📚 Knowledge base: ${db.getStats().knowledge_base} entries`);
});

module.exports = app;
