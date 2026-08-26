# Database Design and Management Best Practices

## Category: Database

## Schema Design Principles
Use UUIDs or CUIDs for primary keys to avoid sequential ID enumeration attacks.
Add created_at and updated_at timestamps to all tables.
Use soft deletes (deleted_at) for important data that should be auditable.
Normalize data to at least 3NF, but denormalize thoughtfully for read performance.
Define proper foreign key constraints to maintain referential integrity.
Use meaningful, consistent naming conventions (snake_case for columns).

## Indexing Strategy
Index all foreign keys automatically.
Index columns frequently used in WHERE clauses.
Create composite indexes for frequently combined filter conditions.
Avoid over-indexing write-heavy tables as indexes slow writes.
Use partial indexes for filtered queries (e.g., WHERE status = 'active').
Monitor slow query logs to identify missing indexes.

## Migrations
Write migrations that can be run forward (up) and backward (down).
Never modify existing migrations - create new ones.
Test migrations on a production data snapshot before running in production.
Make migrations idempotent when possible.
Batch large data migrations to avoid long table locks.

## SQLite Specific
Enable WAL (Write-Ahead Logging) mode for better concurrent read performance.
Use transactions for multiple related writes.
Enable foreign key enforcement with PRAGMA foreign_keys = ON.
Use INTEGER PRIMARY KEY for auto-increment (not ROWID alias).
Avoid TEXT for numeric data - use proper INTEGER or REAL types.
SQLite is excellent for single-server applications, development, and embedded use.

## Prisma ORM Best Practices
Use Prisma migrations for schema management.
Run prisma generate after schema changes.
Use prisma.$transaction() for atomic operations.
Use select to fetch only needed fields.
Use include for eager loading related data.
Use findUnique for single record fetches (faster than findFirst).
Implement the repository pattern over raw Prisma client in services.

## Data Integrity
Use database constraints as a safety net (NOT NULL, UNIQUE, CHECK).
Validate data at application level before database insertion.
Use database transactions for multi-step operations.
Implement optimistic locking for concurrent update scenarios.
Regular backups with tested restore procedures.

## Performance
Use connection pooling (Prisma handles this automatically).
Avoid SELECT * - specify needed columns.
Use cursor-based pagination for large datasets.
Cache frequently read, rarely changed data in Redis.
Monitor query execution plans for slow queries.
