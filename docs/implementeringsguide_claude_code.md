# Implementeringsguide for Claude Code

**Formål:** Steg-for-steg instruksjoner for å bygge prototypen i VS Code med Claude Code.

---

## Forutsetninger

- VS Code installert
- Claude Code extension installert
- Node.js 18+ installert
- pnpm installert (`npm install -g pnpm`)
- PostgreSQL tilgjengelig (lokal eller cloud)

---

## Sprint 1: Grunnmur (Dag 1-5)

### Dag 1: Prosjektoppsett

**Prompt til Claude Code:**
```
Sett opp et nytt Next.js 14 prosjekt med følgende:
- TypeScript
- Tailwind CSS
- App Router
- Prisma
- shadcn/ui

Mappestruktur skal følge teknisk_spesifikasjon_prototype.md.

Installer også:
- next-auth
- react-hook-form + zod
- openai
- recharts
- date-fns
```

**Deretter:**
1. Kopier `schema.prisma` til `prisma/schema.prisma`
2. Oppdater `.env.local` med DATABASE_URL
3. Kjør `npx prisma migrate dev --name init`
4. Kjør `npx prisma generate`

---

### Dag 2: Mock autentisering

**Prompt til Claude Code:**
```
Sett opp NextAuth.js med en mock provider for testing.

Lag en hardkodet lærer-bruker:
- Email: larer@test.no
- Navn: Test Lærer
- Rolle: TEACHER

Lag login-side og beskytt alle routes unntatt /login.

Bruk middleware for å sjekke autentisering.
```

---

### Dag 3: Layout og navigasjon

**Prompt til Claude Code:**
```
Lag en dashboard-layout med:
- Sidebar med navigasjon:
  - Mine faggrupper
  - Min side
  - Logg ut
- Header med lærernavn
- Responsivt (mobil: hamburger-meny)

Bruk shadcn/ui komponenter for UI.
```

---

### Dag 4: CSV-import av elever

**Prompt til Claude Code:**
```
Lag funksjonalitet for å importere elever fra CSV.

CSV-format:
Navn,Fødselsnummer,Trinn
Emma Hansen,12345678901,10
Oliver Andersen,12345678902,10
...

Lag:
1. Upload-side med drag-and-drop
2. Preview av data før import
3. API endpoint POST /api/students/import
4. Validering (fødselsnummer må være unikt)
5. Lagre til database via Prisma

Vis suksessmelding etter import.
```

**Test med:**
- Lag en CSV med 24 mock-elever
- Test import

---

### Dag 5: Enkel vurderingsregistrering

**Prompt til Claude Code:**
```
Lag skjema for å registrere vurdering (individuell) basert på produktspesifikasjon.

Obligatoriske felt:
- Dato
- Vurderingstype (dropdown)
- Vurderingsform (dropdown)
- Karakter (1-6 dropdown eller "Ikke vurdert")

Valgfrie felt:
- Beskrivelse
- Tilbakemelding (textarea)
- Intern merknad (textarea)

Lag:
1. AssessmentForm.tsx komponent med react-hook-form + zod
2. API endpoint POST /api/assessments
3. Lagre til database
4. Vis vurderinger i en liste (AssessmentList.tsx)

Bruk shadcn/ui form components.
```

**Test:**
- Registrer 3-5 vurderinger for en elev
- Verifiser i database

---

## Sprint 2: Bulk-registrering (Dag 6-10)

### Dag 6-7: Bulk-form UI

**Prompt til Claude Code:**
```
Lag bulk-registrering basert på produktspesifikasjon seksjon 3.3.

Layout:
1. Øverst: Felles felt for alle elever
   - Dato
   - Beskrivelse (valgfritt)
   - Vurderingsform
   - Kompetansemål (valgfritt - kan hoppes over nå)

2. Under: Liste over alle elever i faggruppen
   - Hver rad: Elevnavn, Karakter-dropdown, Tilbakemelding (valgfritt)
   - Progress indicator: "3/24 elever ferdig"

3. Bunn: 
   - [Lagre alle som kladd]
   - [Publiser ferdigstilte]

Lag BulkAssessmentForm.tsx komponent.
Bruk optimistisk UI for rask respons.
```

