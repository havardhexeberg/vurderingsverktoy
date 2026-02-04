# Produktspesifikasjon: Vurderingsverktøy for ungdomsskolen

**Versjon:** 6.0  
**Dato:** 2026-02-03  
**Status:** Klar for godkjenning

---

## 1. Produktvisjon

**Et intelligent oversikts- og kvalitetssikringsverktøy** som gir lærere full kontroll over vurderingsprosessen, forhindrer feil som kan føre til klager, og sikrer at alle kompetansemål dekkes gjennom ungdomsskolen.

**Kjerneverdier:**
1. **Oversikt**: Lærer ser hele bildet - vurderinger, kompetansemåldekning, risikoer
2. **Kvalitetssikring**: Proaktive advarsler hindrer feil før de skjer
3. **Dokumentasjon**: Enkel eksport av komplett bevis ved klagesaker

---

## 2. Bakgrunn og behov

### Problemstilling
Ungdomsskoler mangler i dag et helhetlig oversiktsverktøy for vurderinger. Dette fører til:
- Manglende oversikt over kompetansemåldekning (8.-10. trinn)
- Risiko for klager grunnet for få/ensidige vurderinger
- Tidkrevende dokumentasjon ved klagesaker
- Inkonsistente rutiner mellom lærere
- Utfordringer med å sikre rettferdig og lovlig standpunktvurdering
- Statsforvalter etterspør tydeligere kompetansemålbaserte tilbakemeldinger

### Juridisk kontekst
- **Klagerett**: Eleven kan klage på om gjeldende regler for karakterfastsetting er fulgt (ikke selve karakteren)
- **Vurderingsgrunnlag**: Standpunkten må baseres på bredt vurderingsgrunnlag som viser elevens samlede kompetanse. Én prøve er normalt ikke tilstrekkelig
- **Kompetansemål**: Læreren kan ikke vurdere sluttkompetansen bare på grunnlag av noen utvalgte kompetansemål
- **Varsling**: Elev og foresatte skal varsles skriftlig hvis det er tvil om eleven kan få karakter (håndteres i Vigilo)
- **Halvårsvurdering**: Fra 8. trinn skal halvårsvurdering suppleres med karakterer

### Målgruppe
- **Primærbrukere**: Faglærere i ungdomsskolen (8.-10. trinn), alle fag
- **Sekundærbrukere**: Skoleledelse (kvalitetssikring og oversikt), Kontaktlærere
- **Visningsbrukere**: Foresatte (skrivebeskyttet innsyn i publiserte vurderinger)

### Implementeringsstrategi
Skoleeier innfører obligatoriske rutiner for systemets bruk.

---

## 3. Funksjonelle krav

### 3.1 Autentisering og tilgangskontroll
**Prioritet: Høy (MVP)**

**Innlogging:**
- Feide eller BankID for alle brukergrupper
- Automatisk rollehåndtering basert på Feide-data (lærer, ledelse, foresatt)
- To-faktor autentisering (valgfritt, men anbefalt)

**Roller og tilganger:**
- **Faglærer**: Ser kun egne faggrupper, full skrivetilgang
- **Kontaktlærer**: Lesetilgang til alle fag for sine elever + "Hva mangler"-sjekkliste
- **Skoleledelse**: Lesetilgang til alle faggrupper på skolen + lærerstatistikk + klagebehandling
- **Foresatte**: Kun egne barn, kun publiserte vurderinger

---

### 3.2 Elevdata og klasselister
**Prioritet: Høy (MVP)**

**Import av elevlister:**
- Manuell import via Excel/CSV (MVP)
- Felt: Navn, fødselsnummer, klasse, fag, faggruppe
- Automatisk oppdatering ved endringer (ny elev, fraflytting)
- Fremtidig: API-integrasjon med eksisterende skoleadministrative systemer

**Håndtering av faggrupper:**
- Lærer kan opprette/redigere faggrupper
- Koble elever til faggrupper
- En elev kan være i flere faggrupper (nivådeling, valgfag)

---

### 3.3 Vurderingsregistrering
**Prioritet: Høy (MVP)**

**Grunnleggende registrering:**

**Obligatoriske felt:**
- Dato for vurdering
- Fag
- Vurderingstype (Halvårsvurdering med karakter / Standpunkt / Underveisvurdering)
- Vurderingsform (Skriftlig / Muntlig / Muntlig-praktisk / Praktisk)
- Karakter (1-6) eller "Ikke vurdert"

**Valgfrie felt:**
- Tilbakemelding til elev (fritekst) - VALGFRITT
- Kompetansemål (se 3.4)
- Beskrivelse/navn på vurderingen (f.eks. "Prøve i 2. verdenskrig")
- Intern merknad (kun synlig for lærer, ikke elev/foresatt)
- Vekting (hvis lærer vil markere viktige vurderinger)

**AI-assistert kompetansemålforslag:**
- Når lærer skriver beskrivelse/tema → systemet foreslår relevante kompetansemål
- Lærer kan huke av/på foreslåtte mål
- Basert på nøkkelord, vurderingsform og fagkontekst
- Lærer kan alltid manuelt søke og legge til kompetansemål

**Brukeropplevelse:**

**1. Enkel registrering (individuell):**
```
Registrer vurdering - Emma Hansen
═════════════════════════════════

Dato: [15.01.2026]
Vurderingstype: [Underveisvurdering ▼]
Vurderingsform: [Skriftlig ▼]
Karakter: [4 ▼]

Beskrivelse (valgfritt): [Prøve i likninger]
→ AI foreslår: Mål 2, 3, 5 [Velg alle ☐]

Tilbakemelding (valgfritt): [Fritekst]
Intern merknad (valgfritt): [Fritekst]

[Lagre som kladd] [Lagre og publiser]
```

**2. Bulk-registrering (hele klassen):**
```
Bulk-registrering - Matematikk 10A
══════════════════════════════════

FELLES FOR ALLE:
├─ Dato: [15.01.2026]
├─ Beskrivelse: [Prøve i likninger] (valgfritt)
├─ Vurderingsform: [Skriftlig ▼]
└─ Kompetansemål: [Mål 2, 3, 5] (valgfritt)

INDIVIDUELT PER ELEV:
┌─────────────────────────────────────────
│ Emma Hansen
│ ├─ Karakter: [4 ▼]
│ └─ Tilbakemelding: [valgfritt]
│
│ Oliver Andersen
│ ├─ Karakter: [5 ▼]
│ └─ Tilbakemelding: [valgfritt]
│
│ Noah Pettersen
│ ├─ Karakter: [3 ▼]
│ └─ Tilbakemelding: [valgfritt]
│
│ [... 21 elever til]
└─────────────────────────────────────────

Fremdrift: 3/24 elever ferdig

[Lagre alle som kladd] [Publiser ferdigstilte]
```

**3. Rask registrering på mobil:**
- Forenklet grensesnitt
- Swipe for neste elev
- Offline-støtte (synkroniserer når tilbake på nett)

**Kladd/publisert-funksjon:**
- Standard: Vurdering lagres som kladd
- Lærer må aktivt publisere → da blir den synlig for foresatte
- Alle vurderinger (publiserte og kladd) teller i oversikt/advarsler

