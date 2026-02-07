# Implementeringsspesifikasjon: UI/UX Forbedringer
## Vurderingsverktøy

---

## Innholdsfortegnelse

1. [Generelle endringer](#1-generelle-endringer)
2. [Elevportal](#2-elevportal)
3. [Foresattportal](#3-foresattportal)
4. [Rektorportal](#4-rektorportal)
5. [Tekniske fikser](#5-tekniske-fikser)
6. [Implementeringsrekkefølge](#6-implementeringsrekkefølge)

---

## 1. Generelle endringer

### 1.1 Språk og tegn (æøå)

**Scope:** Alle portaler

Gjennomgå og korriger alle forekomster av manglende norske tegn i hele applikasjonen.

| Feil | Riktig |
|------|--------|
| `kompetansemal` | `kompetansemål` |
| `Maloppnaelse` | `Måloppnåelse` |
| `Hoy` | `Høy` |

**Implementering:** Søk gjennom alle `.tsx`-filer, seed-data, og databaseverdier etter ord som mangler æ, ø, å. Sjekk spesielt hardkodede strenger i UI-komponenter og labels.

---

### 1.2 Fargeskjema — Unified blå/mørkeblå palett

**Scope:** Foresattportal og Rektorportal

Begge portalene skal bruke samme fargepalett som lærerportalen (blå/mørkeblå). Fjern all bruk av rød/rosa (foresatt) og lilla/rosa (rektor).

**Implementering:**
- Identifiser alle fargekonstanter/CSS-variabler i foresatt- og rektorportalene
- Erstatt med lærerportalens blå palett
- Verifiser kontrast og lesbarhet etter endring

---

### 1.3 Vurderingssystem — IV (Ikke Vurdert)

**Scope:** Alle portaler

Legg til `IV` som egen vurderingsmulighet. Lærere skal kunne gi karakterene **1–6** samt **IV**.

**Implementering:**
- Utvid vurderingsskjema i lærerportalen til å inkludere IV-valg
- Oppdater databasemodell/enum hvis nødvendig (Prisma schema)
- Vis IV konsekvent i alle portaler der vurderinger vises
- Erstatt alle forekomster av `-` (strek) for ikke-vurdert med `IV`

---

## 2. Elevportal

### 2.1 Kompetansemål-side

#### 2.1.1 Måloppnåelse statistikkboks

| Endring | Detaljer |
|---------|----------|
| Reduser høyde | Boksen tar for mye plass vertikalt |
| Fordel jevnt i bredden | Elementene skal bruke full bredde |
| Endre "Ikke vurdert" → "IV" | Kortere label |
| Elementrekkefølge | `5-6 Høy` · `3-4 Middels` · `1-2 Lav` · `IV` |

**CSS/Layout:** Bruk `flex` med `justify-between` eller `grid` med 4 kolonner for jevn fordeling.

#### 2.1.2 Fagtabs — KRITISK FEIL

> ⚠️ **Bug:** Fagknappene reagerer ikke på klikk. Ingen fag kan velges.

**Feilsøking:**
1. Sjekk at `onClick`/`onPress` handler er bundet til tab-komponentene
2. Verifiser at state-oppdatering (`setActiveSubject` e.l.) faktisk trigges
3. Sjekk om et overliggende element fanger klikk (z-index, pointer-events)
4. Test at riktig data lastes ved tab-bytte

#### 2.1.3 Kompetansemålvisning

**Fjernes:**
- Tallkarakterer (f.eks. "4")
- Ordet "snitt"

**Legges til — Stjernesystem:**

| Indikator | Betydning |
|-----------|-----------|
| ⭐ Grønn stjerne | Vurdert siste 365 dager |
| ⭐ Gul stjerne | Vurdert for >365 dager siden |
| `IV` | Ikke vurdert (erstatter `-`) |

**Implementering:**
- Beregn `daysSinceLastAssessment` per kompetansemål
- Render grønn stjerne hvis ≤365 dager, gul hvis >365, `IV` hvis ingen vurdering
- Bruk ikon-komponent med dynamisk farge (`text-green-500` / `text-yellow-500`)

---

### 2.2 Vurderinger-side

#### 2.2.1 Statistikkboks øverst

**Ny logikk:**
- Hvis nye vurderinger siden sist innlogging → Vis melding: _"Du har nye vurderinger"_
- Ellers → Vis standard statistikk

**Krav:** Trenger `lastLoginAt`-timestamp per elev for å beregne nye vurderinger.

#### 2.2.2 Notification badges på fagtabs

Vis rød badge (tall) på fagtabs som har nye vurderinger siden sist innlogging, tilsvarende iOS-notifications.

**Implementering:**
- Beregn `newAssessmentCount` per fag basert på `lastLoginAt`
- Render `<Badge>` komponent med tall på relevante tabs
- Badge forsvinner når eleven har sett vurderingene

#### 2.2.3 Fagtabs layout

**Problem:** To rader med fag som ikke passer bredden.

**Løsning:** Bruk horisontal scroll (`overflow-x-auto`) eller responsiv wrapping med bedre spacing. Vurder også å bruke en dropdown/select for mange fag.

#### 2.2.4 Vurderingstabell

| Endring | Fra | Til |
|---------|-----|-----|
| Fjern "Type"-kolonne | Halvårsvurdering/Underveisvurdering | — |
| Vis vurderingsnavn | — | Navnet læreren ga vurderingen |
| Vis hurtigvurderinger | Skjult | Synlig i tabellen |

#### 2.2.5 Interaksjon — Ekspanderbare rader

- Klikk på en vurderingsrad → Utvid og vis kommentar inline
- Fjern separat "Tilbakemeldinger"-seksjon
- Bruk accordion/collapsible pattern

---

## 3. Foresattportal

### 3.1 Strukturelle endringer

**Fjern sidebar helt.** Portalen skal kun ha én side: **"Oversikt"**.

Oversiktssiden viser alle barn med kort info. Klikk på et barn fører til en elevside.

### 3.2 Oversiktsside

#### 3.2.1 Barnekort

| Fjernes | Beholdes |
|---------|----------|
| "Totalt antall vurderinger 22" | "Siste vurderinger" med fag, dato, antall |

**Endre knappetekst:** `Se alle vurderinger` → `Se elev`

#### 3.2.2 "Om vurderinger"-boks

Beholdes, men gjøres mindre. Inneholder info om at kun publiserte vurderinger vises.

### 3.3 Elevside

#### 3.3.1 Fjern lærere-boks

Hele boksen med læreroversikt fjernes — ikke nødvendig for foresatte.

#### 3.3.2 Fagtabs

- Vis **lærernavn** på høyresiden når man bytter fag
- Samme layout-forbedringer som elevportalen (se 2.2.3)
- Rød notification badge ved nye vurderinger siden sist innlogging

#### 3.3.3 Vurderingstabell

Identisk med elevportalens tabell (se 2.2.4 og 2.2.5):
- Fjern "Type"-kolonne
- Vis vurderingsnavn
- Vis hurtigvurderinger
- Klikk for å utvide og se kommentar

---

## 4. Rektorportal

### 4.1 Sidebar rekkefølge

```
1. Oversikt
2. Faggrupper
3. Vurderingspraksis
4. Lærere
5. Alle elever
6. Rapporter
7. Importer elever
8. Opprett faggruppe
```

### 4.2 Oversiktsside

#### 4.2.1 Statistikkbokser (topp)

| Endring | Detaljer |
|---------|----------|
| Reduser høyde | Mye mindre enn nå |
| Fjern | "Faggrupper" og "Vurderinger" bokser |
| Behold | "Lærere" (8) og "Elever" (68) |
| Full bredde | Boksene skal fylle siden horisontalt |
| Klikkbare | "Lærere" → Lærere-side, "Elever" → Alle elever-side |

#### 4.2.2 Elevstatus → Faggruppestatus

Endre overskrift og innhold fra "Elevstatus på skolen" til **"Faggruppestatus"** — mer relevant for rektor.

#### 4.2.3 Læreroversikt-boks

| Beholdes | Fjernes |
|----------|---------|
| Lærernavn | Antall vurderinger (272, 136 osv.) |
| "Kritisk"-tall | — |
| Antall faggrupper | — |

Klikk på lærernavn → Navigerer til lærerkortet.

#### 4.2.4 "Krever oppmerksomhet"-boks

Gjøres mye mindre.

### 4.3 Alle elever-side

#### 4.3.1 Statistikkbokser

Reduser størrelse på Klar/Nesten klar/Kritisk-boksene.

#### 4.3.2 Filtrering

| Filter | Type |
|--------|------|
| Søk etter navn | Tekstfelt (beholdes) |
| Trinn | Dropdown: 8., 9., 10. |
| Skoleklasse | Dropdown: 8A, 8B, 10C osv. |
| Faggrupper | Dropdown/multiselect |

#### 4.3.3 Elevliste kolonner

| Fjernes | Legges til |
|---------|-----------|
| "Fag" (lange lister) | Fødselsnummer |
| — | Skoleklasse (8A, 10C osv.) |

#### 4.3.4 Interaksjon

Klikk på elev → Vis samme elevkort som kontaktlærer ser i lærerportalen.

### 4.4 Lærere-side

#### 4.4.1 Statistikkbokser

- Gjør mindre
- Fjern "Totalt vurderinger"
- Behold "Antall lærere" og "Totalt faggrupper"

#### 4.4.2 Lærerliste kolonner

| Fjernes | Beholdes | Legges til |
|---------|----------|-----------|
| "Vurderinger" (140, 136...) | "Elever" | Advarsel-status |
| — | "Status" | — |

**Advarsel-status:** Mildere varsel før det blir kritisk (gul/oransje indikator).

#### 4.4.3 Interaksjon

Klikk på lærer → Vis lærerkort med oversikt.

### 4.5 Faggrupper-side

Klikk på faggruppe → Vis samme faggruppevisning som faglærer ser i lærerportalen.

### 4.6 Vurderingspraksis-side

Beholdes strukturelt (kun statistikk).

**Ny interaksjon:** Klikk på lærers stat-boks → Vis side med oversikt over alle lærerens faggrupper, inkludert karakterfordeling og vurderingsformer per faggruppe. Formål: Se om læreren er "snill/streng" vs. elevsammensetning.

### 4.7 Importer elever-side

Ingen endringer.

---

## 5. Tekniske fikser

### 5.1 Kritiske bugs

| # | Bug | Portal | Side |
|---|-----|--------|------|
| 1 | Fagtabs reagerer ikke på klikk | Elevportal | Kompetansemål |
| 2 | Fagtabs-layout bryter ved to rader | Alle portaler | Alle sider med fagtabs |

### 5.2 Event handlers

- Verifiser at alle tabs og klikkbare elementer har fungerende event handlers
- Test navigasjon fungerer som forventet i alle portaler
- Legg til `cursor-pointer` på alle interaktive elementer

---

## 6. Implementeringsrekkefølge

### Fase 1 — Kritisk (høy prioritet)

1. **Fiks fagtabs-funksjonalitet** — Klikk fungerer ikke (blokkerer bruk)
2. **Stjernesystem og IV** — Nytt vurderingsindikatorsystem
3. **Fjern unødvendige statistikkbokser** — Rydde opp i alle portaler
4. **Notification badges** — Nye vurderinger synlig for elev/foresatt
5. **Fagtabs layout** — Responsiv visning

### Fase 2 — Middels prioritet

6. **Foresattportal omstrukturering** — Fjern sidebar, én-side layout
7. **Fargeskjema** — Unified blå palett for foresatt- og rektorportal
8. **Filtrering rektorportal** — Trinn, klasse, faggruppe-filtre
9. **Advarsel-status** — Ny status-indikator for lærere

### Fase 3 — Lav prioritet

10. **Statistikkboks-høyder** — Juster størrelse i alle portaler
11. **Sidebar-rekkefølge** — Rektorportal meny
12. **Språklige rettelser** — æøå gjennomgang

---

## Delte komponenter

Følgende komponenter bør implementeres som gjenbrukbare for å unngå duplisering:

| Komponent | Brukes i |
|-----------|----------|
| `<SubjectTabs>` | Elevportal, Foresattportal |
| `<NotificationBadge>` | Elevportal, Foresattportal |
| `<AssessmentTable>` | Elevportal, Foresattportal |
| `<ExpandableRow>` | Elevportal, Foresattportal |
| `<StarIndicator>` | Elevportal |
| `<StatBox>` | Alle portaler |
| `<FilterBar>` | Rektorportal |

---

*Spesifikasjonen er klar for implementering.*