**Viktig:**
- Performance: Ikke re-render hele listen ved hver endring
- Bruk React.memo for elev-rader

---

### Dag 8: Bulk-backend

**Prompt til Claude Code:**
```
Lag API endpoint for bulk-registrering:
POST /api/assessments/bulk

Input:
{
  classGroupId: string,
  commonData: {
    date: Date,
    type: AssessmentType,
    form: AssessmentForm,
    description?: string
  },
  assessments: [
    {
      studentId: string,
      grade: number | null,
      feedback?: string
    },
    ...
  ]
}

Backend skal:
1. Validere input
2. Opprette alle vurderinger i én transaksjon (Prisma transaction)
3. Returnere antall opprettede vurderinger

Håndter feil gracefully (partial success hvis noen feiler).
```

**Test:**
- Bulk-registrer 24 elever
- Mål tid (mål: <10 min fra start til finish)

---

### Dag 9: Kladd/publiser

**Prompt til Claude Code:**
```
Implementer kladd/publiser-funksjonalitet:

1. Alle vurderinger lagres som kladd (isPublished = false) som standard
2. Legg til "Publiser"-knapp på hver vurdering i AssessmentList
3. Legg til "Publiser alle"-knapp for bulk
4. API endpoint PATCH /api/assessments/:id/publish
5. Vis badge "KLADD" på upubliserte vurderinger

Lag også oversikt over upubliserte vurderinger i "Mine oppgaver".
```

---

### Dag 10: Testing og polering

**Oppgaver:**
- Test bulk-registrering med 24 elever
- Fiks bugs
- Forbedre UX (loading states, error messages)
- Responsivt design

---

## Sprint 3: Dashboard (Dag 11-15)

### Dag 11-12: StudentCard component

**Prompt til Claude Code:**
```
Lag StudentCard.tsx komponent basert på produktspesifikasjon seksjon 3.5 (elevcentrisk visning).

Vis:
- Elevnavn
- Status-indikator (grønn/gul/rød)
- Antall vurderinger (totalt + fordeling)
- Kompetansemåldekning (X/Y mål)
- Problemer (hvis noen)
- Handlingsknapper:
  - [Vis detaljer]
  - [Legg til vurdering]
  - [Sjekkliste]

Farger:
- Grønn: Klar for standpunkt
- Gul: Nesten klar (advarsler)
- Rød: Kritiske mangler

Bruk shadcn/ui Card component.
```

---

### Dag 13: Advarselslogikk

**Prompt til Claude Code:**
```
Implementer advarselslogikk i backend.

Lag funksjon `calculateStudentStatus(studentId, classGroupId)` som returnerer:
{
  status: "OK" | "WARNING" | "CRITICAL",
  warnings: [
    { type: "MIN_WRITTEN", message: "..." },
    { type: "COMPETENCE_COVERAGE", message: "..." },
    ...
  ]
}

Regler:
- CRITICAL: <2 skriftlige vurderinger
- WARNING: Kun én vurderingsform, <50% kompetansemåldekning, >3 mnd siden sist vurdert
- OK: Alt ok

Bruk i API GET /api/students/:id/status
```

---

### Dag 14: Elevcentrisk dashboard

**Prompt til Claude Code:**
```
Lag faggruppe-oversikt side (elevcentrisk visning).

Route: /faggrupper/[id]

Vis:
- Header: Faggruppens navn
- Tabs: [Elevcentrisk] [Kompetansemålcentrisk] [Prioriteringsliste]
- Filter: [Alle] [Kun risiko] [Mangler vurdering]
- Liste med StudentCard for hver elev
- Statistikk-widget (snitt vurderinger, risiko osv)

Hent data fra:
- GET /api/class-groups/:id/students
- GET /api/analytics/warnings?classGroupId=X
```

---

### Dag 15: Polering

- Forbedre loading states
- Legg til skeletons
- Forbedre feilhåndtering
- Responsivt design

---

## Sprint 4: Kompetansemål + AI (Dag 16-20)

### Dag 16: Importer LK20-data

**Manuell oppgave:**
1. Finn kompetansemål for matematikk (8.-10. trinn) fra udir.no
2. Lag JSON-fil med struktur:
```json
[
  {
    "subject": "Matematikk",
    "grade": 10,
    "area": "Tall og algebra",
    "code": "MAT-01-05",
    "description": "utforske og beskrive..."
  },
  ...
]
```
3. Lag seed-script for Prisma

