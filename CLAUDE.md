# Vurderingsverktoy - Komplett Prosjektdokumentasjon

## Oversikt

Vurderingsverktoy er et komplett vurderingssystem for norske ungdomsskoler (8.-10. trinn). Systemet stotter fire brukerroller: laerer, rektor, foresatt og elev.

**Produksjons-URL:** https://vurderingsverktoykomplett.vercel.app

## Teknisk Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Prisma 5.10.0
- **Autentisering:** NextAuth.js med Credentials provider
- **UI:** shadcn/ui komponenter, Tailwind CSS
- **Deployment:** Vercel

## Prosjektstruktur

```
src/
├── app/
│   ├── (dashboard)/          # Laererportal (turkis tema)
│   │   ├── dashboard/
│   │   ├── faggrupper/[id]/
│   │   ├── mine-elever/
│   │   ├── oppgaver/
│   │   ├── rapporter/
│   │   └── fritak/
│   ├── (rektor)/             # Rektorportal (lilla tema)
│   │   └── rektor/
│   │       ├── elever/
│   │       ├── larere/
│   │       ├── faggrupper/
│   │       ├── faggrupper/ny/
│   │       ├── import/
│   │       ├── vurderingspraksis/
│   │       └── varsler/
│   ├── (foresatt)/           # Foresattportal (gronn tema)
│   │   └── foresatt/
│   │       ├── barn/[id]/
│   │       └── vurderinger/
│   ├── (elev)/               # Elevportal (cyan tema)
│   │   └── elev/
│   │       ├── kompetanse/
│   │       └── vurderinger/
│   └── api/                  # API-ruter
├── components/
│   ├── ui/                   # shadcn/ui komponenter
│   ├── dashboard/            # Laerer-komponenter
│   ├── rektor/               # Rektor-komponenter
│   └── elev/                 # Elev-komponenter
└── lib/
    ├── auth.ts               # NextAuth konfigurasjon
    ├── prisma.ts             # Prisma klient
    └── student-status.ts     # Beregning av elevstatus
```

## Roller og Tilgang

### Laerer (TEACHER)
- Dashboard med oversikt over faggrupper og elever
- Registrere vurderinger (ONGOING, MIDTERM, FINAL)
- Se kompetanseprofiler for elever
- Administrere fritak
- Se oppgaver og varsler
- **Kan IKKE** importere elever eller opprette faggrupper

### Rektor (PRINCIPAL)
- Full oversikt over alle elever og laerere
- Importere elever via CSV
- Opprette faggrupper og tildele til laerere
- Vurderingspraksis-rapporter
- Systemvarsler og statistikk

### Foresatt (PARENT)
- Se egne barns vurderinger
- Kompetanseprofil per fag
- Tilbakemeldinger fra laerere

### Elev (STUDENT)
- Mine vurderinger - alle publiserte vurderinger
- Mine kompetansemal - klikkbare med detaljvisning
- Maloppnaelse per kompetansemal (snittkarakter)

## Database Schema

### Hovedmodeller
- **User** - Brukere (TEACHER, PRINCIPAL, PARENT, STUDENT)
- **Student** - Elever med fornummer og trinn
- **ClassGroup** - Faggrupper (f.eks. "Matematikk 10A")
- **Assessment** - Vurderinger med karakter og tilbakemelding
- **CompetenceGoal** - Kompetansemal fra laereplanen
- **Exemption** - Fritak (fullt, delvis, uten karakter)
- **Task** - Oppgaver for laerere

### Vurderingstyper
- **ONGOING** - Underveisvurdering
- **MIDTERM** - Halvarsvurdering
- **FINAL** - Standpunktkarakter

### Vurderingsformer
- **WRITTEN** - Skriftlig
- **ORAL** - Muntlig
- **ORAL_PRACTICAL** - Muntlig-praktisk
- **PRACTICAL** - Praktisk

## Testdata (Seed)

