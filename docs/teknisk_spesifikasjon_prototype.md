# Teknisk Spesifikasjon - Vurderingsverktøy Prototype

**Versjon:** 1.0  
**Dato:** 2026-02-03  
**Formål:** Prototype for testing med pilot-skoler

---

## 1. Teknisk Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context / Zustand (vurder)
- **Forms:** React Hook Form + Zod validation

### Backend
- **Runtime:** Node.js (Next.js API routes)
- **Database:** PostgreSQL (Google Cloud SQL)
- **ORM:** Prisma
- **Auth:** NextAuth.js (Feide mock for prototype)

### AI
- **Provider:** OpenAI API
- **Model:** GPT-4 (kompetansemålforslag)

### Hosting
- **Platform:** Google Cloud Run / Vercel (prototype)
- **Storage:** Google Cloud Storage (filvedlegg)

### Dev Tools
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **TypeScript:** Full typing

---

## 2. Database-skjema

Se `prisma/schema.prisma`

**Hovedtabeller:**
- `User` (lærere, ledelse, foresatte)
- `Student` (elever)
- `Subject` (fag)
- `ClassGroup` (faggrupper)
- `Assessment` (vurderinger)
- `CompetenceGoal` (kompetansemål fra LK20)
- `AssessmentCompetenceGoal` (kobling)
- `Exemption` (fritak)
- `CompetenceProfile` (kompetansemålprofil per elev)

---

## 3. Mappestruktur

```
vurderingsverktoy/
├── prisma/
│   └── schema.prisma          # Database-skjema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── faggrupper/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx           # Elevcentrisk oversikt
│   │   │   │       ├── kompetansemaal/    # Kompetansemålcentrisk
│   │   │   │       └── prioritering/      # Prioriteringsliste
│   │   │   ├── min-side/
│   │   │   │   ├── oppgaver/
│   │   │   │   └── statistikk/
│   │   │   └── foresatt/
│   │   ├── api/
│   │   │   ├── assessments/
│   │   │   ├── students/
│   │   │   ├── competence-goals/
│   │   │   └── ai/
│   │   │       └── suggest-goals/         # OpenAI integration
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
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
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── openai.ts          # OpenAI client
│   │   └── utils.ts
│   └── types/
│       └── index.ts           # TypeScript types
├── public/
├── .env.local
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 4. API Endpoints

### Assessments
- `POST /api/assessments` - Opprett vurdering (individuell/bulk)
- `GET /api/assessments?classGroupId=X` - Hent vurderinger for faggruppe
- `PATCH /api/assessments/:id` - Oppdater vurdering
- `DELETE /api/assessments/:id` - Deaktiver vurdering

### Students
- `GET /api/students?classGroupId=X` - Hent elever i faggruppe
- `POST /api/students/import` - Import fra CSV/Excel
- `GET /api/students/:id/competence-profile` - Hent kompetansemålprofil

### Competence Goals
- `GET /api/competence-goals?subject=X&grade=Y` - Hent kompetansemål
- `POST /api/ai/suggest-goals` - AI-forslag basert på beskrivelse

### Class Groups
- `GET /api/class-groups` - Hent lærerens faggrupper
- `POST /api/class-groups` - Opprett faggruppe

### Analytics
- `GET /api/analytics/priority-list?classGroupId=X` - Prioriteringsliste
- `GET /api/analytics/warnings?classGroupId=X` - Advarsler

---

## 5. Prototype-prioritering

### **Sprint 1 (Uke 1-2): Grunnmur**

**Mål:** Kunne registrere og se vurderinger

**Tasks:**
1. Sett opp Next.js prosjekt + Prisma
2. Database-skjema (basis-tabeller)
3. Mock autentisering (hardkodet lærer)
4. CSV-import av elever
5. Enkel vurderingsregistrering (individuell)
   - Form med obligatoriske felt
   - Lagre til database
6. Liste over vurderinger per faggruppe

**Leveranse:** Lærer kan logge inn, importere elever, registrere vurderinger

---

### **Sprint 2 (Uke 3-4): Tidsbesparende features**

**Mål:** Bulk-registrering + grunnleggende oversikt

**Tasks:**
1. Bulk-registrering UI
   - Felles felt (dato, type, form, kompetansemål)
   - Individuelt per elev (karakter, tilbakemelding)
   - Progress indicator
2. Elevcentrisk dashboard
   - StudentCard component
   - Status-indikatorer (grønn/gul/rød)
   - Grunnleggende advarsler
3. Kladd/publiser-funksjonalitet

**Leveranse:** Lærer kan registrere 24 elever på <10 min

---

### **Sprint 3 (Uke 5-6): Differensierende features**

**Mål:** Kompetansemålprofil + prioritering

**Tasks:**
1. Kompetansemål-database (importere LK20 for 1-2 fag)
2. AI-forslag til kompetansemål (OpenAI integration)
3. Kompetansemålprofil
   - Beregning av nivå (L-M-H eller 1-6)
   - Visuell fremstilling (radargraf/stolpediagram)
   - Detaljvisning per mål
4. Prioriteringsliste
   - Klar/Nesten klar/Trenger arbeid
   - Anbefalinger

**Leveranse:** Lærer ser kompetanseprofil og prioriteringsliste

---

### **Sprint 4 (Uke 7-8): Dokumentasjon + foresatt**

**Mål:** PDF-eksport + foresatt-portal

**Tasks:**
1. "Hva mangler"-sjekkliste per elev
2. PDF-eksport (enkel versjon)
   - Alle vurderinger
   - Kompetansemåldekning
   - Felt for halvårsvurdering
3. Foresatt-portal (skrivebeskyttet)
   - Kun publiserte vurderinger
   - Kompetansemålprofil (uten lærernotater)

**Leveranse:** Komplett prototype klar for pilot-testing

---

## 6. UI/UX-retningslinjer

### Design-prinsipper
1. **Data-tett, men oversiktlig** - Lærere håndterer mye info
2. **Rask navigasjon** - Minimal klikking
3. **Tydelige statusindikatorer** - Farger (rød/gul/grønn)
4. **Mobil-først** (bulk-registrering kan være desktop-only i prototype)

### Fargepalett
- **Primær:** Blå (#3B82F6) - Rolig, profesjonell
- **Suksess:** Grønn (#10B981)
- **Advarsel:** Gul (#F59E0B)
- **Fare:** Rød (#EF4444)
- **Grå:** Neutrale toner (#6B7280, #E5E7EB)

### Typografi
- **Font:** Inter (system-ui fallback)
- **Størrelser:**
  - H1: 2rem (32px)
  - H2: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

---

## 7. Datamodell-oversikt

### User
```typescript
{
  id: string
  email: string
  name: string
  role: "TEACHER" | "PRINCIPAL" | "PARENT"
  createdAt: DateTime
}
```

### Student
```typescript
{
  id: string
  name: string
  birthNumber: string
  grade: 8 | 9 | 10
  classGroups: ClassGroup[]
  assessments: Assessment[]
  exemptions: Exemption[]
}
```

### Assessment
```typescript
{
  id: string
  studentId: string
  classGroupId: string
  date: DateTime
  type: "MIDTERM" | "FINAL" | "ONGOING"
  form: "WRITTEN" | "ORAL" | "ORAL_PRACTICAL" | "PRACTICAL"
  grade: 1 | 2 | 3 | 4 | 5 | 6 | null
  feedback?: string
  description?: string
  internalNote?: string
  isPublished: boolean
  competenceGoals: CompetenceGoal[]
  createdBy: User
  createdAt: DateTime
  updatedAt: DateTime
}
```

### CompetenceGoal
```typescript
{
  id: string
  subject: string
  grade: 8 | 9 | 10
  area: string
  code: string
  description: string
}
```

### CompetenceProfile
```typescript
{
  id: string
  studentId: string
  competenceGoalId: string
  level: "L" | "M" | "H" | 1 | 2 | 3 | 4 | 5 | 6
  isManualOverride: boolean
  overrideReason?: string
  updatedAt: DateTime
}
```

---

## 8. Implementeringsplan for Claude Code

### Dag 1: Prosjektoppsett
```bash
# I terminal
npx create-next-app@latest vurderingsverktoy --typescript --tailwind --app
cd vurderingsverktoy
pnpm add prisma @prisma/client
pnpm add -D @types/node
pnpm add next-auth
pnpm add react-hook-form zod @hookform/resolvers
pnpm add openai
pnpm add recharts # for grafer
pnpm add date-fns # dato-håndtering

