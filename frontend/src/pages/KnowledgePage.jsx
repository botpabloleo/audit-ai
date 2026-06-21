import React, { useState, useEffect } from 'react';
import { Layout } from '../App.jsx';
import { aiAPI } from '../services/api.js';

const CATEGORY_LABELS = {
  fases_auditoria: '⚙️ Fases de Auditoría',
  requerimientos_evaluacion: '✅ Requerimientos de Evaluación',
  diseno_evaluacion: '🔬 Diseño de Evaluación',
  estandares: '📜 Estándares',
  herramientas: '🛠️ Herramientas',
};

export default function KnowledgePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    aiAPI.getKnowledge().then(res => {
      setEntries(res.data || []);
      setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await aiAPI.searchKnowledge(searchQuery, selectedCategory !== 'all' ? selectedCategory : undefined, 8);
      setSearchResults(res.data);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSearching(false);
    }
  };

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)];
  
  const filteredEntries = searchResults || entries.filter(e => 
    selectedCategory === 'all' || e.category === selectedCategory
  );

  const grouped = filteredEntries.reduce((acc, entry) => {
    const cat = entry.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  return (
    <Layout title="Base de Conocimiento RAG" subtitle="Documentos de referencia para recuperación aumentada">
      
      {/* RAG explanation */}
      <div className="alert alert-info mb-4">
        <span>🧠</span>
        <div>
          <strong>¿Cómo funciona RAG?</strong> Cuando generas un plan con IA, el sistema busca semánticamente en esta base de conocimiento los documentos más relevantes (scoring por similitud de tokens) y los incluye en el prompt enviado a Claude Sonnet, mejorando la precisión y alineación con estándares internacionales.
        </div>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <div className="card-title mb-3">🔍 Búsqueda Semántica RAG</div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="form-control"
            style={{ width: 220 }}
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setSearchResults(null); }}
            aria-label="Filtrar por categoría"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas las categorías' : CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
          <input
            className="form-control flex-1"
            placeholder="Buscar en la base de conocimiento... (ej: 'fases auditoría seguridad')"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            aria-label="Buscar en base de conocimiento"
            style={{ minWidth: 200 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
          >
            {searching ? <><span className="spinner" /> Buscando...</> : '🔍 Buscar RAG'}
          </button>
          {searchResults && (
            <button className="btn btn-secondary" onClick={() => { setSearchResults(null); setSearchQuery(''); }}>
              ✕ Limpiar
            </button>
          )}
        </div>
        
        {searchResults && (
          <div className="mt-3">
            <div className="text-sm text-muted mb-2">
              {searchResults.length} resultado(s) para "<strong>{searchQuery}</strong>" — ordenados por relevancia semántica
            </div>
            {searchResults.length === 0 ? (
              <div className="text-sm text-muted">Sin resultados. Prueba con otros términos.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {searchResults.map((entry, i) => (
                  <div key={entry.id} style={{
                    padding: '12px 14px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    borderLeft: `3px solid ${entry.relevance_score > 0.3 ? 'var(--success)' : entry.relevance_score > 0.15 ? 'var(--warning)' : 'var(--accent)'}`,
                  }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">{entry.title}</span>
                          <span className="badge badge-blue">{CATEGORY_LABELS[entry.category] || entry.category}</span>
                        </div>
                        <div className="text-xs text-muted">{entry.content_preview}</div>
                        {entry.source && <div className="text-xs mt-1" style={{ color: 'var(--accent-light)' }}>📖 {entry.source}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="badge badge-green">
                          {(entry.relevance_score * 100).toFixed(1)}% relevante
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner spinner-lg" style={{ margin: '0 auto 16px', borderTopColor: 'var(--accent)' }} />
          <p>Cargando base de conocimiento...</p>
        </div>
      ) : (
        <div>
          {!searchResults && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? `Todas (${entries.length})` : `${CATEGORY_LABELS[cat]?.split(' ').slice(1).join(' ')} (${entries.filter(e => e.category === cat).length})`}
                </button>
              ))}
            </div>
          )}

          {Object.entries(grouped).map(([category, catEntries]) => (
            <div key={category} className="card mb-4">
              <div className="card-header">
                <span className="card-title">{CATEGORY_LABELS[category] || category}</span>
                <span className="badge badge-gray">{catEntries.length} documentos</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {catEntries.map(entry => (
                  <div key={entry.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                  }}>
                    <button
                      style={{
                        width: '100%', textAlign: 'left', padding: '12px 14px',
                        background: expandedId === entry.id ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                        border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      }}
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      aria-expanded={expandedId === entry.id}
                    >
                      <div>
                        <div className="font-semibold text-sm">{entry.title}</div>
                        {entry.source && <div className="text-xs text-muted mt-1">📖 {entry.source}</div>}
                        {entry.keywords && (
                          <div className="flex gap-1 flex-wrap mt-1">
                            {entry.keywords.split(',').slice(0, 4).map((kw, i) => (
                              <span key={i} className="badge badge-gray" style={{ fontSize: 10 }}>{kw.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{expandedId === entry.id ? '▲' : '▼'}</span>
                    </button>
                    
                    {expandedId === entry.id && (
                      <div style={{ padding: '14px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                          {entry.content || 'Contenido no disponible en vista previa. Ver detalle.'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
