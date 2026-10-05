Created 1 of 3 detected sources in PostHog.

# PostHog Warehouse Source Setup

## Changes made

- Created the `Upstash` warehouse source with all five discovered datasets enabled: `redis_databases`, `redis_stats`, `teams`, `vector_indexes`, and `audit_logs`.
- Validated the supplied Supabase and Sentry credentials and discovered their available tables, but did not create duplicate sources because PostHog requires a unique table prefix when a source of the same type already exists.
- No application code or environment configuration was changed.

## Files modified

- `posthog-warehouse-report.md`

## Manual steps

Finish Supabase and Sentry in the browser and choose a table prefix that does not conflict with the existing source of that type:

- [Connect Supabase](https://us.i.posthog.com/project/646094/data-warehouse/new-source?kind=Supabase&utm_source=wizard&utm_campaign=warehouse-source)
- [Connect Sentry](https://us.i.posthog.com/project/646094/data-warehouse/new-source?kind=Sentry&utm_source=wizard&utm_campaign=warehouse-source)

For Supabase, use the database password from Supabase Settings → Database and the Session pooler host for a standard sync. For Sentry, use an internal-integration token rather than a DSN or personal token.
