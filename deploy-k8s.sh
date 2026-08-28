#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Script de Despliegue en Kubernetes para Plataforma SaaS PQRS
# Servidor: 161.97.136.42
# ==============================================================================

echo "=================================================="
echo "🚀 Iniciando Despliegue en Kubernetes (PQRS SaaS)"
echo "=================================================="

# 1. Compilación de Imágenes Docker
echo "📦 1. Compilando imágenes Docker locales..."
docker build -t pqrs-api:latest -f src/PQRS.Api/Dockerfile .
docker build -t pqrs-client:latest -f client/Dockerfile client/

# Si se usa k3s o microk8s localmente en el servidor, importar imágenes:
if command -v k3s &> /dev/null; then
    echo "🔄 Importando imágenes a containerd de k3s..."
    docker save pqrs-api:latest | k3s ctr images import -
    docker save pqrs-client:latest | k3s ctr images import -
elif command -v microk8s &> /dev/null; then
    echo "🔄 Importando imágenes a microk8s..."
    docker save pqrs-api:latest | microk8s ctr image import -
    docker save pqrs-client:latest | microk8s ctr image import -
fi

# 2. Aplicar Manifiestos de Kubernetes
echo "☸️ 2. Aplicando manifiestos de Kubernetes..."
kubectl apply -k ./k8s

# 3. Esperar que Postgres esté listo
echo "⏳ 3. Esperando que el pod de PostgreSQL esté en estado Running..."
kubectl rollout status deployment/postgres -n pqrs-saas --timeout=120s

# 4. Inicializar Base de Datos con Seeds y Esquema
echo "🌱 4. Poblando datos semilla en PostgreSQL con pgvector..."
POSTGRES_POD=$(kubectl get pod -n pqrs-saas -l app=postgres -o jsonpath="{.items[0].metadata.name}")

if [ -n "$POSTGRES_POD" ]; then
    echo "   Pod de Base de Datos identificado: $POSTGRES_POD"
    
    # Habilitar extensión pgvector si es necesario
    kubectl exec -i -n pqrs-saas "$POSTGRES_POD" -- psql -U pqrs_app -d pqrs -c "CREATE EXTENSION IF NOT EXISTS vector;" || true
    
    # Cargar Seeds de Knowledge Base
    if [ -f "seed_knowledge_base.sql" ]; then
        echo "   Cargando base de conocimiento (~300 casos FAQ)..."
        cat seed_knowledge_base.sql | kubectl exec -i -n pqrs-saas "$POSTGRES_POD" -- psql -U pqrs_app -d pqrs
    fi

    # Cargar Seeds de Tickets históricos
    if [ -f "seed.sql" ]; then
        echo "   Cargando tickets de prueba..."
        cat seed.sql | kubectl exec -i -n pqrs-saas "$POSTGRES_POD" -- psql -U pqrs_app -d pqrs
    fi
fi

# 5. Esperar que API y Cliente completen el rollout
echo "⏳ 5. Esperando que API y Cliente completen su despliegue..."
kubectl rollout status deployment/pqrs-api -n pqrs-saas --timeout=120s
kubectl rollout status deployment/pqrs-client -n pqrs-saas --timeout=120s

echo "=================================================="
echo "✅ Despliegue en Kubernetes finalizado con éxito!"
echo "=================================================="
kubectl get all -n pqrs-saas