### Brukere for innlogging
| Rolle | E-post | Navn |
|-------|--------|------|
| Rektor | rektor@test.no | Kari Nordmann |
| Laerer (Matematikk) | larer@test.no | Ole Hansen |
| Laerer (Norsk) | norsk.larer@test.no | Anna Larsen |
| Laerer (Engelsk) | engelsk.larer@test.no | Erik Berg |
| Laerer (Spansk) | spansk.larer@test.no | Maria Garcia |
| Laerer (Naturfag) | naturfag.larer@test.no | Per Olsen |
| Laerer (Samfunn/KRLE) | samfunn.larer@test.no | Line Johansen |
| Laerer (Kunst/Musikk) | kunst.larer@test.no | Kristin Vik |
| Laerer (Gym/Mat&Helse) | gym.larer@test.no | Thomas Moe |
| Foresatt | foresatt@test.no | Trude Hansen |
| Elev | elev@test.no | Emma Hansen |

### Klasser
- **10. trinn:** 10A (10 elever), 10B (8 elever), 10C (8 elever)
- **9. trinn:** 9B (10 elever), 9D (8 elever)
- **8. trinn:** 8A (8 elever), 8B (8 elever), 8C (8 elever)

### Fag (11 stk)
Matematikk, Norsk, Engelsk, Naturfag, Samfunnsfag, KRLE, Spansk, Kunst og handverk, Musikk, Mat og helse, Kroppsoving

### Data mengder
- 68 elever
- 88 faggrupper (11 fag x 8 klasser)
- 108 kompetansemal
- 1496 vurderinger (2 per elev per fag)

## Viktige API-endepunkter

### Laerer
- `GET /api/class-groups` - Hent laererens faggrupper
- `GET /api/class-groups/[id]` - Faggruppe med elever
- `POST /api/assessments` - Opprett vurdering
- `GET /api/teacher/students` - Alle laererens elever

### Rektor
- `GET /api/rektor/stats` - Skolestatistikk
- `GET /api/rektor/students` - Alle elever
- `GET /api/rektor/teachers` - Alle laerere
- `POST /api/class-groups` - Opprett faggruppe (med teacherId)
- `POST /api/students/import` - Importer elever fra CSV

### Elev
- `GET /api/elev/profile` - Elevens komplette profil med:
  - Alle fag og kompetansemal
  - Vurderinger koblet til hvert kompetansemal
  - Snittkarakter per kompetansemal

### Foresatt
- `GET /api/foresatt/children` - Alle barn
- `GET /api/foresatt/children/[id]` - Barnets profil

## Kommandoer

```bash
# Utvikling
npm run dev

# Bygg
npm run build

# Database
npx prisma db push          # Push schema
npx prisma db push --force-reset  # Reset database
npx tsx prisma/seed.ts      # Kjar seed

# Deploy
vercel --prod
```

## Spesielle funksjoner

### Elevportal - Kompetansemal
- Kompetansemal er klikkbare og apner en dialog
- Viser alle vurderinger knyttet til malet
- Viser snittkarakter med fargekoding (gron 5-6, gul 3-4, rod 1-2)
- Gruppert etter kompetanseomrade

### Rektorportal - Administrasjon
- Importer elever: CSV med navn, personnummer, trinn
- Opprett faggruppe: Velg laerer, fag, klasse, elever
- Vurderingspraksis: Oversikt over alle laereres vurderinger

### Oppgaver (Mine oppgaver)
- Trinnbaserte advarsler
- 10. trinn: Fokus pa standpunkt-beredskap
- 8. trinn: Advarsel hvis elev ikke vurdert innen oktober
- Typer: ASSESSMENT_MISSING, FORM_VARIETY, ASSESSMENT_COVERAGE

## Miljøvariabler (.env.local)

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## Feilsoking

### Prerender-feil
Legg til `export const dynamic = 'force-dynamic'` i sider som bruker fetch().

### Database timeout
Neon serverless kan ha cold start. Forsok igjen eller sjekk connection pooling.

### NextAuth feil
Sjekk at NEXTAUTH_URL og NEXTAUTH_SECRET er satt korrekt.
