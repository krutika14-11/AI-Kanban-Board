# Authentication and Authorization Best Practices

## Category: Authentication

## Authentication Flow
Implement JWT-based authentication with access and refresh tokens.
Access tokens should expire in 15-60 minutes.
Refresh tokens should expire in 7-30 days and be stored securely (httpOnly cookies).
Implement token rotation: invalidate old refresh token on each refresh.
Store a token blacklist (Redis) for immediate logout capability.

## User Registration
Validate email format and uniqueness.
Validate password strength: minimum 8 characters, complexity requirements.
Hash passwords with bcrypt using cost factor 12 or higher.
Send email verification before activating accounts.
Implement CAPTCHA for public registration endpoints.
Rate limit registration attempts by IP.

## Login Security
Rate limit login attempts: lock account after 5-10 failed attempts.
Implement progressive delays between failed attempts.
Log all authentication events with IP, timestamp, and user agent.
Support multi-factor authentication (TOTP/SMS).
Never reveal whether an email exists in error messages.

## Session Management
Use httpOnly, Secure, SameSite=Strict cookies for tokens in web apps.
Implement absolute session timeout (maximum session duration).
Implement idle session timeout (automatic logout after inactivity).
Provide users with ability to view and terminate active sessions.
Clear all tokens on logout, including from other devices if requested.

## Authorization
Implement Role-Based Access Control (RBAC).
Define roles: admin, manager, user, guest.
Check permissions at the service layer, not just the route level.
Use middleware for common authorization checks.
Never expose resource IDs that leak information about other users' data.

## Password Management
Implement secure password reset via email token (expire in 1 hour).
Force re-authentication for sensitive operations (payment, password change).
Implement password change history to prevent reuse.
Support password managers - don't restrict special characters.

## OAuth and Social Login
Use OAuth 2.0 with PKCE for social login providers.
Support Google, GitHub as common OAuth providers.
Link social accounts to existing email accounts properly.
Handle account merging when user signs up with email then OAuth.

## Implementation Tasks
- Create User model with email, passwordHash, role, verified fields
- Implement POST /auth/register endpoint
- Implement POST /auth/login endpoint returning JWT + refresh token
- Implement POST /auth/refresh endpoint
- Implement POST /auth/logout endpoint (token blacklist)
- Implement POST /auth/forgot-password endpoint
- Implement POST /auth/reset-password endpoint
- Create auth middleware for protected routes
- Create role-based authorization middleware
- Build login and registration UI forms
- Implement protected route wrapper in React
- Store tokens securely (httpOnly cookies or memory)
- Add token refresh logic in API client
