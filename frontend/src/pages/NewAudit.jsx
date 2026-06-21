import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../App.jsx';
import { auditsAPI } from '../services/api.js';

const AUDIT_TYPES = [
  { value: 'seguridad', label: '🔒 Seguridad', desc: 'Vulnerabilidades, OWASP, penetration testing' },
  { value: 'calidad', label: '⭐ Calidad ISO 25010', desc: 'Funcionalidad, rendimiento, usabilidad' },
  { value: 'cumplimiento', label: '📜 Cumplimiento Normativo', desc: 'GDPR, regulaciones sectoriales' },
  { value: 'funcional', label: '⚙️ Funcional', desc: 'Verificación de requisitos funcionales' },
  { value: 'rendimiento', label: '🚀 Rendimiento', desc: 'Carga, estrés, escalabilidad' },
  { value: 'integral', label: '🔬 Auditoría Integral', desc: 'Evaluación completa multi-dimensión' },
];

export default function NewAudit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    software_name: '',
    software_version: '',
    organization: '',
    audit_type: '',
    description: '',
    scope: '',
    objectives: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.software_name || !form.audit_type) {
      setError('Los campos Nombre, Software y Tipo de Auditoría son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await auditsAPI.create(form);
      navigate(`/audits/${res.data.id}`);
    } catch (e) {
      setError('Error al crear auditoría: ' + e.message);
      setLoading(false);
    }
  };

  return (
    <Layout title="Nueva Auditoría" subtitle="Crear plan de auditoría de software">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {error && (
          <div className="alert alert-danger" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title">📋 Información General</span>
            <span className="badge badge-blue">Paso 1 de 1</span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Nombre de la Auditoría <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="name"
                className="form-control"
                placeholder="Ej: Auditoría de Seguridad Q2-2025"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="software_name">
                Software a Auditar <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="software_name"
                className="form-control"
                placeholder="Ej: Sistema de Gestión Hospitalaria"
                value={form.software_name}
                onChange={e => update('software_name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="software_version">Versión del Software</label>
              <input
                id="software_version"
                className="form-control"
                placeholder="Ej: 2.4.1"
                value={form.software_version}
                onChange={e => update('software_version', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="organization">Organización / Cliente</label>
              <input
                id="organization"
                className="form-control"
                placeholder="Ej: Hospital Regional Valdivia"
                value={form.organization}
                onChange={e => update('organization', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Descripción del Software</label>
            <textarea
              id="description"
              className="form-control"
              placeholder="Describe brevemente el software: qué hace, quiénes lo usan, tecnologías principales..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title">🎯 Tipo de Auditoría</span>
            <span className="text-xs text-muted">Requerido</span>
          </div>

          <div role="group" aria-label="Seleccionar tipo de auditoría">
            <div className="grid-2" style={{ gap: 10 }}>
              {AUDIT_TYPES.map(type => (
                <label
                  key={type.value}
                  style={{
                    display: 'block',
                    padding: '14px 16px',
                    border: `2px solid ${form.audit_type === type.value ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    background: form.audit_type === type.value ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="audit_type"
                    value={type.value}
                    checked={form.audit_type === type.value}
                    onChange={e => update('audit_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-semibold text-sm">{type.label}</div>
                  <div className="text-xs text-muted mt-2">{type.desc}</div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title">📝 Alcance y Objetivos</span>
            <span className="text-xs text-muted">Recomendado para mejor resultado de IA</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="scope">Alcance de la Auditoría</label>
            <textarea
              id="scope"
              className="form-control"
              placeholder="Define qué módulos, componentes o procesos se incluyen. Ej: Módulo de autenticación, API REST, base de datos de usuarios, interfaz web..."
              value={form.scope}
              onChange={e => update('scope', e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="objectives">Objetivos de la Auditoría</label>
            <textarea
              id="objectives"
              className="form-control"
              placeholder="Lista los objetivos específicos. Ej: Identificar vulnerabilidades críticas de seguridad, verificar cumplimiento de ISO 25010, evaluar rendimiento bajo carga..."
              value={form.objectives}
              onChange={e => update('objectives', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="alert alert-info">
          <span>💡</span>
          <div>
            <strong>Generación con IA + RAG:</strong> Una vez creada la auditoría, podrás usar el botón <strong>"Generar Plan con IA"</strong> para que el sistema planifique automáticamente las fases, requisitos de evaluación y diseño de evaluación usando RAG sobre base de conocimiento de estándares ISO, OWASP y COBIT.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/audits')}>
            Cancelar
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" /> Creando...</>
            ) : (
              '✓ Crear Auditoría'
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
