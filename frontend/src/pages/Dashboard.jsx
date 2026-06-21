import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../App.jsx';
import { auditsAPI, healthAPI } from '../services/api.js';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      auditsAPI.list().catch(() => ({ data: [] })),
      healthAPI.check().catch(() => null)
    ]).then(([auditsRes, healthRes]) => {
      setAudits(auditsRes.data || []);
      setHealth(healthRes);
      setLoading(false);
    });
  }, []);

  const stats = {
    total: audits.length,
    inProgress: audits.filter(a => a.status === 'in_progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
    draft: audits.filter(a => a.status === 'draft').length,
  };

  const statusData = [
    { name: 'Borrador', value: stats.draft, color: '#484f58' },
    { name: 'En Progreso', value: stats.inProgress, color: '#d29922' },
    { name: 'Completadas', value: stats.completed, color: '#3fb950' },
  ].filter(d => d.value > 0);

  const typeData = Object.entries(
    audits.reduce((acc, a) => { acc[a.audit_type] = (acc[a.audit_type] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const recentAudits = [...audits].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  const statusBadge = (s) => {
    const map = { draft: 'badge-gray', in_progress: 'badge-yellow', completed: 'badge-green' };
    const labels = { draft: 'Borrador', in_progress: 'En Progreso', completed: 'Completada' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{labels[s] || s}</span>;
  };

  return (
    <Layout title="Dashboard" subtitle="Resumen del sistema de auditoría">
      {loading ? (
        <div className="empty-state">
          <div className="spinner spinner-lg" style={{ margin: '0 auto 16px', borderTopColor: 'var(--accent)' }} />
          <p>Cargando dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid-4 mb-4">
            {[
              { label: 'Total Auditorías', value: stats.total, sub: 'registradas', icon: '📋' },
              { label: 'En Progreso', value: stats.inProgress, sub: 'activas ahora', icon: '⚙️' },
              { label: 'Completadas', value: stats.completed, sub: 'finalizadas', icon: '✅' },
              { label: 'Base RAG', value: health?.stats?.knowledge_base || '—', sub: 'entradas de conocimiento', icon: '📚' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{s.icon} {s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid-2 mb-4">
            {/* Chart */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Estado de Auditorías</span>
              </div>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <p>No hay datos aún. <button className="btn btn-primary btn-sm mt-2" onClick={() => navigate('/audits/new')}>Crear primera auditoría</button></p>
                </div>
              )}
            </div>

            {/* System status */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Estado del Sistema</span>
                {health && <span className="badge badge-green">● Operativo</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: health?.mode === 'demo' ? '⚠️ Modo Demo (datos pre-generados)' : '🤖 Servicio IA (Claude Sonnet)', status: true },
                  { label: '📚 Base RAG (Knowledge Base)', status: true },
                  { label: '🗄️ Base de Datos SQLite', status: !!health },
                  { label: '⚡ Motor de Automatización', status: true },
                  { label: '📡 API REST', status: !!health },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <span className={`badge ${item.status ? 'badge-green' : 'badge-red'}`}>
                      {item.status ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="divider" />
              
              <div className="text-xs text-muted">
                <div>Logs de automatización: {health?.stats?.automation_logs || 0}</div>
                <div>Última actualización: {new Date().toLocaleTimeString('es-CL')}</div>
              </div>
            </div>
          </div>

          {/* Recent audits */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Auditorías Recientes</span>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/audits/new')}>
                + Nueva Auditoría
              </button>
            </div>
            
            {recentAudits.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Nombre</th>
                      <th scope="col">Software</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Progreso</th>
                      <th scope="col">Creada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAudits.map(audit => (
                      <tr key={audit.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/audits/${audit.id}`)}>
                        <td className="font-semibold">{audit.name}</td>
                        <td className="text-muted">{audit.software_name}</td>
                        <td><span className="badge badge-blue">{audit.audit_type}</span></td>
                        <td>{statusBadge(audit.status)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar" style={{ width: 80 }}>
                              <div className="progress-fill" style={{ width: `${audit.progress || 0}%` }} />
                            </div>
                            <span className="text-xs text-muted">{audit.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="text-xs text-muted">{new Date(audit.created_at).toLocaleDateString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <div className="icon">🔍</div>
                <h3>Sin auditorías registradas</h3>
                <p>Crea tu primera auditoría de software con planificación asistida por IA.</p>
                <button className="btn btn-primary" onClick={() => navigate('/audits/new')}>
                  Crear Primera Auditoría
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
