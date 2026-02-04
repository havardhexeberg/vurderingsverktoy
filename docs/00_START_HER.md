# MASTER OVERSIKT - Vurderingsverktøy Prototype

**Dato:** 2026-02-03  
**Status:** Komplett - Klar for utvikling

---

## 📦 INNHOLD I DENNE MAPPEN

Du har nå **21 komplette filer** som inneholder ALT du trenger for å bygge prototypen.

### Kategori 1: Prosjektfiler (må være i root)
```
vurderingsverktoy/          # Root-mappe (opprett denne)
├── package.json            # ✅ Dependencies og scripts
├── .env.example            # ✅ Environment variables template
├── .gitignore              # ✅ Git ignore rules
├── README.md               # ✅ Prosjektdokumentasjon
└── prisma/
    ├── schema.prisma       # ✅ Database-skjema
    └── seed.ts             # ✅ Seed-script med test-data
```

### Kategori 2: Data (kopier til prisma/)
```
prisma/
├── competence_goals_matematikk.json   # ✅ 27 kompetansemål
├── competence_goals_norsk.json        # ✅ 14 kompetansemål
├── competence_goals_engelsk.json      # ✅ 9 kompetansemål
└── mock_students.csv                  # ✅ 24 test-elever
```

### Kategori 3: Komponenter (eksempler - ikke nødvendig i starten)
```
src/components/
├── StudentCard.tsx          # ✅ Eksempel på StudentCard
└── assessments/
    └── AssessmentForm.tsx   # ✅ Eksempel på vurderingsskjema
```

### Kategori 4: Dokumentasjon (les før du starter!)
```
docs/ (eller root)
├── produktspesifikasjon_vurderingsverktoy_v6.md    # ✅ Hva skal bygges
├── teknisk_spesifikasjon_prototype.md              # ✅ Hvordan bygge det
├── implementeringsguide_claude_code.md             # ✅ Steg-for-steg (30 dager)
├── ui_ux_design_guide.md                           # ✅ Design-system
├── openai_prompt_templates.md                      # ✅ AI-implementering
├── deployment_guide.md                             # ✅ Hvordan deploye
└── DPIA_template.md                                # ✅ Personvernvurdering
```

---

## 🚀 QUICK START - STEG FOR STEG

### Steg 1: Opprett prosjektmappen

```bash
# Opprett hovedmappe
mkdir vurderingsverktoy
cd vurderingsverktoy

# Kopier alle filer fra outputs-mappen til her
cp /path/to/outputs/* .

# Flytt data-filer til riktig sted (gjør dette ETTER Next.js setup)
mkdir -p prisma
mv competence_goals_*.json prisma/
mv mock_students.csv prisma/
mv seed.ts prisma/
mv schema.prisma prisma/
```

### Steg 2: Sett opp med Claude Code i VS Code

**Åpne VS Code i denne mappen:**
```bash
code .
```

**Start Claude Code og gi denne prompten:**

```
Jeg har et komplett prototype-prosjekt for et vurderingsverktøy.

Les disse filene først:
1. teknisk_spesifikasjon_prototype.md
2. implementeringsguide_claude_code.md
3. package.json
4. schema.prisma

Deretter: Følg DAG 1 i implementeringsguiden:
- Sett opp Next.js 14 prosjekt med TypeScript, Tailwind, App Router
- Installer alle dependencies fra package.json
- Sett opp Prisma
- Kopier environment variables fra .env.example til .env
- Verifiser at alt fungerer

Start med: npx create-next-app@latest . --typescript --tailwind --app
```

### Steg 3: Sett opp database (etter Next.js setup)

```bash
# Kopier .env.example til .env
cp .env.example .env

# Rediger .env og legg inn DATABASE_URL
nano .env

# Eksempel for lokal PostgreSQL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/vurdering_dev"

# Kjør migrations
pnpm db:migrate

# Seed test-data
pnpm db:seed
```

### Steg 4: Start utvikling

```bash
# Start dev-server
pnpm dev

# Åpne http://localhost:3000
# Login med: larer@test.no
```

---

