# 🔍 AuditAI — Sistema Inteligente de Planificación de Auditorías de Software

> Aplicación web full-stack para planificación de auditorías de software asistida por IA, con RAG (Retrieval-Augmented Generation), automatización, API REST y base de datos SQLite.

---

## 📋 Descripción del Proyecto

**AuditAI** es una plataforma web que permite planificar auditorías de software de manera inteligente, cubriendo las tres áreas clave:

- 🔄 **Fases de Auditoría**: Planificación, Recolección, Análisis, Reporte, Seguimiento
- ✅ **Requerimiento de Evaluación**: Funcionales, No funcionales, Seguridad, Rendimiento
- 🔬 **Diseño de Evaluación**: Técnicas, metodología, métricas y criterios de aceptación

---

## ✅ Requisitos del Proyecto Cumplidos

| Requisito | Implementación |
|-----------|---------------|
| 🧠 **RAG (Retrieval-Augmented Generation)** | Base de conocimiento SQLite con 14 documentos técnicos. Recuperación semántica por scoring de tokens. Augmentación automática del prompt enviado a Claude. Visible en `/knowledge` |
| ⚡ **Automatización** | Motor que actualiza estados, calcula progreso, genera checklists, y actualización en cascada al modificar fases/requisitos. Logs en `/logs` |
| 📡 **API REST** | 20+ endpoints Express.js. Documentación en `GET /api`. Incluye endpoints de auditorías, IA, base RAG y logs |
| 🤖 **Servicio de IA** | Integración con Claude Sonnet 4.6 via Anthropic API. Genera fases, requisitos y diseño de evaluación |
| 🗄️ **Base de Datos** | SQLite (mejor-sqlite3) con 6 tablas relacionales: audits, audit_phases, requirements, evaluation_designs, rag_knowledge_base, automation_logs |
| 🌐 **Interfaz Web Responsiva** | React 18 + CSS custom responsive. Mobile-first, WCAG 2.1 AA: skip links, ARIA labels, focus visible, reduced-motion, high-contrast |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFAZ WEB (React 18)                   │
│  Dashboard │ Auditorías │ Nueva │ Chat IA │ RAG │ Logs       │
└────────────────────────┬───────────────────────────────────-─┘
                         │ HTTP REST (axios)