**Historikk og sporbarhet:**
- Full endringslogg (hvem, hva, når)
- Ved endring av karakter: obligatorisk årsaksangivelse
- Vurderinger kan ikke slettes, kun deaktiveres/arkiveres

---

### 3.4 Kompetansemål
**Prioritet: Høy (MVP)**

**Kompetansemål-database:**
- Ferdig struktur med alle kompetansemål fra LK20
- Organisert etter: Fag → Årstrinn → Kompetanseområde → Kompetansemål
- Søkefunksjon: Søk etter nøkkelord i kompetansemåltekst

**Kobling til vurderinger:**
- Lærer kan koble flere kompetansemål til én vurdering
- AI foreslår relevante mål basert på tema/beskrivelse
- Valgfritt, men kraftig "nudging" (advarsler hvis mange vurderinger mangler kobling)

**Vedlikehold:**
- Automatisk oppdatering ved læreplanendringer (abonnement på Udirs endringer)
- Varsling til admin ved nye/endrede læreplaner

---

### 3.5 Lærerens oversikt (hovedfunksjon)
**Prioritet: Høy (MVP)**

**Dashboard per faggruppe:**

**Visningsmodus 1: Elevcentrisk**
```
Matematikk 10A - Oversikt per elev
═══════════════════════════════════

[Tab: Elevcentrisk] [Tab: Kompetansemålcentrisk] [Tab: Prioriteringsliste]

[Filter: Alle | Kun risiko | Mangler vurdering]

Emma Hansen                    Status: ⚠️ RISIKO
├─ Vurderinger: 3 (Skriftlig: 1, Muntlig: 2)
├─ Problem: Minimum 2 skriftlige påkrevd
├─ Kompetansemål: 8/12 dekket (8.-10. trinn)
├─ Halvårsvurdering: - (ikke registrert)
└─ [Vis detaljer] [Legg til vurdering] [Sjekkliste]

Oliver Andersen                Status: ✓ OK
├─ Vurderinger: 8 (Skriftlig: 5, Muntlig: 2, Praktisk: 1)
├─ Kompetansemål: 12/12 dekket
├─ Halvårsvurdering: - (ikke registrert)
└─ [Vis detaljer]
```

**Visningsmodus 2: Kompetansemålcentrisk**
```
Matematikk 10A - Kompetansemåldekning
═══════════════════════════════════════

[Tab: Elevcentrisk] [Tab: Kompetansemålcentrisk] [Tab: Prioriteringsliste]

Kompetanseområde: Tall og algebra
├─ [✓] Mål 1: "Utforske og beskrive..." 
│   └─ Vurdert: 24/24 elever (Skriftlig: 22, Muntlig: 2)
├─ [!] Mål 2: "Tolke, bearbeide..." 
│   └─ Vurdert: 18/24 elever ⚠️ (6 elever mangler)
└─ [✗] Mål 3: "Representere..." 
    └─ Ikke vurdert ⚠️⚠️

[Vis hvilke elever som mangler]
```

**Visningsmodus 3: Prioriteringsliste (NY)**
```
Matematikk 10A - Prioriteringsliste
════════════════════════════════════

[Tab: Elevcentrisk] [Tab: Kompetansemålcentrisk] [Tab: Prioriteringsliste]

Denne listen viser hvilke elever som er klar for standpunkt,
og hvem som trenger mest arbeid.

KLAR FOR STANDPUNKT (3 elever) ✓
├─ Oliver Andersen
│   ├─ 12/12 kompetansemål dekket
│   ├─ 8 vurderinger (varierte former)
│   └─ Sist vurdert: For 1 uke siden
│
├─ Sophia Hansen
│   ├─ 12/12 kompetansemål dekket
│   ├─ 9 vurderinger (varierte former)
│   └─ Sist vurdert: For 2 uker siden
│
└─ Liam Berg
    ├─ 11/12 kompetansemål dekket
    ├─ 7 vurderinger (varierte former)
    └─ Sist vurdert: For 3 uker siden

NESTEN KLAR (15 elever) 🟡
├─ Emma Hansen
│   ├─ 8/12 kompetansemål dekket (67%)
│   ├─ 6 vurderinger (mangler muntlig)
│   ├─ Sist vurdert: For 2 uker siden
│   └─ Anbefaling: 1-2 muntlige vurderinger i mål 3, 7, 9, 11
│       [Planlegg vurdering]
│
├─ Noah Pettersen
│   ├─ 9/12 kompetansemål dekket (75%)
│   ├─ 5 vurderinger (varierte former)
│   ├─ Sist vurdert: For 1 måned siden
│   └─ Anbefaling: Oppdater med ny vurdering, dekk mål 4, 8, 10
│       [Planlegg vurdering]
│
└─ [... 13 elever til]

TRENGER MYE ARBEID (6 elever) 🔴
├─ Isabella Olsen
│   ├─ 4/12 kompetansemål dekket (33%)
│   ├─ 3 vurderinger (kun skriftlig)
│   ├─ Sist vurdert: For 3 måneder siden
│   └─ Anbefaling: Flere vurderinger + varierte former + dekk 8 mål
│       [Planlegg vurdering] [Sjekkliste]
│
└─ [... 5 elever til]

[Planlegg vurderinger for "nesten klar"-gruppen]
[Eksporter liste]
```

**Statistikk-widget:**
```
Klassen totalt:
├─ Gjennomsnittlig antall vurderinger: 6,2
├─ Elever med <2 skriftlige: 3 (12%) ⚠️
├─ Kompetansemåldekning: 85% (10/12 mål)
├─ Halvårsvurdering registrert: 0/24 elever
└─ Risiko for klage: Middels ⚠️
```

**Filtreringsmuligheter:**
- Vis kun elever med risiko
- Vis kun elever med <X vurderinger
- Vis kun ikke-publiserte vurderinger
- Tidsperiode (inneværende år / hele ungdomsskolen)

---

### 3.6 Advarselsystem (proaktiv kvalitetssikring)
**Prioritet: Høy (MVP)**

**Advarsler på elevnivå:**
- 🔴 "Emma har kun 1 skriftlig vurdering - minimum 2 påkrevd"
- 🟡 "Oliver har kun skriftlige vurderinger - vurder varierte vurderingsformer"
- 🔴 "Noah mangler vurdering i 4 kompetansemål (8.-10. trinn)"
- 🟡 "Sophia har ikke fått vurdering på 4 måneder"

**Advarsler på klassenivå:**
- 🟡 "12 elever ikke vurdert i kompetansemål: 'Representere...'"
- 🔴 "Standpunkt om 2 uker - 3 elever mangler vurderingsgrunnlag"
- 🟡 "Du har ikke koblet kompetansemål til de siste 5 vurderingene"

**Advarselssystem (ikke push-varsler, men UI-indikatorer):**
- Rød/gul/grønn statusindikator per elev
- Samlet "helsescore" per faggruppe
- Advarsler vises direkte i oversikten (ikke separat varslingsfunksjon)

**Advarsler justeres automatisk for elever med fritak (se 3.15)**

**VIKTIG:** Halvårsvurdering genererer IKKE advarsler i MVP (se 3.12)

---

### 3.7 Pre-flight check før standpunkt
**Prioritet: Høy (MVP)**

**Automatisk kvalitetssjekk når lærer skal sette standpunkt:**

