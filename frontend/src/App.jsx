import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import './styles/main.css';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import AuditList from './pages/AuditList.jsx';
import AuditDetail from './pages/AuditDetail.jsx';
import NewAudit from './pages/NewAudit.jsx';
import ChatPage from './pages/ChatPage.jsx';
import KnowledgePage from './pages/KnowledgePage.jsx';
import LogsPage from './pages/LogsPage.jsx';

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 150, display: window.innerWidth < 768 ? 'block' : 'none'
          }}
        />
      )}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Navegación principal">
        <div className="sidebar-brand">
          <div className="logo-icon" aria-hidden="true">🔍</div>
          <div>
            <h1>AuditAI</h1>
            <span>v1.0 • AI-Powered</span>
          </div>
        </div>
        
        <div className="sidebar-nav">
          <div className="nav-section-label">Principal</div>
          
          <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon" aria-hidden="true">📊</span>
            Dashboard
          </NavLink>
          
          <NavLink to="/audits" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon" aria-hidden="true">📋</span>
            Auditorías
          </NavLink>
          
          <NavLink to="/audits/new" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon" aria-hidden="true">➕</span>
            Nueva Auditoría
          </NavLink>

          <div className="nav-section-label">IA & Conocimiento</div>
          
          <NavLink to="/chat" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon" aria-hidden="true">💬</span>
            Asistente IA
          </NavLink>
          
          <NavLink to="/knowledge" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon" aria-hidden="true">📚</span>
            Base RAG
          </NavLink>

          <div className="nav-section-label">Sistema</div>
          
          <NavLink to="/logs" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon" aria-hidden="true">⚡</span>
            Automatización
          </NavLink>
        </div>
        
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div className="text-xs text-muted">
          </div>
        </div>
      </nav>
    </>
  );
}

function Layout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <header className="topbar" role="banner">
          <div className="topbar-left">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
            >
              ☰
            </button>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-green">● Sistema activo</span>
          </div>
        </header>
        
        <main id="main-content" className="page-content" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export { Layout };

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/audits" element={<AuditList />} />
        <Route path="/audits/new" element={<NewAudit />} />
        <Route path="/audits/:id" element={<AuditDetail />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </Router>
  );
}
