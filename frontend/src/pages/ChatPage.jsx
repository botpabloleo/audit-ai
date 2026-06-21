import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../App.jsx';
import { aiAPI, auditsAPI } from '../services/api.js';
import ReactMarkdown from 'react-markdown';

const SUGGESTED = [
  '¿Cuáles son las principales fases de una auditoría de software?',
  '¿Qué estándares aplican para auditoría de seguridad?',
  '¿Cómo diseñar un plan de pruebas de rendimiento?',
  '¿Qué incluye el diseño de evaluación según ISO 25010?',
  '¿Cuáles son las herramientas SAST y DAST más utilizadas?',
  'Explica el modelo de calidad ISO/IEC 25010',
  '¿Qué es el OWASP Top 10 y cómo auditarlo?',
  '¿Cómo calcular el tamaño de muestra para pruebas de software?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy **AuditAI**, tu asistente experto en planificación y ejecución de auditorías de software.\n\nPuedo ayudarte con:\n- **Fases de auditoría** y su planificación\n- **Requisitos de evaluación** (funcionales, no funcionales, seguridad)\n- **Diseño de evaluación** y metodologías\n- Estándares como **ISO 25010, OWASP, COBIT, CMMI**\n\n¿En qué puedo ayudarte hoy?',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState('');
  const [audits, setAudits] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    auditsAPI.list().then(res => setAudits(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await aiAPI.chat(msg, selectedAudit || undefined);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        sources: res.data.rag_sources || []
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${e.message}. Verifica que el servicio de IA esté configurado.`,
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Layout title="Asistente IA" subtitle="Consulta sobre auditorías de software con RAG">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, height: 'calc(100vh - 140px)' }}>
        
        {/* Chat */}
        <div className="chat-container">
          <div className="chat-messages" role="log" aria-label="Conversación con AuditAI" aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="rag-sources">
                        <strong>📚 Fuentes RAG recuperadas:</strong>{' '}
                        {msg.sources.map((s, j) => (
                          <span key={j}>
                            <em>{s.title}</em> ({(s.score * 100).toFixed(0)}% relevancia)
                            {j < msg.sources.length - 1 ? ' • ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="chat-bubble assistant">
                <div className="flex items-center gap-2">
                  <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
                  <span className="text-muted text-sm">Consultando base RAG e invocando IA...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <label htmlFor="chat-input" className="sr-only">Escribe tu consulta sobre auditorías de software</label>
            <textarea
              id="chat-input"
              className="chat-input"
              placeholder="Escribe tu consulta sobre auditorías de software..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={2}
              aria-label="Mensaje para el asistente"
            />
            <button
              className="btn btn-primary"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
            >
              {loading ? <span className="spinner" /> : '→'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          {/* Context */}
          <div className="card">
            <div className="card-title mb-3">🎯 Contexto de Auditoría</div>
            <div className="form-group">
              <label className="form-label" htmlFor="audit-context">Vincular auditoría (opcional)</label>
              <select
                id="audit-context"
                className="form-control"
                value={selectedAudit}
                onChange={e => setSelectedAudit(e.target.value)}
              >
                <option value="">Sin contexto específico</option>
                {audits.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.software_name})</option>
                ))}
              </select>
            </div>
            {selectedAudit && (
              <div className="alert alert-info" style={{ padding: '8px 12px', margin: 0 }}>
                <span style={{ fontSize: 12 }}>✓ IA usa el contexto de esta auditoría en sus respuestas</span>
              </div>
            )}
          </div>

          {/* Suggested questions */}
          <div className="card">
            <div className="card-title mb-3">💡 Consultas Sugeridas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', whiteSpace: 'normal', height: 'auto', padding: '8px 10px', fontSize: 12 }}
                  onClick={() => send(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="card">
            <div className="card-title mb-2">⚙️ Sistema RAG</div>
            <div className="text-xs text-muted" style={{ lineHeight: 1.7 }}>
              <div>🔍 Recuperación semántica de conocimiento</div>
              <div>🤖 Claude Sonnet para respuestas</div>
              <div>📚 Base ISO 25010, OWASP, COBIT</div>
              <div>⚡ Augmentación automática del prompt</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