```
Kvalitetssjekk - Matematikk 10A
══════════════════════════════════════

✓ Alle elever har minimum 2 skriftlige vurderinger
⚠️ 3 elever mangler vurdering i "Geometri"
⚠️ 2 elever har kun skriftlige vurderinger
✓ Ingen elever med varslingsbehov om IV
⚠️ 5 vurderinger ikke koblet til kompetansemål
✓ Fritaksdokumentasjon gyldig for alle relevante elever
ℹ️ Halvårsvurdering ikke registrert i systemet (håndteres i Vigilo)

Anbefaling: Vurder å legge til vurderinger for å styrke 
grunnlaget før standpunkt settes.

[Fortsett med standpunkt] [Se detaljer] [Avbryt]
```

**Dersom kritiske feil:**
- Blokkering: "Du kan ikke sette standpunkt før kritiske feil er rettet"
- Kritiske feil: Elev med <2 skriftlige

---

### 3.8 Standpunktvurdering
**Prioritet: Høy (MVP)**

**Standpunktregistrering:**
- Egen flow: "Sett standpunkt for Matematikk 10A"
- Viser oversikt over alle vurderinger for hver elev
- Viser kompetansemåldekning
- Viser kompetansemålprofil (nivå per mål, se 3.13)
- Kjører pre-flight check automatisk
- Lærer setter standpunktkarakter
- Obligatorisk intern begrunnelse (ikke synlig for elev/foresatt)
- Markering av hvilke vurderinger som vektlegges mest (valgfritt)

**Standpunktvisning:**
- Klart skilt fra underveisvurderinger og halvårsvurdering
- Synlig for foresatte når publisert
- Kan ikke endres etter publisering uten årsak

---

### 3.9 Klage-eksport (dokumentasjon)
**Prioritet: Høy (MVP)**

**"Generer elevmappe for statsforvalter":**

Knapp på elevnivå: `[Eksporter komplett dokumentasjon]`

**PDF-innhold:**
```
ELEVMAPPE - [Elevnavn] - [Fag] - [Skoleår]
═══════════════════════════════════════════

1. OVERSIKT
   - Standpunktkarakter: [X]
   - Totalt antall vurderinger: [X]
   - Fordeling: Skriftlig [X], Muntlig [X], Praktisk [X]
   - Halvårsvurdering: [Kan fylles inn manuelt hvis ikke importert]

2. FRITAK OG SPESIELL DOKUMENTASJON (hvis relevant)
   [Se 3.15 for detaljer]
   
3. KOMPETANSEMÅLDEKNING (8.-10. trinn)
   ✓ Tall og algebra: 5/5 mål vurdert
   ✓ Geometri: 3/3 mål vurdert
   ✓ Statistikk: 2/2 mål vurdert

4. KOMPETANSEMÅLBASERTE TILBAKEMELDINGER (hvis aktivert)
   [Se 3.14 - kun for statsforvalter]
   
   Kompetansemål 1.1: "Utforske og beskrive..."
   Samlet nivå: M (Middels)
   
   [AI-generert tilbakemelding]
   
   Grunnlag:
   - 15.03.2025 | Skriftlig | 3 | "Emma viser..."
   - 20.09.2025 | Muntlig | 4 | "God fremgang..."

5. ALLE VURDERINGER (kronologisk)
   
   [Dato] | [Type] | [Karakter] | [Kompetansemål]
   -----------------------------------------------
   15.01.25 | Skriftlig prøve | 4 | Mål 1, 2, 3
   Tilbakemelding: [...]
   Kompetansemål dekket: [...]
   Registrert av: [Lærernavn]
   
   [osv for alle vurderinger...]

6. VARSLINGER
   [Hvis varslet om IV i Vigilo: dato, årsak - må importeres manuelt]

7. SAMLET STANDPUNKTBEGRUNNELSE
   [Intern begrunnelse fra lærer]

8. METADATA
   - Rapport generert: [dato/tid]
   - Generert av: [lærernavn]
```

**Eksportalternativer:**
- Én elev: "Elevmappe for Emma Hansen"
- Hele klassen: "Zip-fil med alle elevmapper for Matematikk 10A"

---

### 3.10 Foresatt-portal
**Prioritet: Høy (MVP)**

**Tilgang og autentisering:**
- Innlogging via Feide eller BankID
- Automatisk kobling til barn basert på fødselsnummer
- Kan kun se egne barn

**Visning (kun lesing, ingen kommunikasjon):**
- Oversikt over alle **publiserte** vurderinger
- Visningstabel:
  ```
  Matematikk - Emma Hansen
  ═════════════════════════
  
  Dato       Type                    Karakter  Tilbakemelding
  ────────────────────────────────────────────────────────────
  22.01.26   Muntlig presentasjon    5         Meget god...
  15.01.25   Skriftlig prøve         4         Emma mestrer...
  
  Halvårsvurdering: Ikke registrert
  Standpunkt: Ikke satt ennå
  ```
- Sortering: Kronologisk (nyeste først)
- Filtrering: Per fag
- **Kompetansemålprofil**: Se 3.13 (uten lærernotater)
- Ingen mulighet til å se kladd-vurderinger
- Ingen mulighet til å se AI-genererte kompetansemålbaserte tilbakemeldinger (se 3.14)
- Ingen kommunikasjonsfunksjon (ingen meldinger/kommentarer)

**Personvern:**
- Logging av hvem som så hva, når (GDPR-krav)
- Kun foresatte med foreldreansvar får tilgang
- Mulighet for skole å midlertidig deaktivere innsyn (samlivsbrudd, omsorgssaker)

---

### 3.11 Skoleledelse-dashboard
**Prioritet: Middels (MVP - forenklet versjon)**

**Oversikt på skolenivå:**

```
Skoleoversikt - Vurderingsstatus
════════════════════════════════

Fag med risiko:
├─ Matematikk 10A (Lærer: Hansen) - 3 elever uten grunnlag ⚠️
├─ Engelsk 9B (Lærer: Olsen) - Lav vurderingsfrekvens ⚠️
└─ Naturfag 8C (Lærer: Berg) - OK ✓

Halvårsvurdering (snitt):
ℹ️ Halvårsvurdering registreres i Vigilo (ikke i dette systemet)

Fritaksdokumentasjon:
├─ Utløper innen 1 måned: 3 elever ⚠️
├─ Utløpte uten fornyelse: 1 elev 🔴
└─ Alt i orden: 8 elever ✓

Statistikk:
├─ Totalt antall elever: 324
├─ Elever med risiko: 18 (5.6%)
└─ Kompetansemåldekning (snitt): 82%

[Vis lærerstatistikk] [Vis detaljert rapport]
```

**Tilgang:**
- Rektor og ledelse kan se alle faggrupper
- Kun lesetilgang (ikke redigere vurderinger)
- Tilgang til lærerstatistikk (se 3.19)
- Tilgang til klagebehandlingsverktøy (se 3.20)

---

### 3.12 Halvårsvurdering med karakter
**Prioritet: Høy (MVP)**

### Konsept
Fra 8. trinn skal halvårsvurdering i fag suppleres med karakterer. Halvårsvurdering er en obligatorisk del av underveisvurderingen som skal gi eleven informasjon om hvor de er i sin læring midt i opplæringsperioden.