┌────────────────────────▼───────────────────────────────────-─┐
│                    API REST (Express.js)                      │
│                                                               │
│  /api/audits/*      → CRUD + generate-plan + checklist       │
│  /api/ai/chat       → Chat con contexto de auditoría         │
│  /api/ai/knowledge  → Base RAG (listar / buscar)             │
│  /api/health        → Estado del sistema                     │
└──────┬─────────────────┬──────────────────┬──────────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼────────────────┐
│  RAG Service │  │  AI Service   │  │  Automation Service   │
│              │  │               │  │                       │
│ • Tokenize   │  │ • callClaude  │  │ • calculateProgress   │
│ • Score docs │  │ • generatePlan│  │ • autoUpdateStatus    │
│ • Build prompt│  │ • generateReqs│  │ • generateChecklist   │
│ • Log retrieval│  │ • chat()    │  │ • batchUpdatePhases   │
└──────┬───────┘  └───────┬───────┘  └──────┬────────────────┘
       │                  │                  │
┌──────▼──────────────────▼──────────────────▼────────────────┐
│                   SQLite Database (better-sqlite3)            │
│                                                               │
│  audits         │ audit_phases    │ requirements              │
│  evaluation_designs│rag_knowledge_base│automation_logs       │
└──────────────────────────────────────────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │  Anthropic API    │
                │  Claude Sonnet 4.6│
                └───────────────────┘
```

---

## 🚀 Ejecución del Software

### Prerrequisitos

- Node.js 18+ 
- npm 9+
- API Key de Anthropic (https://console.anthropic.com)

### Opción 1: Instalación Manual (Recomendada para desarrollo)

#### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/audit-ai.git
cd audit-ai
```

#### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env y agregar tu ANTHROPIC_API_KEY
nano .env
```

Contenido de `.env`:
```
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
```

#### 3. Iniciar Backend
```bash
npm start
# Backend disponible en http://localhost:3001
# La base de datos SQLite se crea automáticamente en ./data/auditai.db
# La base RAG se siembra con 14 documentos técnicos
```

#### 4. Configurar y lanzar Frontend (nueva terminal)
```bash
cd ../frontend
npm install
npm start
# Frontend disponible en http://localhost:3000
```

### Opción 2: Docker Compose

```bash
# Clonar y configurar
git clone https://github.com/TU_USUARIO/audit-ai.git
cd audit-ai

# Crear archivo de entorno
echo "ANTHROPIC_API_KEY=sk-ant-TU_KEY" > .env

# Levantar todos los servicios
docker-compose up --build

# Acceder en http://localhost:3000
```

---

## 📡 Documentación de la API

### Base URL: `http://localhost:3001/api`

#### Auditorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/audits` | Listar todas las auditorías |
| POST | `/audits` | Crear nueva auditoría |
| GET | `/audits/:id` | Obtener auditoría con fases, requisitos y diseño |
| PUT | `/audits/:id` | Actualizar auditoría |
| DELETE | `/audits/:id` | Eliminar auditoría |
| **POST** | `/audits/:id/generate-plan` | **⭐ Generar plan completo con IA + RAG** |
| GET | `/audits/:id/checklist` | Generar checklist de auditoría |
| GET | `/audits/:id/logs` | Logs de automatización |
| PATCH | `/audits/:id/phases/batch-status` | Actualización masiva de estados |
| PUT | `/audits/:id/phases/:phaseId` | Actualizar fase individual |
| PUT | `/audits/:id/requirements/:reqId` | Actualizar requisito |

#### IA y RAG

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ai/chat` | Chat con asistente IA (con RAG) |
| GET | `/ai/knowledge` | Listar base de conocimiento RAG |
| GET | `/ai/knowledge/:id` | Detalle de documento RAG |
| POST | `/ai/knowledge/search` | **⭐ Búsqueda semántica RAG** |

#### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del sistema y estadísticas |
| GET | `/` | Documentación de endpoints |

---

## 🧠 Cómo Funciona el RAG

1. **Base de Conocimiento**: 14 documentos técnicos sobre ISO 25010, OWASP, COBIT, técnicas de prueba, métricas de calidad, etc. almacenados en SQLite.

2. **Recuperación Semántica**: Al generar un plan o hacer una consulta, el sistema tokeniza la consulta y calcula un score de similitud (Jaccard modificado) contra todos los documentos de la base.

3. **Augmentación del Prompt**: Los 5-6 documentos más relevantes se inyectan en el prompt enviado a Claude Sonnet, proporcionando contexto técnico especializado.

4. **Demostración Visual**: En la página `/knowledge` puedes buscar en la base RAG y ver los scores de relevancia en tiempo real.

---

## ⚡ Motor de Automatización

El sistema automatiza las siguientes tareas:

- **Auto-actualización de estado**: Al cambiar el estado de una fase o requisito, el estado general de la auditoría se recalcula automáticamente (draft → in_progress → completed).
- **Cálculo de progreso**: Fórmula ponderada: fases (70%) + requisitos (30%).
- **Generación de checklist**: Consolidación automática de todas las fases y requisitos en un checklist descargable.
- **Logging**: Registro de todas las operaciones en la tabla `automation_logs`.
- **Actualización masiva**: Endpoint batch para actualizar múltiples fases simultáneamente.

---

## 🌐 Accesibilidad (WCAG 2.1 AA)

- ✅ Skip link "Saltar al contenido principal"
- ✅ `aria-label` en todos los controles interactivos
- ✅ `role="tablist"` / `role="tab"` / `aria-selected` en pestañas
- ✅ `role="log"` / `aria-live="polite"` en el chat
- ✅ Focus visible en todos los elementos interactivos
- ✅ `@media (prefers-reduced-motion)` para animaciones
- ✅ `@media (prefers-contrast: high)` para contraste
- ✅ `.sr-only` para labels de screen reader
- ✅ Semántica correcta: `<nav>`, `<main>`, `<header>`, `<article>`
- ✅ Contraste de colores AA (texto sobre fondos oscuros)
- ✅ Responsive mobile-first (breakpoints 768px, 1024px)

---

## 🗄️ Esquema de Base de Datos

```sql
-- 6 tablas en SQLite (auditai.db)
audits                  -- Auditorías principales
audit_phases            -- Fases de cada auditoría (FK → audits)
requirements            -- Requisitos de evaluación (FK → audits)
evaluation_designs      -- Diseño de evaluación (FK → audits)
rag_knowledge_base      -- Documentos para RAG (14 entradas iniciales)
automation_logs         -- Registro de automatización
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, React Router 6, Recharts, React Markdown |
| Backend | Node.js, Express.js |
| Base de Datos | SQLite (better-sqlite3) |
| IA | Anthropic Claude Sonnet 4.6 |
| RAG | Implementación propia (tokenización + scoring semántico) |
| Estilos | CSS custom con variables (sin framework CSS) |
| Despliegue | Docker + Docker Compose + Nginx |

---

## 📁 Estructura del Repositorio

```
audit-ai/
├── backend/
│   ├── models/
│   │   └── database.js          # Esquema SQLite + seed RAG
│   ├── services/
│   │   ├── ragService.js        # Motor RAG
│   │   ├── aiService.js         # Cliente Anthropic API
│   │   └── automationService.js # Automatización
│   ├── routes/
│   │   ├── audits.js            # API /audits
│   │   └── ai.js                # API /ai
│   ├── data/                    # SQLite DB (auto-generado)
│   ├── server.js                # Entry point Express
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── AuditList.js
│   │   │   ├── AuditDetail.js   # ⭐ Página principal
│   │   │   ├── NewAudit.js
│   │   │   ├── ChatPage.js
│   │   │   ├── KnowledgePage.js # RAG demo
│   │   │   └── LogsPage.js      # Automatización
│   │   ├── services/
│   │   │   └── api.js           # Cliente HTTP
│   │   ├── styles/
│   │   │   └── main.css         # Design system
│   │   ├── App.js               # Router + Layout
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
```

---

## 👥 Equipo

Proyecto para la asignatura de **Inteligencia Artificial Aplicada** — INACAP Valdivia

---

## 📜 Licencia

MIT License
