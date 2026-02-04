# Deployment Guide - Vurderingsverktøy

## 🚀 Vercel (Anbefalt for prototype)

### Forutsetninger
- GitHub repository
- Vercel account (gratis)
- PostgreSQL database (f.eks. Neon, Supabase, eller Railway)

### Steg 1: Forbered database

**Alternativ A: Neon (anbefalt, gratis tier)**
```bash
# 1. Gå til https://neon.tech
# 2. Opprett ny database
# 3. Kopier connection string
```

**Alternativ B: Supabase**
```bash
# 1. Gå til https://supabase.com
# 2. Opprett nytt prosjekt
# 3. Kopier PostgreSQL connection string
```

### Steg 2: Push til GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/vurderingsverktoy.git
git push -u origin main
```

### Steg 3: Deploy til Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Følg promptene:
# - Set up and deploy? Y
# - Which scope? [Velg din account]
# - Link to existing project? N
# - Project name? vurderingsverktoy
# - Directory? ./
# - Override settings? N
```

### Steg 4: Legg til environment variables

```bash
# Gå til Vercel dashboard
# Settings → Environment Variables

# Legg til:
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=[generer med: openssl rand -base64 32]
OPENAI_API_KEY=sk-...
```

### Steg 5: Kjør migrations

```bash
# Fra lokal maskin (connected til prod database)
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Eller fra Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

### Steg 6: Seed data (valgfritt)

```bash
# Fra lokal maskin
DATABASE_URL="postgresql://..." pnpm db:seed
```

### Steg 7: Test deployment

```bash
# Åpne app
vercel open

# Test:
# - Login fungerer
# - Database connection OK
# - Seed-data synlig
```

---

## ☁️ Google Cloud Run (Produksjon)

### Forutsetninger
- Google Cloud account
- gcloud CLI installert
- Docker installert

### Steg 1: Opprett Google Cloud-prosjekt

```bash
# Installer gcloud CLI (hvis ikke installert)
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Opprett prosjekt
gcloud projects create vurderingsverktoy-prod --name="Vurderingsverktøy"

# Sett som aktiv
gcloud config set project vurderingsverktoy-prod

# Aktiver APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Steg 2: Opprett Cloud SQL database

```bash
# Opprett PostgreSQL instance
gcloud sql instances create vurdering-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=europe-north1

# Sett root password
gcloud sql users set-password postgres \
  --instance=vurdering-db \
  --password=[STRONG_PASSWORD]

# Opprett database
gcloud sql databases create vurdering \
  --instance=vurdering-db

# Få connection name
gcloud sql instances describe vurdering-db --format="value(connectionName)"
# Output: project:region:instance-name
```

### Steg 3: Opprett Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Steg 4: Build og deploy til Cloud Run

```bash
# Build image
gcloud builds submit --tag gcr.io/vurderingsverktoy-prod/vurderingsverktoy

# Deploy to Cloud Run
gcloud run deploy vurderingsverktoy \
  --image gcr.io/vurderingsverktoy-prod/vurderingsverktoy \
  --platform managed \
  --region europe-north1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://..." \
  --set-env-vars="NEXTAUTH_URL=https://vurderingsverktoy-xxx.run.app" \
  --set-env-vars="NEXTAUTH_SECRET=[SECRET]" \
  --set-env-vars="OPENAI_API_KEY=sk-..." \
  --add-cloudsql-instances=vurderingsverktoy-prod:europe-north1:vurdering-db
```

### Steg 5: Kjør migrations

```bash
# Cloud SQL Proxy (for å kjøre migrations)
cloud_sql_proxy -instances=vurderingsverktoy-prod:europe-north1:vurdering-db=tcp:5432

# I annet terminal
DATABASE_URL="postgresql://postgres:PASSWORD@127.0.0.1:5432/vurdering" \
  npx prisma migrate deploy
```

### Steg 6: Sett opp CI/CD (valgfritt)

**GitHub Actions** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: vurderingsverktoy-prod
      
      - name: Build and Push
        run: |
          gcloud builds submit --tag gcr.io/vurderingsverktoy-prod/vurderingsverktoy
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy vurderingsverktoy \
            --image gcr.io/vurderingsverktoy-prod/vurderingsverktoy \
            --platform managed \
            --region europe-north1 \
            --allow-unauthenticated
```

---

## 🔒 Sikkerhet (VIKTIG for produksjon)

### Environment Variables

**Aldri commit:**
- `.env` filer
- API keys
- Database credentials

**Bruk:**
- Vercel: Environment Variables (dashboard)
- Google Cloud: Secret Manager

### Database

```bash
# Google Cloud: Bruk Cloud SQL Proxy
# IKKE expose database direkte til internett

# Vercel: Bruk connection pooling
DATABASE_URL="postgresql://...?pgbouncer=true"
```

### HTTPS

**Vercel:**
- Automatisk HTTPS (gratis SSL)

**Google Cloud Run:**
- Automatisk HTTPS
- Kan legge til custom domain

---

## 📊 Monitoring

### Vercel

```bash
# Åpne analytics
vercel analytics

# Logs
vercel logs
```

### Google Cloud

```bash
# Logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Metrics i Console
# https://console.cloud.google.com/run
```

### Sentry (Error tracking)

```bash
# Install
pnpm add @sentry/nextjs

# Init
npx @sentry/wizard -i nextjs

# Legg til SENTRY_DSN i env vars
```

---

## 💰 Kostnader (estimat)

### Vercel (gratis tier)
- ✅ Gratis for < 100GB bandwidth/måned
- ✅ Gratis serverless functions
- Database: Ekstra kostnad (Neon gratis tier: 0.5GB)

### Google Cloud (estimat)
- Cloud Run: ~$5-20/måned (avhenger av trafikk)
- Cloud SQL (f1-micro): ~$7/måned
- Totalt: ~$12-27/måned for pilot

---

## 🚨 Troubleshooting

### Vercel: Build fails

```bash
# Sjekk logs
vercel logs

# Vanlige feil:
# - Prisma generate ikke kjørt: Legg til i package.json postinstall
# - Environment vars mangler: Sjekk dashboard
```

### Database connection fails

```bash
# Test connection lokalt
psql $DATABASE_URL

# Sjekk:
# - URL format: postgresql://user:pass@host:5432/db
# - IP whitelisted (hvis ikke Cloud SQL Proxy)
# - SSL mode: ?sslmode=require
```

### Cloud Run: Cold starts

```bash
# Sett min instances til 1 (koster mer, men raskere)
gcloud run services update vurderingsverktoy \
  --min-instances=1
```

---

## ✅ Pre-launch Checklist

- [ ] DPIA gjennomført
- [ ] Database backups konfigurert
- [ ] Error tracking (Sentry) satt opp
- [ ] Environment variables satt (prod)
- [ ] Migrations kjørt (prod)
- [ ] Seed data importert (hvis relevant)
- [ ] SSL/HTTPS aktivert
- [ ] Custom domain konfigurert (valgfritt)
- [ ] Monitoring dashboards satt opp
- [ ] Incident response plan
- [ ] Backup/restore testet

---

**Ferdig! Du kan nå deploye prototypen. 🎉**
