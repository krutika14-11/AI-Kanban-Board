# SaaS Application Architecture

## Category: SaaS

## Multi-Tenancy
Single-database multi-tenancy: all tenants share one database with tenant_id column.
Schema-based multi-tenancy: separate schema per tenant in one database.
Database-per-tenant: separate database per tenant (highest isolation, highest cost).
Use middleware to inject tenant context into all database queries.
Validate tenant access on every request.

## Subscription Management
Implement tiered pricing: Free, Basic, Pro, Enterprise.
Integrate Stripe for subscription billing.
Track feature usage per plan.
Implement usage limits and graceful degradation at limits.
Handle plan upgrades and downgrades.
Send billing notifications and invoices via email.

## User Management
Support teams/organizations with multiple members.
Implement invitation system for adding team members.
Role-based permissions within organizations: owner, admin, member, viewer.
Support single sign-on (SSO) for enterprise plans.
Audit log all user actions.

## Dashboard and Analytics
Build user-facing usage dashboard showing current plan, usage, billing.
Admin dashboard for monitoring all tenants.
Track key SaaS metrics: MRR, churn rate, DAU/MAU, NPS.
Implement feature flags for gradual rollouts.

## Onboarding
Build guided onboarding flow for new users.
Implement product tours with tooltips.
Send onboarding email sequence.
Track onboarding completion rate.
Implement empty states that guide users to first action.

## Notifications
Email notifications using SendGrid or Postmark.
In-app notifications for real-time events.
Notification preferences letting users control what they receive.
Webhook notifications for developer/enterprise users.

## Data and Privacy
Implement data export (user data, GDPR compliance).
Implement account deletion with data purge.
Data retention policies per plan tier.
Privacy policy and terms of service acceptance tracking.

## Key Implementation Tasks for SaaS
- Organization/team model with membership
- Subscription integration with Stripe
- Plan-based feature gating
- Usage tracking and limits
- Invitation system for team members
- Role-based access within organizations
- Billing management UI
- Admin panel for operators
- Email notification system
- Onboarding flow
- Data export functionality
- SSO integration (SAML/OAuth)
