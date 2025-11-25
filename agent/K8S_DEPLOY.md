# Agent Test - Kubernetes Deployment Guide

## Build and Deploy

### 1. Build Docker Image

```bash
# Build the image
docker build -t agent-test:latest .

# Tag for your registry (replace with your registry)
docker tag agent-test:latest sal1103/agent-test:latest

# Push to registry
docker push sal1103/agent-test:latest
```

### 2. Update Kubernetes Manifest

Edit `k8s-manifest.yaml` and replace `agent-test:latest` with your actual image location:
```yaml
image: sal1103/agent-test:latest
```

### 3. Configure Environment Variables

Edit the ConfigMap and Secret in `k8s-manifest.yaml`:

**ConfigMap** (non-sensitive configuration):
```yaml
data:
  PROXY_BASE_URL: "http://your-proxy-service:8000/v1"
```

**Secret** (sensitive data):
```yaml
stringData:
  PROXY_API_KEY: "your-actual-api-key"
```

### 4. Deploy to Kubernetes

```bash
# Apply the manifest
kubectl apply -f k8s-manifest.yaml

# Check deployment status
kubectl get pods -n agent-test
kubectl get svc -n agent-test

# View logs
kubectl logs -f deployment/agent-test -n agent-test
```

### 5. Access the Service

**ClusterIP Service** (internal access):
```bash
kubectl port-forward svc/agent-test 8080:80 -n agent-test
# Access at http://localhost:8080
```

**LoadBalancer Service** (external access):
```bash
kubectl get svc agent-test-loadbalancer -n agent-test
# Use the EXTERNAL-IP shown
```

## Local Development with Kubernetes

For local testing with Minikube or Kind:

```bash
# For Minikube
minikube start
eval $(minikube docker-env)
docker build -t agent-test:latest .
kubectl apply -f k8s-manifest.yaml

# Access via Minikube
minikube service agent-test-loadbalancer -n agent-test
```

## Scaling

```bash
# Scale replicas
kubectl scale deployment agent-test --replicas=5 -n agent-test

# Auto-scaling (optional)
kubectl autoscale deployment agent-test --min=2 --max=10 --cpu-percent=80 -n agent-test
```

## Troubleshooting

```bash
# Describe pod
kubectl describe pod <pod-name> -n agent-test

# View logs
kubectl logs -f <pod-name> -n agent-test

# Execute into pod
kubectl exec -it <pod-name> -n agent-test -- sh

# Check events
kubectl get events -n agent-test --sort-by='.lastTimestamp'
```
