# Revara

B2B prospecting automation tool. Finds new prospects using your own enrichment tools (Lusha, Apollo, Hunter) and pushes them into your CRM (Outreach, HubSpot, Salesforce).

**$149/month flat** — no prospect limits, no feature tiers. 14-day free trial.

## How it works

1. Connect your enrichment tool (Lusha, Apollo, or Hunter) via API key
2. Connect your CRM (Outreach, HubSpot, or Salesforce) via OAuth
3. Define your Ideal Customer Profile (ICP) filters
4. Set a schedule (daily, weekdays, or weekly) — or trigger runs manually
5. Revara searches for prospects, filters by your ICP, deduplicates against your CRM, enriches contacts, and pushes net-new prospects into your CRM sequence

## Local setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for billing)

### 1. Clone and install

```bash
git clone <repo-url> && cd prospect-bot
cd server && npm install
cd ../client && npm install
```

### 2. Set up the database

Create a PostgreSQL database and run the schema:

```bash
psql -d your_database -f server/db/schema.sql
```

### 3. Configure environment variables

Copy `server/.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random string for session encryption |
| `JWT_SECRET` | Random string for JWT signing |
| `ANTHROPIC_API_KEY` | Claude API key (for future AI features) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `OUTREACH_CLIENT_ID/SECRET` | Outreach OAuth app credentials |
| `HUBSPOT_CLIENT_ID/SECRET` | HubSpot OAuth app credentials |
| `SALESFORCE_CLIENT_ID/SECRET` | Salesforce OAuth app credentials |
| `ENCRYPTION_KEY` | 32-byte hex key for encrypting stored API keys |
| `CLIENT_URL` | Frontend URL (default: http://localhost:5173) |

### 4. Run locally

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Backend runs on http://localhost:3001, frontend on http://localhost:5173.

## Deploy to Railway

1. Push to GitHub
2. Create a new Railway project and connect the repo
3. Add a PostgreSQL plugin
4. Set all environment variables in Railway dashboard
5. Railway will auto-detect the `railway.toml` config and deploy

## Architecture

```
server/
  routes/       — Express route handlers (auth, customers, pipeline, billing, crm)
  services/     — Third-party API integrations (Lusha, Apollo, Hunter, Outreach, HubSpot, Salesforce)
  engine/       — Pipeline logic (filter, dedup, enrich, push)
  jobs/         — Scheduler and pipeline runner
  db/           — PostgreSQL queries and schema
  middleware/   — Auth and subscription checks

client/
  src/pages/        — React page components
  src/components/   — Shared UI components
  src/api/          — Axios API client
```
