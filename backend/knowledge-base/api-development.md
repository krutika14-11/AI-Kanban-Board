# REST API Development Best Practices

## Category: API Development

## RESTful Design
Use nouns for resources, not verbs: /users not /getUsers.
Use plural nouns: /users not /user.
Nest resources for relationships: /projects/:id/tasks.
Use HTTP methods correctly: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove).
Use query parameters for filtering, sorting, pagination: /tasks?status=TODO&sort=priority.

## Request/Response Format
Use JSON for request and response bodies.
Set Content-Type: application/json header.
Use consistent response envelope: { success: boolean, data: T, error?: string, meta?: pagination }.
Include pagination metadata for list responses: { data: T[], meta: { total, page, limit, hasMore } }.
Use ISO 8601 format for dates: "2024-01-15T10:30:00Z".

## HTTP Status Codes
200 OK: successful GET, PUT, PATCH requests.
201 Created: successful POST creating a resource. Include Location header.
204 No Content: successful DELETE or action with no response body.
400 Bad Request: invalid request syntax or validation errors.
401 Unauthorized: missing or invalid authentication.
403 Forbidden: authenticated but not authorized.
404 Not Found: resource doesn't exist.
409 Conflict: request conflicts with current state (duplicate).
422 Unprocessable Entity: semantically invalid request.
429 Too Many Requests: rate limit exceeded.
500 Internal Server Error: unexpected server error.

## Input Validation
Validate request body, path parameters, and query parameters.
Return 400 with specific validation errors for each invalid field.
Sanitize inputs to prevent injection attacks.
Limit request body size to prevent DoS.
Validate data types, formats, ranges, and business rules.

## API Documentation
Document all endpoints with request/response examples.
Use OpenAPI 3.0 specification.
Include authentication requirements.
Document error responses.
Keep documentation in sync with code using code-first tools.

## Versioning
Version your API from day one: /api/v1/.
Use URI versioning for major breaking changes.
Maintain backward compatibility within a version.
Deprecate endpoints gracefully with sunset headers.
Provide migration guides for version upgrades.

## Rate Limiting
Implement rate limiting on all public endpoints.
Use sliding window or token bucket algorithms.
Return 429 with Retry-After header.
Apply different limits per endpoint type (auth vs. general API).
Log rate limit violations for security monitoring.

## API Security
Always use HTTPS in production.
Implement proper CORS configuration.
Use API keys or JWT for authentication.
Validate and sanitize all inputs.
Implement request signing for sensitive operations.
Log all API access for audit trails.

## Key Implementation Tasks
- Define API routes following REST conventions
- Implement request validation middleware
- Create consistent error response format
- Add rate limiting middleware
- Implement request logging with Morgan
- Add security headers with Helmet
- Document API with OpenAPI/Swagger
- Add health check endpoint
- Implement pagination for list endpoints
- Add request ID for tracing