### MVP-tilnærming: Alternativ C ("Lazy loading")

**Halvårsvurdering registreres primært i Vigilo, ikke i dette systemet.**

**I dette systemet:**
```
Halvårsvurdering - Registrering (valgfritt)
═══════════════════════════════════════════

Dette systemet er primært et oversiktsverktøy. 
Halvårsvurdering registreres normalt i Vigilo.

ALTERNATIV A (FREMTIDIG): Automatisk import fra Vigilo
└─ Halvårsvurdering synkroniseres automatisk
└─ Ingen dobbeltarbeid
└─ Status: Planlagt i Fase 2

ALTERNATIV B: Manuell registrering her også
└─ Lærer registrerer i både Vigilo OG dette systemet
└─ Dobbeltarbeid, men sikrer komplett dokumentasjon
└─ [Registrer halvårsvurdering]

ALTERNATIV C (ANBEFALT FOR MVP): Lazy loading
└─ Felt står tomt, fylles kun ved behov
└─ Kan fylles inn manuelt ved klagesak
└─ Ingen advarsler om manglende halvårsvurdering
└─ [Registrer halvårsvurdering]

ℹ️ Hvis du velger å registrere halvårsvurdering her,
   brukes samme skjema som andre vurderinger.
```

### Registrering (hvis lærer velger dette)

**Obligatoriske felt:**
- Dato
- Karakter (1-6)
- Vurderingstype: "Halvårsvurdering med karakter"

**Valgfrie felt:**
- Tilbakemelding
- Kompetansemål (kan kobles, men mindre viktig enn ved standpunkt)
- Intern merknad

### Visning i oversikt

**I lærerens dashboard:**
```
Emma Hansen - Vurderingsoversikt
═════════════════════════════════

Halvårsvurderinger:
├─ Høst 2025: Ikke registrert i systemet
│   ℹ️ Registreres i Vigilo
│   [Importer/registrer manuelt]
└─ Vår 2026: Ikke registrert

Underveisvurderinger: 8 totalt
Standpunkt: Ikke satt
```

**I foresatt-portal:**
```
Matematikk - Emma Hansen
═════════════════════════

HALVÅRSVURDERINGER
─────────────────────────────────────────
ℹ️ Halvårsvurdering registreres i Vigilo
   Kontakt skolen for innsyn

ØVRIGE VURDERINGER
─────────────────────────────────────────
22.01.26 | Muntlig pres. | 5 | Meget god...
[...]
```

### Integrasjon med kompetansemålprofil

**Hvis halvårsvurdering registreres i systemet:**
- Teller i kompetansemålprofil hvis koblet til kompetansemål
- Vises i vurderingshistorikk per kompetansemål

**Hvis halvårsvurdering IKKE registreres:**
- Påvirker ikke kompetansemålprofil
- Kan importeres manuelt ved klagesak

### Klage-eksport

**PDF inneholder:**
```
1. OVERSIKT
   - Standpunktkarakter: [X]
   - Halvårsvurdering: [Felt for manuell utfylling] ← VIKTIG
     └─ Høst: [____]
     └─ Vår: [____]
```

**Instruksjon til skoleledelse ved klagesak:**
```
Ved klagebehandling:
1. Hent halvårsvurdering fra Vigilo
2. Fyll inn manuelt i PDF før innsending
ELLER
3. Importer halvårsvurdering til systemet først
4. Generer PDF på nytt
```

### INGEN advarsler om manglende halvårsvurdering i MVP

**Pre-flight check:**
```
✓ Alle elever har minimum 2 skriftlige vurderinger
⚠️ 3 elever mangler vurdering i "Geometri"
ℹ️ Halvårsvurdering ikke registrert i systemet (håndteres i Vigilo)
  [Importer halvårsvurdering] [Ignorer]
```

### Fremtidig (Fase 2): Automatisk synkronisering med Vigilo

**Planlagt funksjonalitet:**
- API-integrasjon med Vigilo
- Automatisk import av halvårsvurdering
- Synkronisering begge veier
- Ingen dobbeltarbeid

---

### 3.13 Kompetansemålbasert elevprofil
**Prioritet: Høy (MVP)**

### Konsept
En samlet oversikt per elev som viser elevens kompetansenivå på hvert enkelt kompetansemål, basert på alle vurderinger gjennom 8.-10. trinn.

### Visning: Kompetanseprofil per elev

**Hovedvisning:**
```
Emma Hansen - Matematikk (8.-10. trinn)
═══════════════════════════════════════

Kompetanseområde: Tall og algebra
├─ [●●●●○○] Mål 1: "Utforske og beskrive..."  
│   Nivå: M (Middels)
│   Basert på: 4 vurderinger
│   [Klikk for detaljer ↓]
│
├─ [●●●●●○] Mål 2: "Tolke, bearbeide..."
│   Nivå: H (Høy)
│   Basert på: 3 vurderinger
│   [Klikk for detaljer ↓]
│
└─ [●●○○○○] Mål 3: "Representere..."
    Nivå: L (Lav)
    Basert på: 2 vurderinger
    [Klikk for detaljer ↓]

Kompetanseområde: Geometri
├─ [Ikke vurdert] Mål 1: "Utforske..."  ⚠️
└─ [●●●○○○] Mål 2: "Beregne..."
    Nivå: L-M
    Basert på: 1 vurdering
```

### Nivåsetting

**To alternative systemer (skoleeier/lærer velger):**

**Alternativ 1: L-M-H (Low-Medium-High)**
- **L (Lav)**: Eleven viser grunnleggende kompetanse
- **M (Middels)**: Eleven viser god kompetanse
- **H (Høy)**: Eleven viser meget god/avansert kompetanse

**Alternativ 2: 1-6 skala**
- Samme skala som standpunktkarakterer
- Mer granulert, men kan oppleves som mer "karakter-fokusert"

**Hvordan nivået bestemmes:**

**Automatisk forslag:**
- Systemet beregner gjennomsnittsnivå basert på alle vurderinger knyttet til dette kompetansemålet
- Eksempel: Hvis mål har fått karakterer 3, 4, 5, 4 → foreslår "M" eller "4"
- Nyere vurderinger kan vektes høyere (valgfritt)

**Lærer kan overstyre:**
- Lærer kan manuelt justere nivået basert på faglig skjønn
- Obligatorisk kommentarfelt ved manuell justering: "Hvorfor endret du fra automatisk forslag?"
- Eksempel: "Eleven hadde 3 i starten, men viser nå klar fremgang mot 5"

### Detaljvisning per kompetansemål

**Når lærer klikker på et kompetansemål:**