## 📚 HVILKEN FIL SKAL JEG LESE FØRST?

### For å forstå HVA som skal bygges:
→ **produktspesifikasjon_vurderingsverktoy_v6.md**
- Full beskrivelse av alle funksjoner
- Brukerhistorier
- Juridisk kontekst

### For å forstå HVORDAN det skal bygges:
→ **teknisk_spesifikasjon_prototype.md**
- Teknisk stack
- Database-struktur
- API endpoints
- Mappestruktur

### For å følge en PLAN:
→ **implementeringsguide_claude_code.md**
- 30-dagers plan
- Dag-for-dag instruksjoner
- Hva skal bygges når

### For å style riktig:
→ **ui_ux_design_guide.md**
- Fargepalett
- Komponenter
- shadcn/ui eksempler

### For AI-funksjonalitet:
→ **openai_prompt_templates.md**
- Hvordan kalle OpenAI API
- Caching
- Error handling

---

## 🎯 PRIORITERT LESEREKKEFØLGE

**Før du starter koding:**
1. ✅ README.md (denne filen)
2. ✅ teknisk_spesifikasjon_prototype.md (20 min)
3. ✅ implementeringsguide_claude_code.md (15 min)
4. ✅ ui_ux_design_guide.md (10 min)

**Under utvikling:**
- Bruk implementeringsguiden som daglig guide
- Bruk produktspesifikasjonen som referanse for funksjoner
- Bruk ui_ux_design_guide for styling

**Før deployment:**
- deployment_guide.md
- DPIA_template.md (må fylles ut!)

---

## 🔑 VIKTIGE KONSEPTER

### Teknisk Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API routes + Prisma ORM
- **Database:** PostgreSQL
- **AI:** OpenAI API (kun for kompetansemålforslag)
- **Auth:** NextAuth.js (Feide/BankID)

### shadcn/ui (VIKTIG!)
- Dette er IKKE et npm-pakke
- Komponenter kopieres inn i prosjektet ditt
- Full kontroll - du eier koden
- Enkelt å redigere

**Installer komponenter:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
# osv.
```

### Database-struktur
Se `schema.prisma` for full struktur.

**Hovedtabeller:**
- User (lærere, ledelse, foresatte)
- Student (elever)
- Assessment (vurderinger)
- CompetenceGoal (kompetansemål fra LK20)
- Exemption (fritak)
- CompetenceProfile (kompetansemålprofil)

### MVP-funksjoner (8 uker)

**Sprint 1 (Uke 1-2): Grunnmur**
- Auth (mock)
- Elevimport (CSV)
- Enkel vurderingsregistrering

**Sprint 2 (Uke 3-4): Tidsbesparende**
- Bulk-registrering (24 elever på <10 min)
- Dashboard (elevcentrisk)
- Advarselsystem

**Sprint 3 (Uke 5-6): Differensierende**
- Kompetansemålprofil
- AI-forslag (OpenAI)
- Prioriteringsliste

**Sprint 4 (Uke 7-8): Dokumentasjon**
- "Hva mangler"-sjekkliste
- PDF-eksport
- Foresatt-portal

---

## 💡 CLAUDE CODE TIPS

### Effektive prompts:

**Generelt:**
```
"Følg implementeringsguiden dag [X]. Les relevant dokumentasjon først."
```

**Spesifikke komponenter:**
```
"Lag [komponent] basert på produktspesifikasjon seksjon [X].
Bruk ui_ux_design_guide.md for styling."
```

**Debugging:**
```
"Jeg får denne feilen: [error]. 
Sjekk teknisk_spesifikasjon_prototype.md for riktig oppsett."
```

### Best practices:
1. ✅ Referer alltid til dokumentasjonen
2. ✅ Bygg én feature om gangen
3. ✅ Test før du går videre
4. ✅ Commit ofte

---

## 📁 MAPPESTRUKTUR (KOMPLETT)

```
vurderingsverktoy/
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── competence_goals_matematikk.json
│   ├── competence_goals_norsk.json
│   ├── competence_goals_engelsk.json
│   └── mock_students.csv
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── faggrupper/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── kompetansemaal/
│   │   │   │       └── prioritering/
│   │   │   ├── min-side/
│   │   │   │   ├── oppgaver/
│   │   │   │   └── statistikk/
│   │   │   └── foresatt/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── assessments/
│   │   │   │   ├── route.ts
│   │   │   │   └── bulk/
│   │   │   ├── students/
│   │   │   │   └── [id]/
│   │   │   ├── competence-goals/
│   │   │   └── ai/
│   │   │       └── suggest-goals/
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (installeres med CLI)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── assessments/
│   │   │   ├── AssessmentForm.tsx
│   │   │   ├── BulkAssessmentForm.tsx
│   │   │   └── AssessmentList.tsx
│   │   ├── dashboard/
│   │   │   ├── StudentCard.tsx
│   │   │   ├── PriorityList.tsx
│   │   │   └── CompetenceGoalOverview.tsx
│   │   └── competence-profile/
│   │       ├── CompetenceProfileChart.tsx
│   │       └── CompetenceGoalDetail.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── openai.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
│
├── docs/                              # Dokumentasjon (valgfritt)
│   ├── produktspesifikasjon_vurderingsverktoy_v6.md
│   ├── teknisk_spesifikasjon_prototype.md
│   ├── implementeringsguide_claude_code.md
│   ├── ui_ux_design_guide.md
│   ├── openai_prompt_templates.md
│   ├── deployment_guide.md
│   └── DPIA_template.md
│
├── .env.example
├── .env                               # Opprett denne (ikke commit!)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## ⚠️ VIKTIGE NOTATER

