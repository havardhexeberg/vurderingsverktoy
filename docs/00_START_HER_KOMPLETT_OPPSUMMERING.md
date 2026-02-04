# VURDERINGSVERKTØY - KOMPLETT PROSJEKTOPPSUMMERING

**Dato:** 2026-02-03  
**Status:** Klar for utvikling  
**Formål:** Full oversikt for Claude Code i VS Code

---

## 📋 INNHOLDSFORTEGNELSE

1. [Prosjektoversikt](#1-prosjektoversikt)
2. [Alle filer som trengs](#2-alle-filer-som-trengs)
3. [Hvordan starte byggeingen](#3-hvordan-starte-byggingen)
4. [Viktige dokumenter](#4-viktige-dokumenter)

---

## 1. PROSJEKTOVERSIKT

### Hva bygger vi?
**Intelligent oversikts- og kvalitetssikringsverktøy** for vurdering i ungdomsskolen (8.-10. trinn).

**Kjerneverdier:**
- Oversikt - lærer ser hele bildet
- Kvalitetssikring - proaktive advarsler hindrer feil
- Dokumentasjon - enkel eksport ved klagesaker

**Teknisk stack:**
- Frontend: Next.js 14 + React + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Next.js API routes + Prisma ORM
- Database: PostgreSQL (Google Cloud SQL)
- AI: OpenAI GPT-4 (kompetansemålforslag)
- Hosting: Vercel (prototype) / Google Cloud Run (produksjon)

### MVP-funksjoner (30 dager)
1. Autentisering (Feide mock)
2. Elevimport (CSV)
3. Vurderingsregistrering (individuell + bulk)
4. Lærerens dashboard (elevcentrisk + kompetansemålcentrisk)
5. Advarselsystem
6. Kompetansemålprofil
7. Prioriteringsliste
8. "Hva mangler"-sjekkliste
9. PDF-eksport
10. Foresatt-portal

---

## 2. ALLE FILER SOM TRENGS

Alle filer er allerede i `/mnt/user-data/outputs/`. Disse skal kopieres til prosjektmappen.

### 2.1 Kjerneprosjektfiler

**package.json**
```json
{
  "name": "vurderingsverktoy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@prisma/client": "^5.10.0",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.344.0",
    "next": "14.1.0",
    "next-auth": "^4.24.6",
    "openai": "^4.28.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.50.1",
    "recharts": "^2.12.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.19",
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.35",
    "prisma": "^5.10.0",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3"
  }
}
```

**.env.example**
```
DATABASE_URL="postgresql://user:password@localhost:5432/vurdering_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"
OPENAI_API_KEY="sk-your-openai-api-key-here"
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket-name"
NODE_ENV="development"
```

**.gitignore**
```
node_modules
.pnp
.pnp.js
coverage
.next/
out/
build
dist
.vercel
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts
prisma/migrations
```

### 2.2 Database (Prisma)

**prisma/schema.prisma** - Se `schema.prisma` i outputs

**prisma/seed.ts** - Se `seed.ts` i outputs

**prisma/competence_goals_matematikk.json** - Se `competence_goals_matematikk.json` i outputs

### 2.3 Mock data

**mock_students.csv** - 24 elever, se i outputs

---

## 3. HVORDAN STARTE BYGGINGEN

### Steg 1: Opprett prosjektmappe

```bash
mkdir vurderingsverktoy
cd vurderingsverktoy
```

### Steg 2: Kopier alle filer

Kopier ALLE filer fra `/mnt/user-data/outputs/` til prosjektmappen:

- package.json
- .env.example → kopier til .env og fyll inn verdier
- .gitignore
- schema.prisma → flytt til `prisma/schema.prisma`
- seed.ts → flytt til `prisma/seed.ts`
- competence_goals_matematikk.json → flytt til `prisma/`
- mock_students.csv → flytt til `prisma/`

### Steg 3: Installer dependencies

```bash
pnpm install
```

### Steg 4: Sett opp database

```bash
# Kopier .env.example til .env
cp .env.example .env

# Rediger .env og legg inn DATABASE_URL
# Eksempel: postgresql://user:password@localhost:5432/vurdering

# Kjør migrations
pnpm db:migrate

# Seed test-data
pnpm db:seed
```

### Steg 5: Start dev-server

```bash
pnpm dev
```

Åpne http://localhost:3000

---

## 4. VIKTIGE DOKUMENTER

### 4.1 Produktspesifikasjon

Se `produktspesifikasjon_vurderingsverktoy_v6.md` i outputs.

**Viktigste punkter:**
- Kompetansemålbasert elevprofil (nivå L-M-H eller 1-6)
- Bulk-registrering (hele klassen samtidig)
- Prioriteringsliste (hvem er klar for standpunkt)
- Fritakshåndtering med varsler
- Quick-actions ved klagesak
- "Hva mangler"-sjekkliste

### 4.2 Teknisk spesifikasjon

Se `teknisk_spesifikasjon_prototype.md` i outputs.

**Viktigste punkter:**
- Next.js 14 App Router
- Prisma + PostgreSQL
- shadcn/ui komponenter
- OpenAI for AI-forslag
- Mappestruktur
- API endpoints

### 4.3 Implementeringsguide

Se `implementeringsguide_claude_code.md` i outputs.

**30-dagers plan:**
- Sprint 1 (Dag 1-5): Grunnmur
- Sprint 2 (Dag 6-10): Bulk-registrering + dashboard
- Sprint 3 (Dag 11-15): Kompetansemål + AI
- Sprint 4 (Dag 16-20): Prioriteringsliste
- Sprint 5 (Dag 21-25): "Hva mangler"-sjekkliste
- Sprint 6 (Dag 26-30): PDF-eksport + foresatt-portal

### 4.4 UI/UX Design-guide

Se `ui_ux_design_guide.md` i outputs.

**Fargepalett:**
- Primær (blå): #3B82F6
- Suksess (grønn): #10B981
- Advarsel (gul): #F59E0B
- Fare (rød): #EF4444

**shadcn/ui komponenter:**
- Button, Card, Form, Input, Select, Table, Badge, Alert, Dialog, Tabs

### 4.5 OpenAI Prompt-templates

Se `openai_prompt_templates.md` i outputs.

**Viktigste funksjon:**
- Foreslå kompetansemål basert på vurderingsbeskrivelse
- Caching for å spare API-kall
- Rate limiting
- Error handling

---

## 5. PROMPT TIL CLAUDE CODE

**Når du har kopiert alle filer, gi Claude Code denne prompten:**

```
Jeg har et Next.js-prosjekt for et vurderingsverktøy i ungdomsskolen.

Alle filer er allerede på plass:
- package.json
- .env (konfigurert)
- prisma/schema.prisma
- prisma/seed.ts
- prisma/competence_goals_matematikk.json

Jeg vil at du følger implementeringsguiden (implementeringsguide_claude_code.md)
og starter med DAG 1:

1. Initialiser Next.js prosjekt med App Router
2. Sett opp Prisma
3. Lag mock autentisering med NextAuth (hardkodet lærer)
4. Lag grunnleggende layout med sidebar
5. Lag CSV-import side for elever

Følg disse dokumentene:
- teknisk_spesifikasjon_prototype.md (teknisk arkitektur)
- ui_ux_design_guide.md (design-system)
- produktspesifikasjon_vurderingsverktoy_v6.md (funksjonelle krav)

Bruk shadcn/ui for alle UI-komponenter.
Bruk Tailwind CSS for styling.
```

---

## 6. KOMPONENTSKELETT

Se `StudentCard.tsx` og `AssessmentForm.tsx` i outputs for eksempler på hvordan komponenter skal struktureres.

---

## 7. TESTDATA

**Test-brukere etter seeding:**

**Lærer:**
- Email: larer@test.no
- Faggruppe: Matematikk 10A (24 elever)

**Rektor:**
- Email: rektor@test.no

**Elever med ulike statuser:**
- Emma Hansen: KLAR (mange vurderinger, god dekning)
- Noah Pettersen: RISIKO (få vurderinger, dårlig dekning)
- Isabella Johansen: NESTEN KLAR (god dekning, men kun skriftlig)

---

## 8. DEPLOYMENT (SENERE)

Se `deployment_guide.md` i outputs for:
- Vercel deployment (anbefalt for prototype)
- Google Cloud Run (produksjon)
- Environment variables
- Database setup

---

## 9. PERSONVERN (VIKTIG)

Se `DPIA_template.md` i outputs.

**MÅ gjøres før lansering:**
- DPIA gjennomført og godkjent
- Databehandleravtaler signert (Google Cloud, OpenAI)
- Informasjon til elev/foresatt
- Sikkerhetstesting

---

## 10. EKSTRA RESSURSER

### Kompetansemål-data

I `prisma/` finner du:
- `competence_goals_matematikk.json` (27 mål)
- `competence_goals_norsk.json` (14 mål)
- `competence_goals_engelsk.json` (9 mål)

Disse kan brukes for å teste med flere fag.

### Mock-elever

`mock_students.csv` inneholder 24 realistiske norske elevnavn for testing.

---

## 11. VIKTIGE NOTATER

### shadcn/ui

shadcn/ui er IKKE en npm-pakke. Det er copy-paste komponenter.

**Installere komponenter:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
# etc.
```

Komponenter kopieres til `src/components/ui/` og kan redigeres fritt.

### Mappestruktur

```
vurderingsverktoy/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── competence_goals_matematikk.json
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── faggrupper/[id]/
│   │   │   ├── min-side/
│   │   │   └── foresatt/
│   │   └── api/
│   ├── components/
│   │   ├── ui/              # shadcn/ui
│   │   ├── assessments/
│   │   ├── dashboard/
│   │   └── competence-profile/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── openai.ts
│   └── types/
├── public/
├── .env
├── .gitignore
├── package.json
└── README.md
```

### Database-kommandoer

```bash
pnpm db:push      # Push schema (utvikling)
pnpm db:migrate   # Opprett migration
pnpm db:studio    # Åpne Prisma Studio GUI
pnpm db:seed      # Seed test-data
pnpm db:reset     # Reset og re-seed
```

---

## 12. SUKSESSKRITERIER

**Prototype ferdig når:**
- [ ] Lærer kan logge inn
- [ ] Kan importere 24 elever fra CSV
- [ ] Kan registrere vurderinger (individuell + bulk)
- [ ] Dashboard viser elevcentrisk oversikt
- [ ] Advarsler fungerer
- [ ] Kompetansemålprofil beregnes og vises
- [ ] Prioriteringsliste fungerer
- [ ] "Hva mangler"-sjekkliste vises
- [ ] PDF-eksport fungerer
- [ ] Foresatt kan se publiserte vurderinger

---

## 13. KONTAKT

**Ved spørsmål eller problemer:**
- Se dokumentasjonen i outputs-mappen
- README.md har troubleshooting-seksjon
- Alle tekniske spesifikasjoner er dokumentert

---

## 14. ALLE FILER I OUTPUTS-MAPPEN

**Du har følgende filer tilgjengelig:**

1. produktspesifikasjon_vurderingsverktoy_v6.md
2. teknisk_spesifikasjon_prototype.md
3. implementeringsguide_claude_code.md
4. ui_ux_design_guide.md
5. openai_prompt_templates.md
6. deployment_guide.md
7. DPIA_template.md
8. README.md
9. package.json
10. .env.example
11. .gitignore
12. schema.prisma
13. seed.ts
14. competence_goals_matematikk.json
15. competence_goals_norsk.json
16. competence_goals_engelsk.json
17. mock_students.csv
18. StudentCard.tsx
19. AssessmentForm.tsx

**Alle disse skal kopieres til prosjektmappen før du starter.**

---

## 15. RASK OPPSTART (TL;DR)

```bash
# 1. Opprett mappe
mkdir vurderingsverktoy && cd vurderingsverktoy

# 2. Kopier ALLE filer fra /mnt/user-data/outputs/

# 3. Installer
pnpm install

# 4. Konfigurer .env
cp .env.example .env
# Rediger .env med DATABASE_URL

# 5. Database
pnpm db:migrate
pnpm db:seed

# 6. Start
pnpm dev

# 7. Åpne http://localhost:3000
```

**Deretter i Claude Code:**
```
"Følg implementeringsguide_claude_code.md dag 1.
Lag mock autentisering, layout, og CSV-import."
```

---

## 16. CRITICAL SUCCESS FACTORS

**For at prototypen skal lykkes:**
1. ✅ Følg implementeringsguiden dag-for-dag
2. ✅ Bruk shadcn/ui konsekvent (ikke custom komponenter)
3. ✅ Test bulk-registrering grundig (kritisk funksjon)
4. ✅ Prioriter backend-logikk over fancy UI
5. ✅ Seed test-data tidlig og test ofte
6. ✅ Les ui_ux_design_guide.md før styling
7. ✅ Implementer advarselslogikk korrekt (backend)
8. ✅ Test med 24 elever (ikke bare 3-5)

---

**DU HAR NÅ ALT DU TRENGER! 🚀**

**Start med Claude Code i VS Code og følg implementeringsguiden.**

---

*Oppsummering generert: 2026-02-03*
*Versjon: 1.0*
*Status: Klar for utvikling*