```
Emma Hansen - Kompetansemål: "Utforske og beskrive..."
═════════════════════════════════════════════════════

Samlet nivå: M (Middels)
Automatisk forslag: M  |  Manuelt satt av lærer: -

Vurderingshistorikk (4 vurderinger):
┌─────────────────────────────────────────────────────
│ 28.01.2026 | 10. trinn | Praktisk oppg. | Karakter: 5
│ Tilbakemelding: "Utmerket! Emma viser dyp..."
│ Lærer: Hansen
├─────────────────────────────────────────────────────
│ 20.09.2025 | 9. trinn | Muntlig pres. | Karakter: 4
│ Tilbakemelding: "God fremgang! Emma forklarer..."
│ Lærer: Hansen
├─────────────────────────────────────────────────────
│ 15.03.2025 | 8. trinn | Skriftlig prøve | Karakter: 3
│ Tilbakemelding: "Emma viser grunnleggende forståelse..."
│ Lærer: Hansen
├─────────────────────────────────────────────────────
│ 15.01.2025 | 8. trinn | Muntlig | Karakter: 3
│ Tilbakemelding: "Emma er på rett vei..."
│ Lærer: Hansen
└─────────────────────────────────────────────────────

Utviklingsgraf:
Karakter
6 │                              ●
5 │                         ●    
4 │    ●         ●               
3 │         ●                    
2 │                              
1 │                              
  └─────────────────────────────► Tid
    8.trinn   9.trinn  10.trinn

Lærernotat (internt, ikke synlig for elev/foresatt):
[Fritekstfelt for lærer]
"Emma hadde en tung start, men viser nå veldig god utvikling..."

[Juster samlet nivå manuelt] [Tilbake til oversikt]
```

### Integrasjon med eksisterende funksjoner

**I lærerens dashboard:**
```
Emma Hansen - Hovedoversikt
═══════════════════════════

Status: ⚠️ RISIKO (mangler 2 skriftlige)

[Tab: Vurderingsoversikt] [Tab: Kompetanseprofil] ← NY

Kompetanseprofil (snitt alle fag):
├─ Matematikk: 9/12 mål vurdert (gjennomsnitt: M)
├─ Norsk: 11/14 mål vurdert (gjennomsnitt: M-H)
└─ Engelsk: 7/10 mål vurdert (gjennomsnitt: L-M) ⚠️
```

**I foresatt-portalen:**
```
Emma Hansen - Matematikk
═════════════════════════

[Tab: Vurderinger] [Tab: Kompetanseprofil] ← NY

Kompetanseprofil:
Oversikt over Emmas kompetanse på hvert kompetansemål

[Samme visning som lærer ser, men uten lærernotater]
[Kun publiserte vurderinger vises i detaljvisning]
```

### Bruksområder

**For lærer:**
1. **Bedre grunnlag for standpunkt**: Se samlet bilde av kompetanse per mål
2. **Identifisere svakhetsområder**: Hvilke kompetansemål sliter eleven med?
3. **Følge utvikling over tid**: Viser eleven fremgang?
4. **Målrettet undervisning**: "Emma trenger mer jobbing med Mål 3"

**For foresatte:**
1. **Forståelse av hva barnet mestrer**: Mer enn bare karakterer
2. **Se utvikling**: Barnet hadde 3, nå har det 5 - fin fremgang!
3. **Dialog med lærer**: "Jeg ser Emma sliter med geometri - hva kan vi gjøre hjemme?"

### Tekniske detaljer

**Beregning av samlet nivå (L-M-H):**
```
Algoritme:
- Hent alle vurderinger knyttet til kompetansemålet
- Konverter karakterer til poeng (1=1, 2=2, ..., 6=6)
- Beregn vektet gjennomsnitt:
  * Nyere vurderinger vektes høyere (valgfritt)
  * Vekting: 8. trinn (x1), 9. trinn (x1.5), 10. trinn (x2)
- Konverter til L-M-H:
  * 1-2 = L (Lav)
  * 3-4 = M (Middels)
  * 5-6 = H (Høy)
```

**Beregning av samlet nivå (1-6 skala):**
```
- Samme som over, men avrund til nærmeste hele tall
- Eksempel: 3.7 → 4
```

**Lagring:**
- Samlet nivå lagres som eget felt per elev per kompetansemål
- Både automatisk beregnet og manuelt justert nivå lagres
- Endringslogg hvis lærer overstyrer

### Advarsler og kvalitetssjekk

**Nye advarsler knyttet til kompetansemålprofil:**
- 🔴 "Emma har 3 kompetansemål som kun er vurdert én gang"
- 🟡 "Oliver viser negativ utvikling på Mål 2 (H → M → L)"
- 🟡 "4 elever har 'Lav' på samme kompetansemål - vurder ny undervisning"

**Pre-flight check oppdatert:**
```
✓ Alle kompetansemål vurdert minimum 2 ganger
⚠️ 2 kompetansemål kun vurdert én gang
✓ Samlet kompetanseprofil dekker alle områder
```

### UI/UX-hensyn

**Visuelle indikatorer:**
- **Grønt**: H (Høy) eller 5-6
- **Gult**: M (Middels) eller 3-4
- **Rødt**: L (Lav) eller 1-2
- **Grått**: Ikke vurdert

**Visualisering:**
- Stolpediagram/radargraf for å vise kompetanseprofil på tvers av mål
- Trendlinjer for å vise utvikling over tid
- Fargekoding for rask oversikt

---

### 3.14 AI-generert kompetansemålbasert tilbakemelding
**Prioritet: Middels (Fase 2 / v2)**

### Konsept
Automatisk generering av strukturerte, kompetansemålbaserte tilbakemeldinger som sammenfatter elevens prestasjon på tvers av vurderinger. Dette tilfredsstiller statsforvalters ønske om tydelig kobling mellom tilbakemeldinger og kompetansemål.

**VIKTIG**: Disse tilbakemeldingene er primært **dokumentasjon for statsforvalter ved klagesaker**, ikke nødvendigvis for løpende kommunikasjon med elev/foresatt.

### Hvordan det fungerer

**Input til AI:**
- Alle tilbakemeldinger lærer har gitt på vurderinger knyttet til et spesifikt kompetansemål
- Karakterer på disse vurderingene
- Kontekst: tema, vurderingsformer, tidspunkt
- Kompetansemålets ordlyd

**Output fra AI:**
Forslag til standardisert tilbakemelding per kompetansemål

### Eksempel på generert tilbakemelding

**Kompetansemål**: *"Utforske og beskrive sentrale trekk ved skriftspråkets oppbygning og reflektere over hvordan skriftspråk fungerer"*

**AI-generert utkast:**
```
Kompetansemål: Utforske og beskrive skriftspråkets oppbygning

I arbeid med dette kompetansemålet har Emma vist god kompetanse. 
I temaet "Argumenterende tekster" viste Emma solid forståelse 
for tekststruktur og argumentasjonsteknikker. Hun mestrer å 
identifisere og forklare grunnleggende språklige virkemidler. 
I muntlige presentasjoner viser Emma evne til å reflektere over 
hvordan ulike sjangere bruker språk forskjellig. 

Emma har utviklet seg godt gjennom året, fra grunnleggende til 
god kompetanse på dette området.

Basert på: 4 vurderinger (8.-10. trinn)
Samlet nivå: M-H (Middels til Høy)
```

### Synlighet og tilgangskontroll

**Kun synlig for:**
- ✓ Lærer (redigering og godkjenning)
- ✓ Skoleledelse (innsyn)
- ✓ Statsforvalter (ved klagesak, via eksport)

**IKKE synlig for:**
- ✗ Elev
- ✗ Foresatte

**Konfigurasjon (valgfritt):**
- Skole kan velge å også publisere til foresatt-portal
- Standard: Kun intern dokumentasjon

---

