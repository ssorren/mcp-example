# API Deployment Guide

## Building and Publishing the Docker Image

### Prerequisites
- Docker installed and running
- Access to a container registry (Docker Hub, Google Container Registry, AWS ECR, etc.)
- Logged into your container registry

### Docker Hub

1. **Login to Docker Hub**
   ```bash
   docker login
   ```

2. **Build the image with your Docker Hub username**
   ```bash
   docker build -t sal1103/mock-api:latest .
   docker build -t sal1103/mock-api:v1.0.0 .
   ```

3. **Push the image**
   ```bash
   docker push sal1103/mock-api:latest
   docker push sal1103/mock-api:v1.0.0
   ```

4. **Update the Kubernetes manifest**
   
   Edit `k8s-manifest.yaml` and replace `image: api:latest` with:
   ```yaml
   image: sal1103/mock-api:latest
   ```

### Google Container Registry (GCR)

1. **Configure Docker to use GCR**
   ```bash
   gcloud auth configure-docker
   ```

2. **Build and tag the image**
   ```bash
   docker build -t gcr.io/your-project-id/api:latest .
   docker build -t gcr.io/your-project-id/api:v1.0.0 .
   ```

3. **Push the image**
   ```bash
   docker push gcr.io/your-project-id/api:latest
   docker push gcr.io/your-project-id/api:v1.0.0
   ```

4. **Update the Kubernetes manifest**
   
   Edit `k8s-manifest.yaml` and replace `image: api:latest` with:
   ```yaml
   image: gcr.io/your-project-id/api:latest
   ```

### AWS Elastic Container Registry (ECR)

1. **Login to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
   ```

2. **Create a repository (if not exists)**
   ```bash
   aws ecr create-repository --repository-name api --region us-east-1
   ```

3. **Build and tag the image**
   ```bash
   docker build -t your-account-id.dkr.ecr.us-east-1.amazonaws.com/api:latest .
   docker build -t your-account-id.dkr.ecr.us-east-1.amazonaws.com/api:v1.0.0 .
   ```

4. **Push the image**
   ```bash
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/api:latest
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/api:v1.0.0
   ```

5. **Update the Kubernetes manifest**
   
   Edit `k8s-manifest.yaml` and replace `image: api:latest` with:
   ```yaml
   image: your-account-id.dkr.ecr.us-east-1.amazonaws.com/api:latest
   ```

## Deploying to Kubernetes

After publishing your image:

1. **Apply the manifest**
   ```bash
   kubectl apply -f k8s-manifest.yaml
   ```

2. **Verify deployment**
   ```bash
   kubectl get deployments
   kubectl get pods
   kubectl get services
   ```

3. **Check logs**
   ```bash
   kubectl logs -l app=api
   ```

4. **Access the service**
   ```bash
   # Get the external IP (for LoadBalancer)
   kubectl get svc api-service
   
   # Test the API
   curl http://<EXTERNAL-IP>:9080/users
   ```

## Local Testing

Before publishing, test the image locally:

```bash
# Build the image
docker build -t api:latest .

# Run locally
docker run -p 9080:9080 api:latest

# Test
curl http://localhost:9080/users
```
