# React Frontend Development Best Practices

## Category: Frontend

## Component Architecture
React applications should be organized around reusable, single-responsibility components.
Use functional components with hooks. Avoid class components in new code.
Keep components small - if a component exceeds 200 lines, consider splitting it.
Use React.memo() for expensive pure components to prevent unnecessary re-renders.
Colocate state with the components that need it. Lift state only when necessary.

## Project Structure
Organize by feature, not by type. Place components, hooks, and styles together.
Create a `components/ui` folder for shared primitive components.
Keep page-level components in a `pages` folder.
Extract business logic into custom hooks in a `hooks` folder.
Use barrel exports (index.ts) to simplify imports.

## State Management
Use React Context for app-wide state like authentication and theme.
Use TanStack Query (React Query) for server state management.
Prefer local state (useState) over global state whenever possible.
Use useReducer for complex local state with multiple sub-values.
Avoid prop drilling deeper than 2-3 levels - use context or composition.

## Performance Optimization
Implement code splitting with React.lazy() and Suspense for route-level components.
Use the useMemo hook for expensive calculations.
Use useCallback for functions passed as props to child components.
Virtualize long lists with react-virtual or react-window.
Optimize images with proper sizing, format (WebP), and lazy loading.

## Forms and Validation
Use React Hook Form for complex forms to avoid unnecessary re-renders.
Validate with Zod for TypeScript-first schema validation.
Show inline validation errors immediately on blur, not just on submit.
Implement proper loading and disabled states for form submission.
Handle optimistic updates for better UX.

## Error Handling
Implement Error Boundaries for catching runtime errors.
Use error boundaries at route level and around complex components.
Show user-friendly error messages, never raw error objects.
Implement retry logic for failed network requests.

## Testing
Write unit tests for custom hooks using @testing-library/react-hooks.
Write integration tests for complete user flows.
Use @testing-library/react - avoid implementation details, test behavior.
Mock API calls with MSW (Mock Service Worker) for realistic tests.
Aim for high coverage on business-critical paths, not 100% coverage.

## TypeScript Integration
Define strict types for all component props using interfaces.
Use discriminated unions for complex state types.
Avoid 'any' - use 'unknown' when type is truly dynamic.
Generate API types from the backend schema or OpenAPI spec.
