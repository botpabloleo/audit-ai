const fetch = require('node-fetch');
const { db } = require('../models/database');
const { getDemoPhases, getDemoRequirements, getDemoEvaluationDesign } = require('./demoData');

// Groq API - gratuito y rápido
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function isConfigured() {
  return !!process.env.GROQ_API_KEY;
}

async function callGroq(prompt, options = {}) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 4000,
      temperature: 0.3
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API ${response.status}: ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

function parseJSON(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(cleaned); } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse AI response as JSON');
  }
}

async function generateAuditPlan(auditData, ragService) {
  if (!isConfigured()) {
    console.log('⚠️  No API key — using demo data');
    await new Promise(r => setTimeout(r, 1500));
    return getDemoPhases(auditData);
  }
  const prompt = ragService.buildPhasesPrompt(auditData);
  const raw = await callGroq(prompt, { maxTokens: 1500 });
  return parseJSON(raw).phases || [];
}

async function generateRequirements(auditData, ragService) {
  if (!isConfigured()) {
    await new Promise(r => setTimeout(r, 1000));
    return getDemoRequirements(auditData);
  }
  const prompt = ragService.buildRequirementsPrompt(auditData);
  const raw = await callGroq(prompt, { maxTokens: 1500 });
  return parseJSON(raw).requirements || [];
}

async function generateEvaluationDesign(auditData, ragService) {
  if (!isConfigured()) {
    await new Promise(r => setTimeout(r, 800));
    return getDemoEvaluationDesign(auditData);
  }
  const prompt = ragService.buildEvaluationDesignPrompt(auditData);
  const raw = await callGroq(prompt, { maxTokens: 3000 });
  return parseJSON(raw).evaluation_design || parseJSON(raw);
}

async function chat(message, auditContext, ragService) {
  if (!isConfigured()) {
    return `**[Modo Demo]** Configura GROQ_API_KEY en backend/.env para activar el chat.`;
  }
  const prompt = `Eres AuditAI, experto en auditorías de software (ISO 25010, OWASP, COBIT). Responde en español de forma concisa y técnica.

Pregunta: ${message}`;
  return await callGroq(prompt, { maxTokens: 800 });
}

function logAICall(auditId, action, status, details) {
  try { db.insertLog({ audit_id: auditId || null, action, status, details: JSON.stringify(details) }); } catch (e) {}
}

module.exports = { generateAuditPlan, generateRequirements, generateEvaluationDesign, chat, logAICall, isConfigured };
