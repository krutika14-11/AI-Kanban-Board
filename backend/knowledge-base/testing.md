# Software Testing Best Practices

## Category: Testing

## Testing Strategy
Follow the testing pyramid: many unit tests, fewer integration tests, minimal E2E tests.
Aim for high coverage on business-critical paths, not 100% overall coverage.
Write tests before fixing bugs (TDD for bug fixes).
Tests should be deterministic - same input always produces same output.
Keep tests isolated - each test should be independent.

## Unit Testing
Unit tests verify individual functions/modules in isolation.
Mock all external dependencies (database, APIs, file system).
Follow Arrange-Act-Assert (AAA) pattern.
Test happy paths and error paths.
Test edge cases: empty input, null values, boundary conditions.
Keep unit tests fast (< 100ms per test).

## Integration Testing
Integration tests verify multiple components working together.
Use a real test database (SQLite in-memory for speed).
Test API endpoints end-to-end: request → response.
Verify database state after mutations.
Test authentication and authorization flows.
Reset database state between tests.

## Frontend Testing
Use @testing-library/react for component testing.
Test user behavior, not implementation details.
Use userEvent for simulating user interactions.
Test accessibility: keyboard navigation, screen reader labels.
Mock API calls with MSW (Mock Service Worker).
Test loading states, error states, and empty states.

## E2E Testing
Use Playwright or Cypress for end-to-end tests.
Write E2E tests for critical user journeys: signup, purchase, key workflows.
Run E2E tests in CI/CD pipeline.
Use test data factories to create consistent test data.
Take screenshots on failure for debugging.

## Test Organization
Co-locate unit tests with source files (*.test.ts next to *.ts).
Place integration tests in a separate tests/integration directory.
Use describe blocks to group related tests.
Use beforeEach/afterEach for setup and teardown.
Use test factories (faker.js) for generating test data.

## Testing Tools
Jest: unit and integration testing framework.
@testing-library/react: React component testing.
Supertest: HTTP integration testing for Express APIs.
MSW: API mocking for frontend tests.
Playwright: E2E browser testing.
Istanbul/nyc: Code coverage reporting.

## Key Test Cases for Projects
- User authentication: register, login, logout, token refresh
- CRUD operations: create, read, update, delete for main entities
- Input validation: valid inputs pass, invalid inputs return errors
- Authorization: users can only access their own resources
- Business logic: core domain rules are enforced correctly
- Error handling: proper error responses for all failure modes
- API contracts: response shapes match expected types
