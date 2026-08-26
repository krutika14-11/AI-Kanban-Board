# DevOps and Deployment Best Practices

## Category: DevOps

## Containerization with Docker
Write multi-stage Dockerfiles: build stage and production stage.
Use official base images (node:20-alpine for Node.js).
Run containers as non-root users.
Use .dockerignore to exclude node_modules and development files.
Set resource limits on containers.
Use Docker Compose for local development with multiple services.

## CI/CD Pipeline
Use GitHub Actions, GitLab CI, or similar for automated pipelines.
Pipeline stages: lint → test → build → deploy.
Run tests on every pull request.
Block merges on test failures.
Deploy to staging automatically on main branch merge.
Deploy to production manually with approval gate.
Use semantic versioning and automated changelogs.

## Environment Management
Use separate environments: development, staging, production.
Never commit secrets to version control.
Use environment variables for all configuration.
Use secret management tools (AWS Secrets Manager, Vault) in production.
Use infrastructure as code (Terraform, Pulumi) for cloud resources.

## Deployment Strategies
Blue-green deployment: switch traffic between two identical environments.
Canary deployment: gradually route traffic to new version.
Rolling deployment: update instances one by one.
Always have a rollback plan before deploying.
Monitor error rates and latency during deployments.

## Cloud Platforms
AWS: EC2/ECS for compute, RDS for database, S3 for files, CloudFront for CDN.
GCP: Cloud Run for containers, Cloud SQL for database, Cloud Storage.
Railway/Render: Simple PaaS for smaller applications.
Vercel/Netlify: Frontend hosting with edge functions.

## Monitoring and Observability
Implement structured JSON logging with log levels.
Use correlation IDs for request tracing.
Monitor key metrics: error rate, latency, throughput, saturation.
Set up alerts for error rate spikes and latency degradation.
Use APM tools: Datadog, New Relic, or open-source alternatives.
Implement health check endpoints for load balancers.

## Database Operations
Automate database migrations in CI/CD pipeline.
Test migrations on production-like data before applying.
Implement database backups with tested restore procedures.
Use read replicas for scaling read-heavy workloads.
Monitor slow queries and optimize regularly.

## Key Implementation Tasks
- Write Dockerfile for backend (multi-stage)
- Write Dockerfile for frontend (nginx serving)
- Create docker-compose.yml for local development
- Set up GitHub Actions workflow (lint, test, build)
- Configure environment variables in deployment platform
- Set up health check endpoint (/health)
- Configure logging to stdout in JSON format
- Set up basic monitoring/alerting
- Document deployment process in README