### 3.15 Fritak og spesiell dokumentasjon
**Prioritet: Høy (MVP)**

### Konsept
Håndtering av elever med fritak i spesifikke fag eller deler av fag, samt påminnelser om nødvendig dokumentasjon som må fornyes årlig.

### Fritaksregistrering

**Typer fritak:**
- **Helt fritak fra fag** (f.eks. fritak fra fremmedspråk)
- **Delvis fritak** (f.eks. fritak fra sidemål i norsk)
- **Fritak fra karakter** (f.eks. vurdering uten karakter)

**Registrering:**
```
Emma Hansen - Elevprofil
═══════════════════════

[Tab: Oversikt] [Tab: Vurderinger] [Tab: Fritak og dokumentasjon]

Aktive fritak:
├─ Norsk sidemål
│   ├─ Fritakstype: Delvis fritak (sidemål)
│   ├─ Årsak: Dysleksi
│   ├─ Gyldig fra: 15.08.2025
│   ├─ Gyldig til: 30.06.2026
│   ├─ Dokumentasjon: ✓ Søknad mottatt 10.08.2025
│   └─ Må fornyes: 🔔 Før 15.08.2026
│
└─ Engelsk muntlig
    ├─ Fritakstype: Delvis fritak (muntlige vurderinger)
    ├─ Årsak: Stamming
    ├─ Gyldig fra: 20.09.2025
    ├─ Gyldig til: 30.06.2026
    ├─ Dokumentasjon: ✓ Logopeduttalelse mottatt
    └─ Må fornyes: 🔔 Før 20.09.2026

[Legg til nytt fritak] [Last opp dokumentasjon]
```

**Obligatoriske felt ved fritaksregistrering:**
- Fag (og evt. delområde)
- Fritakstype
- Årsak (fritekst eller valg fra liste)
- Gyldig fra/til
- Dokumentasjon lastet opp (PDF/bilde)
- Krever årlig fornyelse? (Ja/Nei)

### Automatiske advarsler og varsler

**For lærer:**

**Scenario 1: Vurdering av elev med fritak**
```
Du er i ferd med å registrere vurdering i "Norsk sidemål" 
for Emma Hansen.

⚠️ Emma har fritak fra norsk sidemål (grunnet dysleksi)

Dette er kun en påminnelse. Du kan fortsette hvis vurderingen 
gjelder andre deler av faget.

[Fortsett likevel] [Avbryt]
```

**Scenario 2: Advarsler i oversikt fjernes for elever med fritak**
```
Norsk 10A - Elevcentrisk oversikt
═════════════════════════════════

Emma Hansen                    Status: ✓ OK (fritak sidemål)
├─ Vurderinger: 8 (Skriftlig: 5, Muntlig: 3)
├─ Kompetansemål: 8/10 dekket (10/10 ekskl. sidemål) ✓
├─ ℹ️ Fritak: Norsk sidemål (dysleksi)
└─ [Vis detaljer]

Oliver Andersen                Status: ⚠️ RISIKO
├─ Vurderinger: 3 (Skriftlig: 1, Muntlig: 2)
├─ Problem: Minimum 2 skriftlige påkrevd
└─ [Vis detaljer]
```

**Scenario 3: Varsel om fornyelse av dokumentasjon**
Vises i "Mine oppgaver" (se 3.18):
```
🔔 Dokumentasjon må fornyes (3)

├─ Emma Hansen - Norsk sidemål
│   Fritak utløper om 2 måneder (30.06.2026)
│   Ny søknad må innhentes
│   [Send påminnelse til foresatt] [Merk som håndtert]
│
├─ Oliver Berg - Engelsk muntlig
│   Fritak utløper om 1 måned (15.05.2026)
│   Ny logopeduttalelse må innhentes
│   [Send påminnelse til foresatt] [Merk som håndtert]
│
└─ Sophia Olsen - Matematikk (hele faget)
    ⚠️ Fritak utløpte for 2 uker siden! (15.01.2026)
    Dokumentasjon mangler
    [Kontakt foresatt umiddelbart] [Merk som håndtert]
```

### Påvirkning på advarsler og kvalitetssjekk

**Advarsler justeres automatisk:**

**FØR fritak registrert:**
```
🔴 Emma har kun vurdert 8/12 kompetansemål i norsk
🔴 Emma mangler vurdering i sidemål (0 vurderinger)
```

**ETTER fritak registrert:**
```
✓ Emma har vurdert alle obligatoriske kompetansemål (8/10)
ℹ️ 2 kompetansemål ikke vurdert (fritak sidemål)
```

**Pre-flight check før standpunkt:**
```
Kvalitetssjekk - Norsk 10A
══════════════════════════════════════

✓ 23 elever har minimum 2 skriftlige vurderinger
ℹ️ Emma Hansen har fritak fra sidemål (ikke medregnet)
✓ Alle obligatoriske kompetansemål vurdert
✓ Dokumentasjon for fritak er gyldig

[Fortsett med standpunkt]
```

### Eksport ved klagesak

**Inkludert i PDF til statsforvalter:**
```
ELEVMAPPE - Emma Hansen - Norsk
═══════════════════════════════

1. OVERSIKT
   Standpunktkarakter: 4
   
2. FRITAK OG SPESIELL DOKUMENTASJON
   
   Fritak fra norsk sidemål
   ├─ Årsak: Dysleksi
   ├─ Periode: 15.08.2025 - 30.06.2026
   ├─ Søknad mottatt: 10.08.2025
   └─ Vedlegg: Søknad_Emma_Hansen_Sidemål_2025.pdf
   
3. KOMPETANSEMÅLDEKNING
   
   Hovedmål: 8/8 kompetansemål vurdert ✓
   Sidemål: Fritak (ikke vurdert)
   
4. ALLE VURDERINGER
   [osv...]
```

### Personvern

**GDPR-hensyn:**
- Fritaksårsak kan inneholde helseopplysninger (særlig kategori)
- Ekstra streng tilgangskontroll
- Logging av alle som ser fritaksinformasjon
- Kryptering av dokumenter
- Tydelig informasjon til foresatte om lagring

**Behandlingsgrunnlag:**
- Opplæringsloven kapittel 3 (vurdering)
- Forskrift til opplæringsloven om fritak
- GDPR artikkel 9 nr. 2 bokstav g (offentlig interesse)

---

### 3.16 Integrasjon: Fritak + Kompetansemålprofil
**Prioritet: Høy (MVP)**

### Hvordan fritak påvirker kompetansemålprofilen

**Emma Hansen - Kompetanseprofil (Norsk):**
```
Kompetanseområde: Hovedmål (bokmål)
├─ [●●●●○○] Mål 1: "Lese og forstå..."  
│   Nivå: M (Middels)
├─ [●●●●●○] Mål 2: "Skrive ulike tekster..."
│   Nivå: H (Høy)
└─ [●●●○○○] Mål 3: "Vurdere..."
    Nivå: L-M

Kompetanseområde: Sidemål (nynorsk)
├─ [FRITAK] Mål 1: "Lese og forstå..." 
│   ℹ️ Fritak grunnet dysleksi (gyldig til 30.06.2026)
├─ [FRITAK] Mål 2: "Skrive enkle tekster..."
│   ℹ️ Fritak grunnet dysleksi
└─ [FRITAK] Mål 3: "Gjenkjenne..."
    ℹ️ Fritak grunnet dysleksi
    
[Vis fritaksdokumentasjon]
```

