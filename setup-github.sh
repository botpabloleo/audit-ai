#!/bin/bash
# Script para inicializar el repositorio y subirlo a GitHub

set -e

echo "🚀 AuditAI - Setup del repositorio GitHub"
echo "=========================================="

# Verificar que git esté instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado."
    exit 1
fi

# Pedir datos al usuario
read -p "Tu nombre de usuario de GitHub: " GITHUB_USER
read -p "Nombre del repositorio (ej: audit-ai): " REPO_NAME
read -p "Tu email de GitHub: " GITHUB_EMAIL

# Configurar git
git config --global user.name "$GITHUB_USER"
git config --global user.email "$GITHUB_EMAIL"

# Inicializar repositorio
cd "$(dirname "$0")"

if [ ! -d ".git" ]; then
    git init
    echo "✅ Repositorio Git inicializado"
fi

# Crear .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Build output
frontend/build/

# Environment files (NEVER commit your API keys)
.env
backend/.env
*.env

# Database (auto-generated)
backend/data/*.db

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
*.log

# IDE
.vscode/
.idea/
EOF

echo "✅ .gitignore creado"

# Agregar todos los archivos
git add .
git commit -m "feat: initial commit - AuditAI sistema de auditorías con IA + RAG

- Backend Express.js con API REST (20+ endpoints)
- Motor RAG con base de conocimiento ISO 25010, OWASP, COBIT
- Servicio IA con Claude Sonnet 4.6 (Anthropic API)
- Motor de automatización (status, progreso, checklist, logs)
- Base de datos SQLite con 6 tablas
- Frontend React 18 con diseño accesible WCAG 2.1 AA
- Dashboard, gestión de auditorías, chat IA, búsqueda RAG
- Docker + Docker Compose para despliegue
- README con arquitectura y documentación completa"

echo "✅ Commit inicial creado"
echo ""
echo "📋 Próximos pasos:"
echo "1. Crea el repositorio en GitHub: https://github.com/new"
echo "   Nombre: $REPO_NAME"
echo "   Visibilidad: Public (para entregar)"
echo ""
echo "2. Luego ejecuta:"
echo "   git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "✅ ¡Listo! Tu repositorio estará en:"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
