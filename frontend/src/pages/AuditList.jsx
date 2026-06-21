import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../App.jsx';
import { auditsAPI } from '../services/api.js';

export default function AuditList() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      const res = await auditsAPI.list();
      setAudits(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta auditoría y todos sus datos?')) return;
    setDeleting(id);
    try {
      await auditsAPI.delete(id);
      setAudits(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = audits.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = !search || 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.software_name.toLowerCase().includes(search.toLowerCase()) ||
      a.organization?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusBadge = (s) => {
    const map = { draft: ['badge-gray', 'Borrador'], in_progress: ['badge-yellow', 'En Progreso'], completed: ['badge-green', 'Completada'] };
    const [cls, label] = map[s] || ['badge-gray', s];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const priorityIcon = (p) => ({ high: '🔴', medium: '🟡', low: '🟢' })[p] || '⚪';

  return (
    <Layout title="Auditorías" subtitle="Gestión de auditorías de software">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {['all', 'draft', 'in_progress', 'completed'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todas' : f === 'draft' ? 'Borrador' : f === 'in_progress' ? 'En Progreso' : 'Completadas'}
              {f === 'all' ? ` (${audits.length})` : ` (${audits.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="form-control"
            style={{ width: 200 }}
            placeholder="Buscar auditorías..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar auditorías"
          />
          <button className="btn btn-primary" onClick={() => navigate('/audits/new')}>
            + Nueva
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner spinner-lg" style={{ margin: '0 auto 16px', borderTopColor: 'var(--accent)' }} />
          <p>Cargando auditorías...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>{search ? 'Sin resultados' : 'No hay auditorías'}</h3>
          <p>{search ? 'Prueba con otros términos de búsqueda.' : 'Crea tu primera auditoría de software.'}</p>
          {!search && (
            <button className="btn btn-primary" onClick={() => navigate('/audits/new')}>
              Crear Auditoría
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(audit => (
            <div
              key={audit.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
              onClick={() => navigate(`/audits/${audit.id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              role="article"
              aria-label={`Auditoría: ${audit.name}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold" style={{ fontSize: 16 }}>{audit.name}</h3>
                    {statusBadge(audit.status)}
                    <span className="badge badge-blue">{audit.audit_type}</span>
                  </div>
                  <div className="text-sm text-muted mb-3">
                    🖥️ {audit.software_name} {audit.software_version && `v${audit.software_version}`}
                    {audit.organization && ` • 🏢 ${audit.organization}`}
                  </div>
                  {audit.description && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {audit.description.slice(0, 150)}{audit.description.length > 150 ? '...' : ''}
                    </p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Progreso:</span>
                      <div className="progress-bar" style={{ width: 100 }}>
                        <div className="progress-fill" style={{ width: `${audit.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-muted">{audit.progress || 0}%</span>
                    </div>
                    <span className="text-xs text-muted">📋 {audit.phases_count || 0} fases</span>
                    <span className="text-xs text-muted">✓ {audit.requirements_count || 0} requisitos</span>
                    <span className="text-xs text-muted">📅 {new Date(audit.created_at).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/audits/${audit.id}`)}
                    aria-label={`Ver detalles de ${audit.name}`}
                  >
                    Ver →
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => handleDelete(audit.id, e)}
                    disabled={deleting === audit.id}
                    aria-label={`Eliminar auditoría ${audit.name}`}
                  >
                    {deleting === audit.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