**Statistikk justeres automatisk:**
```
Emma Hansen - Status
├─ Kompetansemåldekning: 8/8 obligatoriske mål ✓
├─ Totalt i faget: 8/11 mål (3 fritak)
└─ Fritaksdokumentasjon: ✓ Gyldig
```

---

### 3.17 "Hva mangler"-sjekkliste per elev
**Prioritet: Høy (MVP)**

### Konsept
En individuell, handlingsrettet sjekkliste for hver elev som viser nøyaktig hva som mangler før eleven er klar for standpunkt. Tilgjengelig for både faglærer og kontaktlærer.

### Tilgang
- **Faglærer**: Full tilgang til sjekkliste for egne fag
- **Kontaktlærer**: Kan se sjekklister på tvers av alle fag for sine elever
- **Tidsbasert visning**: Systemet viser sjekklisten automatisk X uker før standpunkt (konfigurerbart per skole)

### Visning

**Når lærer åpner elevprofil:**
```
Emma Hansen - Matematikk 10. trinn
═══════════════════════════════════

[Tab: Oversikt] [Tab: Vurderinger] [Tab: Kompetanseprofil] 
[Tab: Klar for standpunkt?] ← NY

══════════════════════════════════════════════
SJEKKLISTE - Klar for standpunkt?
══════════════════════════════════════════════

Standpunkt settes om: 4 uker (estimat: 15.06.2026)

STATUS: ⚠️ IKKE KLAR (3 kritiske mangler)

VURDERINGSGRUNNLAG
─────────────────────────────────────────────
✓ Minimum 2 skriftlige vurderinger (3 gitt)
⚠️ Kun skriftlige vurderinger - mangler varierte former
  → Anbefaling: Legg til muntlig eller praktisk vurdering

KOMPETANSEMÅLDEKNING
─────────────────────────────────────────────
⚠️ 8/12 kompetansemål vurdert (67%)
  → Mangler vurdering i:
    • Mål 3: "Representere matematiske sammenhenger..."
    • Mål 7: "Utforske og beskrive egenskaper..."
    • Mål 9: "Tolke og bruke formler..."
    • Mål 11: "Beregne og måle..."

✓ Alle vurderte mål har minimum 2 vurderinger

SIST VURDERT
─────────────────────────────────────────────
⚠️ Siste vurdering: 3 måneder siden (20.02.26)
  → Anbefaling: Gi ny vurdering før standpunkt

FRITAK
─────────────────────────────────────────────
✓ Ingen aktive fritak

HALVÅRSVURDERING
─────────────────────────────────────────────
ℹ️ Ikke registrert i systemet (håndteres i Vigilo)

ANBEFALTE TILTAK
─────────────────────────────────────────────
1. Legg til 1-2 vurderinger i manglende kompetansemål
2. Legg til muntlig eller praktisk vurdering
3. Gi ny vurdering før standpunkt (oppdater status)

[Planlegg vurdering] [Sett standpunkt likevel] [Lukk]
```

### Integrasjon med kontaktlærer

**Kontaktlærerens oversikt:**
```
Kontaktlærerside - Mine elever (9A)
════════════════════════════════════

[Filter: Alle fag | Kun ikke klar for standpunkt]

Emma Hansen
├─ Matematikk: ⚠️ Ikke klar (3 mangler)
├─ Norsk: ✓ Klar
├─ Engelsk: ✓ Klar
├─ Naturfag: ⚠️ Ikke klar (2 mangler)
└─ Samfunnsfag: ✓ Klar

Oliver Andersen
├─ Matematikk: ✓ Klar
├─ Norsk: 🔴 KRITISK (5 mangler)
├─ Engelsk: ⚠️ Ikke klar (1 mangel)
└─ [...]

[Vis detaljer] [Eksporter rapport] [Send oversikt til faglærere]
```

---

### 3.18 Lærerprofil / Min side
**Prioritet: Høy (MVP)**

### Konsept
Et eget område der lærer (og skoleledelse) ser oversikt over egne oppgaver, statistikk, og sammenligning med andre. Dette er adskilt fra hovedfunksjonen (faggruppe-oversikt) for å unngå "noise" i daglig arbeid.

### Struktur

```
Min profil - [Lærernavn]
════════════════════════

[Tab: Mine oppgaver] [Tab: Min statistikk] [Tab: Innstillinger]
```

### Tab 1: Mine oppgaver

**Konsept:**
En prioritert liste over ting som krever lærerens oppmerksomhet, sortert etter kritikalitet og tidsfrist.

```
MINE OPPGAVER
═════════════════════════════════════════════

🔴 HASTER (2)
─────────────────────────────────────────────
├─ Fritaksdokumentasjon Emma Hansen
│   Status: Utløpt for 2 uker siden!
│   Årsak: Norsk sidemål (dysleksi)
│   [Kontakt foresatt] [Marker som håndtert]
│
└─ Pre-flight check Matematikk 9B
    Standpunkt om 1 uke
    Status: 2 elever med kritiske mangler
    [Vis detaljer] [Planlegg vurdering]

🟡 SNART (5)
─────────────────────────────────────────────
├─ Standpunkt Norsk 10A
│   Estimat: om 2 uker (30.01.2026)
│   Status: 2 elever ikke klare
│   [Vis sjekklister] [Sett standpunkt]
│
├─ 5 upubliserte vurderinger (Engelsk 9A)
│   Registrert: 10.-15.01.2026
│   [Publiser alle] [Gjennomgå]
│
├─ Kompetansemålbaserte tilbakemeldinger (Matematikk 10A)
│   Status: 7/12 godkjent
│   [Gjennomgå utkast] (Fase 2)
│
├─ Fritaksdokumentasjon Oliver Berg
│   Utløper: om 1 måned (15.02.2026)
│   Årsak: Engelsk muntlig (stamming)
│   [Send påminnelse] [Marker som håndtert]
│
└─ "Hva mangler"-sjekkliste
    3 elever ikke klare for standpunkt
    [Vis detaljer]

🟢 SENERE (2)
─────────────────────────────────────────────
├─ Kompetansemåldekning Naturfag 8C
│   Status: 78% (anbefalt: >85%)
│   [Planlegg vurderinger]
│
└─ Karakterfordeling Matematikk 10A
    Info: Ingen elever med 1-2, verifiser
    [Vis statistikk]
```

### Tab 2: Min statistikk

