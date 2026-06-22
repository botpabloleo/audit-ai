# 🔍 AuditAI — Sistema Inteligente de Planificación de Auditorías de Software

> Aplicación web full-stack para planificación de auditorías de software asistida por IA, con RAG (Retrieval-Augmented Generation), automatización, API REST y base de datos.

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
| 🧠 **RAG (Retrieval-Augmented Generation)** | Base de conocimiento con 14 documentos técnicos. Recuperación semántica por scoring de tokens. Augmentación automática del prompt enviado a la IA. Visible en `/knowledge` |
| ⚡ **Automatización** | Motor que actualiza estados, calcula progreso, genera checklists y actualiza en cascada al modificar fases/requisitos. Logs en `/logs` |
| 📡 **API REST** | 20+ endpoints Express.js. Documentación en `GET /api`. Incluye endpoints de auditorías, IA, base RAG y logs |
| 🤖 **Servicio de IA** | Integración con LLaMA 3.3 70B via Groq API. Genera fases, requisitos y diseño de evaluación |
| 🗄️ **Base de Datos** | lowdb (JSON file-based) con 6 colecciones: audits, audit_phases, requirements, evaluation_designs, rag_knowledge_base, automation_logs |
| 🌐 **Interfaz Web Responsiva** | React 18 + Vite, CSS custom responsive. Mobile-first, WCAG 2.1 AA: skip links, ARIA labels, focus visible, reduced-motion, high-contrast |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFAZ WEB (React 18)                   │
│  Dashboard │ Auditorías │ Nueva │ Chat IA │ RAG │ Logs       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST (axios)
┌────────────────────────▼────────────────────────────────────┐
│                    API REST (Express.js)                      │
│                                                               │
│  /api/audits/*      → CRUD + generate-plan + checklist       │
│  /api/ai/chat       → Chat con contexto de auditoría         │
│  /api/ai/knowledge  → Base RAG (listar / buscar)             │
│  /api/health        → Estado del sistema                     │
└──────┬─────────────────┬──────────────────┬─────────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼────────────────┐
│  RAG Service │  │  AI Service   │  │  Automation Service   │
│              │  │               │  │                       │
│ • Tokenize   │  │ • callGroq    │  │ • calculateProgress   │
│ • Score docs │  │ • generatePlan│  │ • autoUpdateStatus    │
│ • Build prompt│  │ • generateReqs│  │ • generateChecklist   │
│ • Log retrieval│  │ • chat()    │  │ • batchUpdatePhases   │
└──────┬───────┘  └───────┬───────┘  └──────┬────────────────┘
       │                  │                  │
┌──────▼──────────────────▼──────────────────▼───────────────┐
│                   Base de Datos (lowdb JSON)                  │
│                                                               │
│  audits         │ audit_phases    │ requirements              │
│  evaluation_designs│rag_knowledge_base│automation_logs       │
└─────────────────────────────────────────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │    Groq API       │
                │  LLaMA 3.3 70B    │
                └───────────────────┘
```

---

## 🚀 Ejecución del Software

### Prerrequisitos

- Node.js 18+
- npm 9+
- API Key de Groq (https://console.groq.com) — gratuita, sin tarjeta

### Instalación y ejecución

#### 1. Clonar el repositorio
```bash
git clone https://github.com/botpabloleo/audit-ai.git
cd audit-ai
```

#### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env y agregar tu GROQ_API_KEY
```

Contenido de `.env`:
```
PORT=3001
GROQ_API_KEY=gsk_...tu_key_aqui
FRONTEND_URL=http://localhost:3000
```

#### 3. Iniciar Backend
```bash
npm start
# Backend disponible en http://localhost:3001
```

#### 4. Iniciar Frontend (nueva terminal)
```bash
cd ../frontend
npm install
npm run dev
# Frontend disponible en http://localhost:3000
```

### Modo Demo (sin API Key)

Si no configuras `GROQ_API_KEY`, el sistema funciona en **modo demo** con datos pre-generados realistas. El RAG, automatización, base de datos y API REST funcionan con normalidad.

### Docker Compose

```bash
echo "GROQ_API_KEY=gsk_...tu_key" > .env
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
| POST | `/audits/:id/generate-plan` | ⭐ Generar plan completo con IA + RAG |
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
| POST | `/ai/knowledge/search` | ⭐ Búsqueda semántica RAG |

#### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del sistema y estadísticas |
| GET | `/` | Documentación de endpoints |

---

## 🧠 Cómo Funciona el RAG

1. **Base de Conocimiento**: 14 documentos técnicos sobre ISO 25010, OWASP, COBIT, técnicas de prueba, métricas de calidad, almacenados en la base de datos.

2. **Recuperación Semántica**: Al generar un plan o hacer una consulta, el sistema tokeniza la consulta y calcula un score de similitud contra todos los documentos.

3. **Augmentación del Prompt**: Los documentos más relevantes se inyectan en el prompt enviado a LLaMA 3.3, mejorando la precisión y alineación con estándares técnicos.

4. **Demostración Visual**: En la página `/knowledge` puedes buscar en la base RAG y ver los scores de relevancia en tiempo real.

---

## ⚡ Motor de Automatización

- **Auto-actualización de estado**: Al cambiar el estado de una fase o requisito, el estado general de la auditoría se recalcula automáticamente.
- **Cálculo de progreso**: Fórmula ponderada: fases (70%) + requisitos (30%).
- **Generación de checklist**: Consolidación automática de todas las fases y requisitos.
- **Logging**: Registro de todas las operaciones en la colección `automation_logs`.
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
- ✅ Responsive mobile-first (breakpoints 768px, 1024px)

---

## 🗄️ Esquema de Base de Datos

```
6 colecciones en lowdb (auditai.json):
audits                  — Auditorías principales
audit_phases            — Fases de cada auditoría
requirements            — Requisitos de evaluación
evaluation_designs      — Diseño de evaluación
rag_knowledge_base      — Documentos para RAG (14 entradas iniciales)
automation_logs         — Registro de automatización
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, React Router 6, Recharts, React Markdown |
| Backend | Node.js, Express.js |
| Base de Datos | lowdb (JSON file-based) |
| IA | LLaMA 3.3 70B via Groq API |
| RAG | Implementación propia (tokenización + scoring semántico) |
| Estilos | CSS custom con variables (sin framework CSS) |
| Despliegue | Docker + Docker Compose + Nginx |

---

## 📁 Estructura del Repositorio

```
audit-ai/
├── backend/
│   ├── models/
│   │   └── database.js          # lowdb + seed RAG
│   ├── services/
│   │   ├── ragService.js        # Motor RAG
│   │   ├── aiService.js         # Cliente Groq API
│   │   ├── automationService.js # Automatización
│   │   └── demoData.js          # Datos demo sin API key
│   ├── routes/
│   │   ├── audits.js            # API /audits
│   │   └── ai.js                # API /ai
│   ├── data/                    # JSON DB (auto-generado)
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AuditList.jsx
│   │   │   ├── AuditDetail.jsx
│   │   │   ├── NewAudit.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── KnowledgePage.jsx
│   │   │   └── LogsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── index.html
│   ├── vite.config.js
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

- Pablo
- Nicolás
- Sebastián
- Ignacio

---

## 📜 Licencia

MIT License