### 1. Environment Variables
**MÅ settes før du starter:**
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[generer med: openssl rand -base64 32]
OPENAI_API_KEY=sk-...
```

### 2. Database
**Lokal PostgreSQL:**
```bash
# Mac (Homebrew)
brew install postgresql
brew services start postgresql
createdb vurdering_dev

# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb vurdering_dev
```

**Eller bruk cloud:**
- Neon (gratis tier)
- Supabase (gratis tier)
- Railway (gratis trial)

### 3. OpenAI API
**Koster penger** (~$0.02 per forslag)
- Få nøkkel: https://platform.openai.com/api-keys
- Sett spending limit!
- Implementer caching (se openai_prompt_templates.md)

### 4. DPIA
**OBLIGATORISK før lansering**
- Fyll ut DPIA_template.md
- Få godkjent av personvernombud
- Kan ikke lansere uten!

---

## 🐛 TROUBLESHOOTING

### Prisma feil
```bash
# Reset alt
pnpm db:reset

# Generer Prisma Client på nytt
npx prisma generate
```

### Next.js cache issues
```bash
rm -rf .next
pnpm dev
```

### Port allerede i bruk
```bash
# Kill prosess på port 3000
lsof -ti:3000 | xargs kill -9
```

---

## ✅ SJEKKLISTE FØR PILOT

- [ ] DPIA gjennomført og godkjent
- [ ] Database satt opp (prod)
- [ ] Environment variables satt (prod)
- [ ] Migrations kjørt (prod)
- [ ] Seed data importert
- [ ] Feide-integrasjon testet
- [ ] Sikkerhetstesting gjennomført
- [ ] Backup-rutiner konfigurert
- [ ] Error tracking (Sentry) satt opp
- [ ] Informasjon til foresatte sendt ut
- [ ] Lærer-opplæring gjennomført

---

## 📞 SUPPORT

**Tekniske problemer?**
- Sjekk dokumentasjonen først
- Se troubleshooting-seksjonen
- Spør Claude Code i VS Code

**Produktspørsmål?**
- Se produktspesifikasjonen
- Kontakt produkteier

**Personvern/juridisk?**
- Se DPIA_template.md
- Kontakt personvernombud

---

## 🎉 DU ER KLAR!

Alt du trenger er i denne mappen. Følg Quick Start-guiden og bruk Claude Code til å bygge.

**Lykke til med prototypen! 🚀**

---

**Sist oppdatert:** 2026-02-03  
**Versjon:** 1.0  
**Status:** ✅ Komplett og klar for utvikling
