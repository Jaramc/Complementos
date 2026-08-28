# ==============================================================================
# Script de Despliegue en Kubernetes (PowerShell)
# Servidor: 161.97.136.42
# ==============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Iniciando Despliegue en Kubernetes (PQRS SaaS)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Compilación de Imágenes Docker
Write-Host "1. Compilando imagenes Docker..." -ForegroundColor Yellow
docker build -t pqrs-api:latest -f src/PQRS.Api/Dockerfile .
docker build -t pqrs-client:latest -f client/Dockerfile client/

# 2. Aplicar Manifiestos de Kubernetes
Write-Host "2. Aplicando manifiestos de Kubernetes..." -ForegroundColor Yellow
kubectl apply -k ./k8s

# 3. Esperar que Postgres esté listo
Write-Host "3. Esperando que el pod de PostgreSQL este listo..." -ForegroundColor Yellow
kubectl rollout status deployment/postgres -n pqrs-saas --timeout=120s

# 4. Inicializar Base de Datos
Write-Host "4. Poblando datos semilla en PostgreSQL con pgvector..." -ForegroundColor Yellow
$postgresPod = kubectl get pod -n pqrs-saas -l app=postgres -o jsonpath="{.items[0].metadata.name}"

if ($postgresPod) {
    Write-Host "   Pod detectado: $postgresPod"
    
    # Habilitar extensión pgvector
    kubectl exec -i -n pqrs-saas $postgresPod -- psql -U pqrs_app -d pqrs -c "CREATE EXTENSION IF NOT EXISTS vector;"

    # Cargar Seeds de Knowledge Base
    if (Test-Path "seed_knowledge_base.sql") {
        Write-Host "   Cargando base de conocimiento (~300 FAQs)..."
        Get-Content seed_knowledge_base.sql | kubectl exec -i -n pqrs-saas $postgresPod -- psql -U pqrs_app -d pqrs
    }

    # Cargar Seeds de Tickets
    if (Test-Path "seed.sql") {
        Write-Host "   Cargando tickets de prueba..."
        Get-Content seed.sql | kubectl exec -i -n pqrs-saas $postgresPod -- psql -U pqrs_app -d pqrs
    }
}

# 5. Esperar rollout de API y Cliente
Write-Host "5. Esperando rollout de API y Cliente..." -ForegroundColor Yellow
kubectl rollout status deployment/pqrs-api -n pqrs-saas --timeout=120s
kubectl rollout status deployment/pqrs-client -n pqrs-saas --timeout=120s

Write-Host "==================================================" -ForegroundColor Green
Write-Host "Despliegue en Kubernetes finalizado con exito!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
kubectl get all -n pqrs-saas
