import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../App.jsx';
import { auditsAPI } from '../services/api.js';

const STATUS_LABELS = { pending: 'Pendiente', in_progress: 'En Progreso', completed: 'Completado', skipped: 'Omitido' };
const PRIORITY_COLORS = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-green' };
const PRIORITY_LABELS = { high: 'Alta', medium: 'Media', low: 'Baja' };

function PhaseCard({ phase, auditId, onUpdate }) {
  const [status, setStatus] = useState(phase.status);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await auditsAPI.updatePhase(auditId, phase.id, { status: newStatus });
      setStatus(newStatus);
      onUpdate();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const activities = phase.activities ? phase.activities.split('|').map(a => a.trim()).filter(Boolean) : [];
  const deliverables = phase.deliverables ? phase.deliverables.split('|').map(d => d.trim()).filter(Boolean) : [];

  const phaseClass = status === 'completed' ? 'completed' : status === 'in_progress' ? 'in_progress' : 'pending';

  return (
    <div className={`phase-card ${phaseClass}`} style={{ marginBottom: 12 }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="phase-number">FASE {phase.phase_number} • {phase.phase_type?.toUpperCase()}</div>
          <div className="phase-name">{phase.phase_name}</div>
          <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
            {phase.responsible && <span>👤 {phase.responsible}</span>}
          </div>
          {phase.objectives && (
            <div className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              🎯 {phase.objectives.slice(0, expanded ? 1000 : 120)}{!expanded && phase.objectives.length > 120 ? '...' : ''}
            </div>
          )}
        </div>
        <div className="flex gap-2 items-start">
          <select
            className="form-control"
            style={{ width: 140, fontSize: 12, padding: '4px 8px' }}
            value={status}
            onChange={e => handleStatusChange(e.target.value)}
            disabled={saving}
            aria-label={`Estado de fase ${phase.phase_name}`}
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {activities.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div className="text-xs text-muted" style={{ marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Actividades</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {activities.map((a, i) => (
                  <li key={i} className="text-sm flex gap-2"><span style={{ color: 'var(--accent)' }}>▸</span>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {deliverables.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div className="text-xs text-muted" style={{ marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Entregables</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {deliverables.map((d, i) => (
                  <li key={i} className="text-sm flex gap-2"><span style={{ color: 'var(--success)' }}>📄</span>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {phase.criteria && (
            <div style={{ marginBottom: 10 }}>
              <div className="text-xs text-muted" style={{ marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Criterios de Éxito</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{phase.criteria}</div>
            </div>
          )}
          {phase.notes && (
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
              <div className="text-xs text-muted" style={{ marginBottom: 4, fontWeight: 600 }}>📝 Notas Técnicas</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{phase.notes}</div>
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn-secondary btn-sm"
        style={{ marginTop: 8 }}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? '▲ Menos' : '▼ Ver detalles'}
      </button>
    </div>
  );
}

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await auditsAPI.get(id);
      setData(res.data);
    } catch (e) {
      setError('Error cargando auditoría: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    if (!window.confirm('¿Generar plan completo con IA? Esto reemplazará las fases y requisitos existentes.')) return;
    setGenerating(true);
    setError('');
    try {
      await auditsAPI.generatePlan(id);
      await load();
      setActiveTab('phases');
    } catch (e) {
      setError('Error generando plan: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleReqUpdate = async (reqId, status) => {
    try {
      await auditsAPI.updateRequirement(id, reqId, { status });
      await load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  if (loading) return (
    <Layout title="Cargando...">
      <div className="empty-state">
        <div className="spinner spinner-lg" style={{ margin: '0 auto 16px', borderTopColor: 'var(--accent)' }} />
        <p>Cargando auditoría...</p>
      </div>
    </Layout>
  );

  if (error && !data) return (
    <Layout title="Error">
      <div className="alert alert-danger">{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate('/audits')}>← Volver</button>
    </Layout>
  );

  const { audit, phases, requirements, evaluationDesign, progress } = data;

  const categoryGroups = requirements.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <Layout title={audit.name} subtitle={`${audit.software_name} • ${audit.audit_type}`}>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Header section */}
      <div className="card mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1">
            <div className="flex gap-2 flex-wrap mb-3">
              <span className={`badge ${audit.status === 'completed' ? 'badge-green' : audit.status === 'in_progress' ? 'badge-yellow' : 'badge-gray'}`}>
                {audit.status === 'completed' ? '✓ Completada' : audit.status === 'in_progress' ? '⚙️ En Progreso' : '📝 Borrador'}
              </span>
              <span className="badge badge-blue">{audit.audit_type}</span>
              {audit.organization && <span className="badge badge-purple">🏢 {audit.organization}</span>}
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="progress-bar flex-1" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
              </div>
              <span className="font-semibold text-sm">{progress.progress}%</span>
            </div>
            <div className="text-xs text-muted">
              {progress.phases_done}/{progress.phases_total} fases • {progress.reqs_done}/{progress.reqs_total} requisitos completados
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
              aria-label="Generar plan de auditoría con IA y RAG"
            >
              {generating ? (
                <><span className="spinner" /> Generando con IA...</>
              ) : (
                '🤖 Generar Plan con IA'
              )}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
              💬 Consultar IA
            </button>
          </div>
        </div>

        {generating && (
          <div className="alert alert-info mt-3">
            <span className="spinner" style={{ borderTopColor: 'var(--accent-light)' }} />
            <div>
              <strong>Generando con IA + RAG...</strong> Recuperando contexto de la base de conocimiento e invocando Claude Sonnet para planificar las fases, requisitos y diseño de evaluación. Esto puede tomar 30-60 segundos.
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist">
        {[
          { id: 'overview', label: '📋 Resumen' },
          { id: 'phases', label: `⚙️ Fases (${phases.length})` },
          { id: 'requirements', label: `✓ Requisitos (${requirements.length})` },
          { id: 'evaluation', label: '🔬 Diseño Evaluación' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div id="panel-overview" role="tabpanel">
          <div className="grid-2">
            <div className="card">
              <div className="card-title mb-3">ℹ️ Información General</div>
              {[
                { label: 'Software', value: `${audit.software_name} ${audit.software_version ? 'v' + audit.software_version : ''}` },
                { label: 'Organización', value: audit.organization || '—' },
                { label: 'Tipo', value: audit.audit_type },
                { label: 'Creada', value: new Date(audit.created_at).toLocaleDateString('es-CL') },
                { label: 'Actualizada', value: new Date(audit.updated_at).toLocaleDateString('es-CL') },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm" style={{ marginBottom: 8 }}>
                  <span className="text-muted">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title mb-3">📊 Estadísticas</div>
              {[
                { label: 'Fases totales', value: phases.length },
                { label: 'Fases completadas', value: phases.filter(p => p.status === 'completed').length, color: 'var(--success)' },
                { label: 'Requisitos totales', value: requirements.length },
                { label: 'Requisitos completados', value: requirements.filter(r => r.status === 'completed').length, color: 'var(--success)' },
                { label: 'Req. alta prioridad', value: requirements.filter(r => r.priority === 'high').length, color: 'var(--danger)' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm" style={{ marginBottom: 8 }}>
                  <span className="text-muted">{item.label}</span>
                  <span style={{ color: item.color || 'var(--text-primary)', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {audit.description && (
            <div className="card mt-4">
              <div className="card-title mb-2">📝 Descripción</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{audit.description}</p>
            </div>
          )}

          {audit.scope && (
            <div className="card mt-4">
              <div className="card-title mb-2">🎯 Alcance</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{audit.scope}</p>
            </div>
          )}

          {audit.objectives && (
            <div className="card mt-4">
              <div className="card-title mb-2">🏁 Objetivos</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{audit.objectives}</p>
            </div>
          )}

          {phases.length === 0 && (
            <div className="empty-state mt-4">
              <div className="icon">🤖</div>
              <h3>Genera el Plan de Auditoría</h3>
              <p>Usa el botón "Generar Plan con IA" para que el sistema cree automáticamente las fases, requisitos de evaluación y diseño de evaluación usando RAG sobre estándares ISO, OWASP y COBIT.</p>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generando...' : '🤖 Generar Plan con IA'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASES TAB */}
      {activeTab === 'phases' && (
        <div id="panel-phases" role="tabpanel">
          {phases.length === 0 ? (
            <div className="empty-state">
              <div className="icon">⚙️</div>
              <h3>Sin fases generadas</h3>
              <p>Genera el plan de auditoría con IA para ver las fases.</p>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>🤖 Generar Plan</button>
            </div>
          ) : (
            <>
              <div className="alert alert-info mb-4">
                <span>💡</span>
                <span>Actualiza el estado de cada fase para que el sistema calcule el progreso automáticamente.</span>
              </div>
              {phases.map(phase => (
                <PhaseCard key={phase.id} phase={phase} auditId={id} onUpdate={load} />
              ))}
            </>
          )}
        </div>
      )}

      {/* REQUIREMENTS TAB */}
      {activeTab === 'requirements' && (
        <div id="panel-requirements" role="tabpanel">
          {requirements.length === 0 ? (
            <div className="empty-state">
              <div className="icon">✓</div>
              <h3>Sin requisitos generados</h3>
              <p>Genera el plan de auditoría con IA para ver los requisitos de evaluación.</p>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>🤖 Generar Plan</button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { label: '🔴 Alta prioridad', count: requirements.filter(r => r.priority === 'high').length },
                  { label: '🟡 Media prioridad', count: requirements.filter(r => r.priority === 'medium').length },
                  { label: '🟢 Baja prioridad', count: requirements.filter(r => r.priority === 'low').length },
                  { label: '✅ Completados', count: requirements.filter(r => r.status === 'completed').length },
                ].map((item, i) => (
                  <div key={i} className="stat-card" style={{ padding: '10px 16px' }}>
                    <div className="text-xs text-muted">{item.label}</div>
                    <div className="font-bold" style={{ fontSize: 20 }}>{item.count}</div>
                  </div>
                ))}
              </div>

              {Object.entries(categoryGroups).map(([category, reqs]) => (
                <div key={category} className="card mb-4">
                  <div className="card-header">
                    <span className="card-title">📁 {category.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="badge badge-gray">{reqs.length} requisitos</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {reqs.map(req => (
                      <div key={req.id} style={{
                        padding: '12px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        background: req.status === 'completed' ? 'rgba(63,185,80,0.05)' : 'var(--bg-tertiary)',
                      }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-1 flex-wrap">
                              <span className={`badge ${PRIORITY_COLORS[req.priority] || 'badge-gray'}`}>
                                {PRIORITY_LABELS[req.priority] || req.priority}
                              </span>
                              {req.source && <span className="badge badge-purple text-xs">{req.source}</span>}
                            </div>
                            <p className="text-sm" style={{ marginBottom: 4, color: 'var(--text-primary)' }}>{req.description}</p>
                            {req.verification_method && (
                              <p className="text-xs text-muted">🔍 {req.verification_method}</p>
                            )}
                          </div>
                          <select
                            className="form-control"
                            style={{ width: 130, fontSize: 12, padding: '4px 8px', flexShrink: 0 }}
                            value={req.status}
                            onChange={e => handleReqUpdate(req.id, e.target.value)}
                            aria-label={`Estado del requisito`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="in_progress">En Progreso</option>
                            <option value="completed">Completado</option>
                            <option value="not_applicable">N/A</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* EVALUATION DESIGN TAB */}
      {activeTab === 'evaluation' && (
        <div id="panel-evaluation" role="tabpanel">
          {!evaluationDesign ? (
            <div className="empty-state">
              <div className="icon">🔬</div>
              <h3>Sin diseño de evaluación</h3>
              <p>Genera el plan de auditoría con IA para crear el diseño de evaluación.</p>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>🤖 Generar Plan</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: '🔧 Técnica Principal', value: evaluationDesign.technique, icon: '⚙️' },
                { label: '📋 Metodología', value: evaluationDesign.methodology, icon: '📋' },
                { label: '🛠️ Herramientas', value: evaluationDesign.tools, icon: '🛠️' },
                { label: '📊 Tamaño de Muestra', value: evaluationDesign.sample_size, icon: '📊' },
                { label: '✅ Criterios de Aceptación', value: evaluationDesign.criteria, icon: '✅' },
                { label: '📈 Métricas y Umbrales', value: evaluationDesign.metrics, icon: '📈' },
                { label: '📅 Cronograma', value: evaluationDesign.schedule, icon: '📅' },
                { label: '👥 Recursos Necesarios', value: evaluationDesign.resources, icon: '👥' },
                { label: '⚠️ Riesgos y Mitigaciones', value: evaluationDesign.risks, icon: '⚠️' },
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="card">
                  <div className="card-title mb-2">{item.label}</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {item.value?.split('|').join('\n')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