**Prompt til Claude Code:**
```
Lag seed-script som importerer kompetansemål fra JSON.

Fil: prisma/seed.ts

Kjør med: npx prisma db seed
```

---

### Dag 17: OpenAI-integrasjon

**Prompt til Claude Code:**
```
Lag AI-funksjon for å foreslå kompetansemål basert på vurderingsbeskrivelse.

API endpoint: POST /api/ai/suggest-goals

Input:
{
  description: string,
  form: AssessmentForm,
  subject: string,
  grade: number
}

Output:
{
  suggestions: [
    { id: string, code: string, description: string, score: number },
    ...
  ]
}

Bruk OpenAI GPT-4 API.
Prompt skal be om 3-5 mest relevante kompetansemål.
Returner kun kompetansemål-IDer fra databasen.

Håndter feil gracefully (hvis OpenAI er nede, vis manuell søk).
```

**Test:**
- "Prøve i likninger" → skal foreslå algebra-mål
- "Muntlig presentasjon om statistikk" → skal foreslå statistikk-mål

---

### Dag 18: Kompetansemålprofil beregning

**Prompt til Claude Code:**
```
Lag funksjon for å beregne kompetansemålprofil for en elev.

Backend-funksjon: `calculateCompetenceProfile(studentId)`

For hvert kompetansemål eleven er vurdert i:
1. Hent alle vurderinger knyttet til målet
2. Beregn gjennomsnitt (vekt nyere høyere hvis konfigurert)
3. Konverter til nivå (L-M-H eller 1-6)
4. Lagre i CompetenceProfile-tabellen

Vekting:
- 8. trinn: x1
- 9. trinn: x1.5
- 10. trinn: x2

Nivå (1-6 system):
- Avrund til nærmeste hele tall
```

---

### Dag 19-20: Kompetansemålprofil UI

**Prompt til Claude Code:**
```
Lag kompetansemålprofil-visning basert på produktspesifikasjon seksjon 3.13.

Side: /faggrupper/[id]/elever/[studentId]/kompetanseprofil

Vis:
1. Oversikt per kompetanseområde
   - Navn på område
   - Liste over mål med nivå-indikator
   - Antall vurderinger per mål

2. Detaljvisning (når klikker på et mål):
   - Samlet nivå
   - Vurderingshistorikk (kronologisk)
   - Utviklingsgraf (recharts)
   - Lærernotat (textarea, lagres separat)

Bruk:
- Radargraf for å vise profil på tvers av områder
- Fargekoding (grønt/gult/rødt)
- shadcn/ui komponenter

Lag komponenter:
- CompetenceProfileChart.tsx
- CompetenceGoalDetail.tsx
```

---

## Sprint 5: Prioriteringsliste (Dag 21-25)

### Dag 21-22: Sorteringslogikk

**Prompt til Claude Code:**
```
Lag backend-logikk for prioriteringsliste basert på produktspesifikasjon seksjon 3.5 (visningsmodus 3).

API endpoint: GET /api/analytics/priority-list?classGroupId=X

Output:
{
  ready: [
    {
      studentId: string,
      name: string,
      competenceCoverage: number,
      assessmentCount: number,
      lastAssessed: Date
    },
    ...
  ],
  almostReady: [...],
  needsWork: [...]
}

Sorteringsregler:
- KLAR: 100% kompetansemåldekning + >6 vurderinger + varierte former
- NESTEN KLAR: 60-99% dekning ELLER <6 vurderinger ELLER mangler variasjon
- TRENGER ARBEID: <60% dekning ELLER <3 vurderinger

Generer anbefalinger per elev basert på hva som mangler.
```

---

### Dag 23-24: Prioriteringsliste UI

**Prompt til Claude Code:**
```
Lag prioriteringsliste-side basert på produktspesifikasjon.

Route: /faggrupper/[id]?tab=prioriteringsliste

Vis tre seksjoner:
1. KLAR FOR STANDPUNKT (grønn) ✓
2. NESTEN KLAR (gul) 🟡
3. TRENGER MYE ARBEID (rød) 🔴

For hver elev vis:
- Navn
- Kompetansemåldekning (%)
- Antall vurderinger
- Sist vurdert
- Anbefaling (generert fra backend)
- [Planlegg vurdering]-knapp

Lag PriorityList.tsx komponent.
```

