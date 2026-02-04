# Vurderingsverktøy - Prototype

Intelligent oversikts- og kvalitetssikringsverktøy for vurdering i ungdomsskolen.

## 🚀 Quick Start

### Forutsetninger
- Node.js 18+
- PostgreSQL
- pnpm (`npm install -g pnpm`)

### Installasjon

1. **Klon og installer:**
```bash
git clone <repo-url>
cd vurderingsverktoy
pnpm install
```

2. **Sett opp database:**
```bash
# Kopier .env.example til .env
cp .env.example .env

# Rediger .env og legg inn database-URL
nano .env

# Kjør migrations
pnpm db:migrate

# Seed test-data
pnpm db:seed
```

3. **Start dev-server:**
```bash
pnpm dev
```

Åpne [http://localhost:3000](http://localhost:3000)

---

## 📂 Mappestruktur

```
vurderingsverktoy/
├── prisma/
│   ├── schema.prisma          # Database-skjema
│   ├── seed.ts                # Seed-script
│   └── competence_goals_matematikk.json
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── faggrupper/
│   │   │   ├── min-side/
│   │   │   └── foresatt/
│   │   ├── api/               # API routes
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui komponenter
│   │   ├── assessments/       # Vurderingskomponenter
│   │   ├── dashboard/         # Dashboard-komponenter
│   │   └── competence-profile/
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── openai.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🧪 Test-brukere

Etter seeding er følgende brukere tilgjengelige:

**Lærer:**
- Email: `larer@test.no`
- Navn: Test Lærer
- Faggruppe: Matematikk 10A (24 elever)

**Rektor:**
- Email: `rektor@test.no`
- Navn: Test Rektor

---

## 📚 Database

### Kommandoer

```bash
# Push schema uten migrations (utvikling)
pnpm db:push

# Opprett ny migration
pnpm db:migrate

# Åpne Prisma Studio (GUI)
pnpm db:studio

# Reset database og re-seed
pnpm db:reset

# Kun re-seed
pnpm db:seed
```

### Test-data

Seeding oppretter:
- ✅ 27 kompetansemål (matematikk 8-10)
- ✅ 24 elever (Matematikk 10A)
- ✅ 1 faggruppe
- ✅ Sample vurderinger for 3 elever (ulike statuser)

---

## 🎨 UI Components

Prosjektet bruker **shadcn/ui** komponenter.

### Installere nye komponenter:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

Komponenter kopieres til `src/components/ui/` og kan redigeres fritt.

### Styling:

- **Tailwind CSS** for all styling
- Se `ui_ux_design_guide.md` for fargepalett og design-system

---

## 🤖 AI-funksjoner

### OpenAI API

Brukes til å foreslå kompetansemål basert på vurderingsbeskrivelse.

**Sett opp:**
1. Få API-nøkkel fra [OpenAI](https://platform.openai.com/api-keys)
2. Legg inn i `.env`: `OPENAI_API_KEY=sk-...`

**Implementering:**
Se `openai_prompt_templates.md` for detaljer.

---

## 📦 Scripts

| Kommando | Beskrivelse |
|----------|-------------|
| `pnpm dev` | Start dev-server |
| `pnpm build` | Build for produksjon |
| `pnpm start` | Start produksjonsserver |
| `pnpm lint` | Lint kode |
| `pnpm db:push` | Push schema til database |
| `pnpm db:migrate` | Kjør migrations |
| `pnpm db:studio` | Åpne Prisma Studio |
| `pnpm db:seed` | Seed test-data |
| `pnpm db:reset` | Reset og re-seed database |

---

## 🏗️ Utvikling

### Følg implementeringsguiden:

Se `implementeringsguide_claude_code.md` for steg-for-steg plan (30 dager).

**Sprint-oversikt:**
- **Sprint 1 (Dag 1-5):** Grunnmur (auth, import, basis-registrering)
- **Sprint 2 (Dag 6-10):** Bulk-registrering + dashboard
- **Sprint 3 (Dag 11-15):** Kompetansemål + AI
- **Sprint 4 (Dag 16-20):** Prioriteringsliste
- **Sprint 5 (Dag 21-25):** "Hva mangler"-sjekkliste
- **Sprint 6 (Dag 26-30):** PDF-eksport + foresatt-portal

---

## 📖 Dokumentasjon

- `produktspesifikasjon_vurderingsverktoy_v6.md` - Full produktspesifikasjon
- `teknisk_spesifikasjon_prototype.md` - Teknisk arkitektur
- `implementeringsguide_claude_code.md` - Steg-for-steg implementering
- `ui_ux_design_guide.md` - Design-system og komponenter
- `openai_prompt_templates.md` - AI-implementering

---

## 🐛 Debugging

### Database-problemer:

```bash
# Sjekk connection
pnpm db:studio

# Reset alt
pnpm db:reset
```

### OpenAI-problemer:

```bash
# Test API-nøkkel
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Next.js cache:

```bash
rm -rf .next
pnpm dev
```

---

## 🚢 Deployment

### Vercel (anbefalt for prototype):

```bash
# Installer Vercel CLI
npm i -g vercel

# Deploy
vercel

# Legg til environment variables i Vercel dashboard
```

### Google Cloud Run:

Se deployment-guide (kommer senere).

---

## 📝 TODO før pilot

- [ ] DPIA gjennomført
- [ ] Feide-integrasjon (erstatt mock)
- [ ] Produksjonsdatabase (Google Cloud SQL)
- [ ] Error tracking (Sentry)
- [ ] Analytics (valgfritt)

---

## 🤝 Bidrag

Dette er en prototype for pilot-testing. Feedback mottas via:
- GitHub Issues
- Direct contact med utviklingsteam

---

## 📄 Lisens

[Velg lisens]

---

## 🆘 Hjelp

**Problemer?**
- Sjekk dokumentasjonen i `/docs`
- Åpne issue på GitHub
- Kontakt utviklingsteam

**Claude Code brukere:**
- Vis `teknisk_spesifikasjon_prototype.md` til Claude
- Følg `implementeringsguide_claude_code.md`
