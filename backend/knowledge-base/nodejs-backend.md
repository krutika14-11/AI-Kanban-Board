# Node.js Backend Development Best Practices

## Category: Backend

## Architecture Patterns
Use a layered architecture: Routes → Controllers → Services → Repositories → Database.
Controllers handle HTTP concerns only (parsing requests, sending responses).
Services contain business logic and orchestration.
Repositories handle all database operations.
Never put business logic in routes or database queries in controllers.

## Express.js Best Practices
Use express-async-errors or wrap async handlers to catch unhandled promise rejections.
Implement a global error handling middleware as the last middleware.
Use helmet.js for security headers.
Use CORS middleware with explicit allowed origins.
Implement rate limiting on public endpoints.
Use morgan for request logging.

## API Design
Use RESTful conventions: GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes.
Version your API: /api/v1/...
Return consistent response shapes: { success: boolean, data: T, error?: string }.
Use proper HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 422, 500.
Implement pagination for list endpoints using cursor or offset pagination.
Document APIs with OpenAPI/Swagger.

## Input Validation
Validate all input at the boundary (controller/route level).
Use Zod or express-validator for schema validation.
Never trust client input - sanitize and validate everything.
Return clear, actionable validation error messages.

## Error Handling
Create custom error classes extending Error.
Distinguish between operational errors (4xx) and programmer errors (5xx).
Log errors with context (user ID, request ID, stack trace) to structured logs.
Never expose stack traces or internal details to clients.
Implement circuit breakers for external service calls.

## Database Access
Use connection pooling for database connections.
Implement the repository pattern to abstract database operations.
Use transactions for operations that must be atomic.
Add database indexes for frequently queried columns.
Use soft deletes (deleted_at timestamp) instead of hard deletes when audit trails matter.
Implement query timeouts to prevent slow queries from blocking.

## Security
Hash passwords with bcrypt (cost factor 12+). Never store plain text passwords.
Use JWT with short expiry (15 minutes) and refresh tokens.
Implement CORS properly - whitelist specific origins.
Sanitize user input to prevent SQL injection and XSS.
Keep dependencies updated and audit with npm audit.
Use environment variables for secrets, never hardcode them.

## Performance
Use async/await consistently - avoid mixing callbacks.
Implement caching with Redis for frequently read data.
Use database query optimization: avoid N+1 queries, use eager loading.
Implement request compression with gzip.
Use clustering or PM2 for multi-core utilization in production.