---

### Dag 25: Testing

- Test med ulike scenarioer
- Verifiser at anbefalinger er fornuftige
- Polering

---

## Sprint 6: Dokumentasjon (Dag 26-30)

### Dag 26: "Hva mangler"-sjekkliste

**Prompt til Claude Code:**
```
Lag "Hva mangler"-sjekkliste per elev basert på produktspesifikasjon seksjon 3.17.

Route: /faggrupper/[id]/elever/[studentId]/sjekkliste

Vis:
- Status (OK/IKKE KLAR)
- Vurderingsgrunnlag (✓ eller ⚠️ med forklaring)
- Kompetansemåldekning (% + hvilke mål mangler)
- Sist vurdert
- Fritak (hvis relevant)
- Anbefalte tiltak

Lag ChecklistView.tsx komponent.

API endpoint: GET /api/students/:id/checklist?classGroupId=X
```

---

### Dag 27-28: PDF-eksport (enkel versjon)

**Prompt til Claude Code:**
```
Lag PDF-eksport av elevmappe basert på produktspesifikasjon seksjon 3.9.

Bruk bibliotek: @react-pdf/renderer eller puppeteer

API endpoint: GET /api/students/:id/export-pdf?classGroupId=X

PDF skal inneholde:
1. Oversikt (standpunkt, antall vurderinger)
2. Kompetansemåldekning
3. Alle vurderinger (kronologisk)
4. Felt for manuell utfylling av halvårsvurdering
5. Metadata (generert dato, av hvem)

Returner PDF som nedlastbar fil.

Legg til [Eksporter PDF]-knapp i elevprofil.
```

---

### Dag 29: Foresatt-portal

**Prompt til Claude Code:**
```
Lag foresatt-portal (skrivebeskyttet) basert på produktspesifikasjon seksjon 3.10.

Route: /foresatt

Mock autentisering: Hardkod en foresatt knyttet til én elev.

Vis:
- Barnets navn
- Tabs per fag
- Kun publiserte vurderinger (isPublished = true)
- Kompetansemålprofil (uten lærernotater)
- Sorter kronologisk (nyeste først)

Lag ParentPortal.tsx komponent.

Bruk samme komponenter som lærer-visning, men skrivebeskyttet.
```

---

### Dag 30: Testing og polering

**Oppgaver:**
- Full gjennomgang av alle funksjoner
- Fikse bugs
- Forbedre UX
- Responsivt design
- Skrive README.md med:
  - Hvordan kjøre lokalt
  - Testbrukere
  - Funksjonalitet implementert
  - Kjente begrensninger

---

## Etter Sprint 6: Klar for pilot-testing

**Sjekkliste:**
- [ ] Alle MVP-funksjoner implementert
- [ ] Testet med 24 mock-elever
- [ ] Bulk-registrering fungerer (<10 min)
- [ ] PDF-eksport fungerer
- [ ] Foresatt-portal fungerer
- [ ] Dokumentasjon klar
- [ ] Deployet til Google Cloud (eller Vercel for prototype)

---

## Tips for Claude Code-bruk

### Effektive prompts:
```
"Lag [komponent] basert på produktspesifikasjon seksjon X.Y"
"Implementer backend-logikk for [feature] som beskrevet i teknisk_spesifikasjon_prototype.md"
"Fiks styling på [komponent] - bruk shadcn/ui og Tailwind"
"Legg til error handling i [funksjon]"
```

### Debugging:
```
"Jeg får denne feilen: [error]. Hva er galt?"
"Hvorfor vises ikke [data] i UI?"
"Optimaliser denne query - den er for treg"
```

### Testing:
```
"Lag mock data for testing av [feature]"
"Skriv test for [funksjon]"
```

---

## Neste steg etter prototype

1. DPIA-gjennomføring
2. Pilot-testing (1-2 skoler, 2 måneder)
3. Samle feedback
4. Iterere basert på feedback
5. Planlegge Fase 2 (AI-tilbakemeldinger, Vigilo-integrasjon)

---

**Lykke til! 🎯**