# Initialiser Prisma
npx prisma init

# Kopier schema.prisma fra neste fil
# Kjør migrering
npx prisma migrate dev --name init
```

### Dag 2-3: Autentisering + basis-UI
1. Sett opp NextAuth med mock provider
2. Lag layout med sidebar
3. Dashboard-skjelett

### Dag 4-5: Elevimport + vurderingsregistrering
1. CSV-import funksjonalitet
2. Vurderingsskjema (individuell)
3. Liste over vurderinger

### Dag 6-10: Bulk-registrering
1. Bulk-form UI (mest kompleks!)
2. Backend-logikk for bulk-insert
3. Testing med 24 elever

### Dag 11-15: Dashboard + advarsler
1. StudentCard component
2. Advarselslogikk (backend)
3. Elevcentrisk oversikt

### Dag 16-20: Kompetansemål + AI
1. Importer LK20-data for matematikk
2. OpenAI-integrasjon
3. Kompetansemålprofil beregning

### Dag 21-25: Prioriteringsliste
1. Sorteringslogikk
2. Anbefaling-generering
3. UI for prioriteringsliste

### Dag 26-30: Dokumentasjon
1. "Hva mangler"-sjekkliste
2. PDF-generering (enkel)
3. Foresatt-portal

---

## 9. Viktige notater for Claude Code

### Testing-strategi
- Bruk mock data for 24 elever
- Test bulk-registrering grundig (flaskehals!)
- Test med både 1-6 og L-M-H nivåsystem

### Performance-hensyn
- Bruk Prisma `include` smart (unngå N+1)
- Index på `studentId`, `classGroupId`, `competenceGoalId`
- Cache kompetansemål (endres sjelden)

### Edge cases
- Elev med fritak (kan være tom array av kompetansemål)
- Ingen vurderinger ennå (vis tom state)
- Tilbakemelding er valgfri (kan være null/undefined)

### OpenAI prompt for kompetansemålforslag
```typescript
const prompt = `
Du er en ekspert på norsk læreplan LK20.

Vurderingsbeskrivelse: "${description}"
Vurderingsform: ${form}
Fag: ${subject}
Årstrinn: ${grade}

Foreslå 3-5 mest relevante kompetansemål.
Returner kun kompetansemål-ID som JSON array.

Tilgjengelige kompetansemål:
${JSON.stringify(availableGoals)}
`;
```

---

## 10. Miljøvariabler (.env.local)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vurdering"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# Google Cloud (for produksjon)
GOOGLE_CLOUD_PROJECT="project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="bucket-name"
```

---

## 11. Neste steg

1. ✅ Kopier `schema.prisma` fra neste fil
2. ✅ Sett opp prosjekt i VS Code
3. ✅ Start med Claude Code: "Sett opp Next.js prosjekt med Prisma basert på teknisk_spesifikasjon_prototype.md"
4. ✅ Følg implementeringsplan dag for dag

---

**Lykke til med byggingen! 🚀**
