import React, { useState, useEffect } from 'react';
import { Layout } from '../App.jsx';
import { auditsAPI } from '../services/api.js';
import axios from 'axios';

const ACTION_LABELS = {
  audit_created: '📋 Auditoría creada',
  generate_plan_start: '🚀 Inicio generación de plan',
  generate_plan_error: '❌ Error en generación',
  generate_full_plan: '🤖 Plan generado con IA',
  auto_status_update: '⚡ Actualización automática de estado',
  generate_checklist: '📝 Checklist generado',
  batch_phase_update: '🔄 Actualización masiva de fases',
  rag_retrieval: '📚 Recuperación RAG',
  'ai_chat': '💬 Consulta IA',
};

const STATUS_COLORS = {
  success: 'badge-green',
  pending: 'badge-yellow',
  error: 'badge-red',
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadLogs = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.get(`${API_BASE}/audits/system/logs`).catch(() => ({ data: { data: [] } }));
      // Try to get logs from all audits
      const auditsRes = await auditsAPI.list();
      const allLogs = [];
      for (const audit of (auditsRes.data || []).slice(0, 10)) {
        try {
          const logsRes = await auditsAPI.getLogs(audit.id);
          allLogs.push(...(logsRes.data || []).map(l => ({ ...l, audit_name: audit.name })));
        } catch (e) {}
      }
      allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setLogs(allLogs.slice(0, 200));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filtered = logs.filter(l => filter === 'all' || l.status === filter || l.action === filter);

  const actionCounts = logs.reduce((acc, l) => {
    acc[l.action] = (acc[l.action] || 0) + 1;
    return acc;
  }, {});

  const parseDetails = (details) => {
    if (!details) return null;
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;
      return parsed;
    } catch { return null; }
  };

  return (
    <Layout title="Automatización" subtitle="Logs del motor de automatización del sistema">
      
      {/* Stats */}
      <div className="grid-4 mb-4">
        {[
          { label: '⚡ Total Eventos', value: logs.length },
          { label: '✅ Exitosos', value: logs.filter(l => l.status === 'success').length },
          { label: '❌ Errores', value: logs.filter(l => l.status === 'error').length },
          { label: '📚 Recuperaciones RAG', value: logs.filter(l => l.action === 'rag_retrieval').length },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-4">
        {/* Filter controls */}
        <div className="card">
          <div className="card-title mb-3">🔧 Filtros</div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'success', 'error', 'pending'].map(f => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Todos' : f === 'success' ? '✅ Exitosos' : f === 'error' ? '❌ Errores' : '⏳ Pendientes'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            <label htmlFor="auto-refresh" className="text-sm">Auto-actualizar cada 5s</label>
          </div>
          <button className="btn btn-secondary btn-sm mt-2" onClick={loadLogs}>
            🔄 Actualizar ahora
          </button>
        </div>

        {/* Top actions */}
        <div className="card">
          <div className="card-title mb-3">📊 Acciones más frecuentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(actionCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between text-sm">
                  <span>{ACTION_LABELS[action] || action}</span>
                  <span className="badge badge-blue">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Automation explanation */}
      <div className="alert alert-info mb-4">
        <span>⚡</span>
        <div>
          <strong>Motor de Automatización AuditAI:</strong> El sistema registra automáticamente todas las operaciones: creación de auditorías, generaciones IA, recuperaciones RAG, actualizaciones de estado de fases, y cálculo de progreso. El estado de las auditorías se actualiza automáticamente al modificar fases o requisitos.
        </div>
      </div>

      {/* Logs table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📜 Log de Eventos ({filtered.length})</span>
          {autoRefresh && <span className="badge badge-green">● En vivo</span>}
        </div>
        
        {loading ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px', borderTopColor: 'var(--accent)' }} />
            <p>Cargando logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="icon">📋</div>
            <h3>Sin eventos</h3>
            <p>Crea y genera planes de auditoría para ver los logs de automatización.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Acción</th>
                  <th scope="col">Auditoría</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const details = parseDetails(log.details);
                  return (
                    <tr key={log.id}>
                      <td className="font-mono text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('es-CL', { 
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                          day: '2-digit', month: '2-digit'
                        })}
                      </td>
                      <td>
                        <span className="text-sm">{ACTION_LABELS[log.action] || log.action}</span>
                      </td>
                      <td className="text-sm text-muted">
                        {log.audit_name ? log.audit_name.slice(0, 30) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[log.status] || 'badge-gray'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="text-xs text-muted font-mono">
                        {details ? (
                          <span title={JSON.stringify(details, null, 2)}>
                            {Object.entries(details).slice(0, 2).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(' • ')}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