```
MIN STATISTIKK
═════════════════════════════════════════════

KARAKTERFORDELING
─────────────────────────────────────────────

Matematikk 10A (dine karakterer)
6: ████████ 8 elever (33%)
5: ████████████ 12 elever (50%)
4: ████ 4 elever (17%)
3: 0 elever (0%)
2: 0 elever (0%)
1: 0 elever (0%)

Sammenligning med andre 10. trinn-lærere (anonymisert):
6: ███ 12% (snitt)
5: █████ 22%
4: ████████ 35%
3: ████ 18%
2: ██ 8%
1: █ 5%

⚠️ Du har ingen elever med 1-3. Dette er uvanlig.
   Er du sikker på at alle elever virkelig presterer så godt?
   
ℹ️ Dette er ikke nødvendigvis feil, men verifiser at 
   karakterene gjenspeiler faktisk kompetanse.

[Se detaljert analyse] [Sammenlign med 8. + 9. trinn]

VURDERINGSFREKVENS
─────────────────────────────────────────────

Matematikk 10A (deg):
├─ Gjennomsnitt per elev: 6.2 vurderinger
├─ Fordeling: Skriftlig 60%, Muntlig 30%, Praktisk 10%
└─ Siste vurdering: For 2 uker siden

Sammenligning 9. trinn (deg):
├─ Gjennomsnitt: 6.2 vurderinger
└─ Du er konsistent på tvers av klasser ✓

Sammenligning andre 10. trinn-lærere (anonymisert):
├─ Gjennomsnitt: 7.1 vurderinger
└─ ⚠️ Du ligger litt under snittet

KOMPETANSEMÅLDEKNING
─────────────────────────────────────────────

Matematikk 10A (deg):
├─ Gjennomsnittlig dekning per elev: 83%
├─ Alle mål vurdert for minst 18/24 elever ✓
└─ 2 mål vurdert for <18 elever ⚠️

Sammenligning 10. trinn (anonymisert):
├─ Gjennomsnitt: 87%
└─ Du ligger litt under snittet
```

**Anonymisering:**
- Lærer ser **aldri** navn på andre lærere
- Kun aggregert statistikk

---

### 3.19 Quick-actions ved klagesak
**Prioritet: Høy (MVP)**

### Konsept
Når en klage mottas, trenger skoleledelse å samle dokumentasjon RASKT og kvalitetssikre før innsending til statsforvalter. En dedikert "Klage-modus" sikrer at ingenting glemmes.

### Tilgang
- **Primært:** Skoleledelse (de håndterer klager)
- **Sekundært:** Faglærer (kan forberede dokumentasjon)

### Klage-modus: Hovedvisning

```
KLAGESAK - Emma Hansen - Matematikk 10. trinn
══════════════════════════════════════════════

Klage mottatt: 15.01.2026
Klagegrunn: "Manglende vurderingsgrunnlag"
Frist for svar: 29.01.2026 (13 dager gjenstår) ⚠️

══════════════════════════════════════════════
QUICK ACTIONS
══════════════════════════════════════════════

[1] SJEKK DOKUMENTASJON
────────────────────────────────────────────
    Automatisk kvalitetssjekk av alle krav
    
    ✓ Vurderingsgrunnlag: OK (6 vurderinger, varierte)
    ✓ Kompetansemåldekning: OK (12/12 mål)
    ⚠️ Halvårsvurdering: Mangler i systemet
    ✓ Fritak: Ikke relevant
    ⚠️ AI-tilbakemeldinger: 8/12 godkjent (valgfritt)
    
    [Se detaljer]

[2] IMPORTER HALVÅRSVURDERING
────────────────────────────────────────────
    Status: Ikke importert ⚠️
    
    [Importer fra Vigilo] [Fyll inn manuelt]

[3] GENERER KOMPETANSEMÅLBASERTE TILBAKEMELDINGER
────────────────────────────────────────────
    Status: 8/12 godkjent (Fase 2-funksjon)
    
    [Generer manglende (4 mål)] [Hopp over]

[4] GENERER ELEVMAPPE (PDF)
────────────────────────────────────────────
    Status: Klar ✓
    
    [Generer PDF] [Forhåndsvis]

[5] SEND TIL STATSFORVALTER
────────────────────────────────────────────
    Status: Ikke sendt
    
    [Last ned PDF] [Send til statsforvalter]

══════════════════════════════════════════════
TIDSBRUK-ESTIMAT: 10-15 minutter (hvis alt er OK)
══════════════════════════════════════════════
```

---

## 4. Ikke-funksjonelle krav

### 4.1 Sikkerhet og personvern
- **DPIA**: Må gjennomføres før lansering
- **GDPR-compliant**: Kryptering, logging, tilgangskontroll
- **Feide/BankID**: Påkrevd autentisering
- **Databehandleravtaler**: Med skytjenesteleverandør og AI-leverandør

### 4.2 Brukervennlighet
- **Intuitivt grensesnitt**: Minimal opplæring
- **Responsivt design**: PC, nettbrett, mobil
- **Rask registrering**: <30 sek individuell, 5-10 min bulk (24 elever)
- **WCAG 2.1 nivå AA**
- **Offline-modus** (mobil)

### 4.3 Ytelse
- Faggruppeoversikt: <2 sek
- Foresatt-portal: <3 sek
- PDF-generering: <10 sek
- Klage-modus kvalitetssjekk: <2 sek

### 4.4 Vedlikehold
- Automatisk oppdatering av kompetansemål
- Driftstid: minimum 99,5%
- Daglig backup (30 dagers oppbevaring)

### 4.5 Arkitektur-forberedelse
- Orden og Oppførsel (datamodell klar)
- Elev-portal/læringsmiljøplattform (smart prioritering)
- Varsling til foresatte (Fase 2)
- Vurderingskø/offline (Fase 2)

---

## 5. Implementering

### Fase 1: MVP (9-12 måneder)
- Alle kjernefunksjoner (3.1-3.13, 3.15-3.20)
- DPIA før lansering
- Pilot (2 måneder, 1-2 skoler)
- Fullskala utrulling (3-5 måneder)

### Fase 2: AI og integrasjoner (3-6 måneder)
- AI-tilbakemeldinger (3.14)
- Vigilo-integrasjon (halvårsvurdering)
- Vurderingskø/offline
- Varsling til foresatte
- PWA/mobilapp

### Fase 3: Videre utvikling
- Separat statistikk-app
- Elev-portal for selvevaluering
- Orden og Oppførsel-modul

---

## 6. Suksesskriterier

### Kortsiktig (6 måneder)
- ✅ 100% læreradopsjon
- ✅ 80%+ foresatte logget inn
- ✅ 10+ vurderinger per elev per semester
- ✅ <5% elever med risikostatus ved standpunkt
- ✅ 90%+ elever har kompetanseprofil

### Langsiktig (2 år)
- ✅ Ingen klager grunnet manglende vurderingsgrunnlag
- ✅ 95%+ kompetansemåldekning
- ✅ Positiv tilbakemelding fra statsforvalter

---

## 7. Vedlegg

### Ordliste
- **Kompetansemål**: Læringsmål fra LK20
- **Standpunkt**: Sluttvurdering med karakter
- **Halvårsvurdering**: Lovpålagt vurdering midt i perioden
- **IV**: Ikke Vurderingsgrunnlag
- **Fritak**: Elev fritatt fra deler av/hele fag
- **Pre-flight check**: Automatisk kvalitetssjekk
- **Bulk-registrering**: Registrere for flere elever samtidig
- **Quick-actions**: Hurtighandlinger for klagebehandling
- **Prioriteringsliste**: Oversikt over hvem som er klar for standpunkt

### Referanser
- Udir: https://www.udir.no/laring-og-trivsel/vurdering/
- LK20: https://www.udir.no/lk20/

---

**VERSJON 6.0 - ENDELIG DOKUMENT**
**Dato: 2026-02-03**
**Status: Klar for godkjenning**
