# DPIA - Vurderingsverktøy for Ungdomsskolen

**Data Protection Impact Assessment (Personvernkonsekvensvurdering)**

**Dato:** [Fyll inn]  
**Versjon:** 1.0  
**Ansvarlig:** [Navn, rolle]  
**Behandlingsansvarlig:** [Skoleeier/kommune]

---

## 1. Innledning

### 1.1 Formål med DPIA
Denne DPIA gjennomføres for å:
- Identifisere og vurdere personvernrisiko
- Dokumentere at personvern er ivaretatt
- Oppfylle krav i GDPR artikkel 35

### 1.2 Når er DPIA påkrevd?
✅ Automatisert behandling med rettslige konsekvenser (standpunktkarakterer)  
✅ Systematisk og omfattende profilering (kompetansemålprofiler)  
✅ Behandling av særlige kategorier personopplysninger (fritaksårsaker med helseopplysninger)

---

## 2. Beskrivelse av behandlingen

### 2.1 Hva er systemet?
Intelligent oversikts- og kvalitetssikringsverktøy for vurdering i ungdomsskolen (8.-10. trinn).

**Formål:**
- Gi lærere full oversikt over elevers vurderingsgrunnlag
- Sikre at alle kompetansemål dekkes
- Forhindre klager grunnet manglende vurderingsgrunnlag
- Dokumentere vurderinger ved klagesaker

### 2.2 Hvem er involvert?

| Rolle | Beskrivelse | Antall |
|-------|-------------|--------|
| Behandlingsansvarlig | [Skoleeier/kommune] | 1 |
| Databehandler | [Leverandør av systemet] | 1 |
| Underbehandler | Google Cloud (hosting), OpenAI (AI-forslag) | 2 |
| Registrerte | Elever (8.-10. trinn) | ~[X] |
| Brukere | Lærere, skoleledelse, foresatte | ~[X] |

### 2.3 Hvilke personopplysninger behandles?

| Kategori | Data | Mengde | Lagringstid |
|----------|------|--------|-------------|
| **Grunnleggende** | Navn, fødselsnummer, klasse | Alle elever | 3 år etter avgang |
| **Vurderingsdata** | Karakterer, tilbakemeldinger, kompetansemålprofil | Alle elever | 3 år etter avgang |
| **Fritaksdata** | Fritaksårsak (kan inneholde helseopplysninger) | Få elever | 3 år etter avgang |
| **Brukerdata** | Lærer/foresatt navn, e-post, rolle | Alle brukere | Til utmelding + 1 år |
| **Loggdata** | Hvem så hva, når | Alle handlinger | 1 år |

**Særlige kategorier (GDPR art. 9):**
- ⚠️ Fritaksårsaker kan inneholde helseopplysninger (f.eks. dysleksi, ADHD)
- Behandlingsgrunnlag: GDPR art. 9.2 bokstav g (nødvendig av hensyn til offentlig interesse)

### 2.4 Dataflyt

```
[Lærer] → [Systemet] → [Database (Google Cloud SQL)]
                    ↓
                [OpenAI API] (kun beskrivelsestekst, INGEN elevnavn)
                    ↓
                [Kompetansemålforslag]
                    
[Foresatt] → [Systemet] → [Kun publiserte vurderinger]
```

**Tredjepartsdelinger:**
- Google Cloud (hosting, database)
- OpenAI (AI-forslag, kun anonymisert beskrivelsestekst)
- INGEN deling med andre tjenester

---

## 3. Risikovurdering

### 3.1 Identifiserte risikoer

| # | Risiko | Sannsynlighet | Konsekvens | Total risiko |
|---|--------|---------------|------------|--------------|
| 1 | Uautorisert tilgang til elevdata | Middels | Høy | **Høy** |
| 2 | Lekkasje av fritaksårsaker (helseopplysninger) | Lav | Svært høy | **Høy** |
| 3 | Feil i AI-forslag påvirker vurdering | Middels | Middels | **Middels** |
| 4 | Utilsiktet deling av sensitive tilbakemeldinger | Lav | Middels | **Lav** |
| 5 | Datatap (database-feil) | Lav | Høy | **Middels** |
| 6 | Manglende sletting av data etter 3 år | Middels | Lav | **Lav** |

### 3.2 Risikoanalyse per kategori

#### Risiko 1: Uautorisert tilgang til elevdata

**Trussel:**
- Lærer får tilgang til elever de ikke underviser
- Foresatt får tilgang til andre elevers data
- Ekstern angriper får tilgang via svakheter

**Konsekvens:**
- Brudd på taushetsplikt
- Personvernbrudd (kan medføre gebyr)
- Tap av tillit

**Avbøtende tiltak:**
- ✅ Rollbasert tilgangskontroll (RBAC)
- ✅ Feide/BankID autentisering (to-faktor anbefalt)
- ✅ Logging av all tilgang (hvem så hva, når)
- ✅ Regelmessig sikkerhetstesting
- ✅ Kryptering av data i hvile og transit

**Restrisiko:** ✅ Akseptabel (Lav)

---

#### Risiko 2: Lekkasje av fritaksårsaker

**Trussel:**
- Fritaksårsak (f.eks. "dysleksi") eksponeres til uautoriserte
- Helseopplysninger lagres uten tilstrekkelig sikring

**Konsekvens:**
- Brudd på GDPR art. 9 (særlige kategorier)
- Stigmatisering av elev
- Alvorlig personvernbrudd

**Avbøtende tiltak:**
- ✅ Ekstra streng tilgangskontroll (kun lærer + ledelse)
- ✅ Kryptering av fritaksårsak i database
- ✅ Logging av all visning
- ✅ Varsling ved uvanlig tilgang
- ✅ Anonymisering av fritaksårsak i rapporter (hvor mulig)

**Restrisiko:** ✅ Akseptabel (Lav)

---

#### Risiko 3: Feil i AI-forslag påvirker vurdering

**Trussel:**
- AI foreslår feil kompetansemål
- Lærer stoler på AI uten å verifisere
- Standpunkt baseres på feil kompetansemål

**Konsekvens:**
- Elev kan klage (standpunkt ikke basert på riktige mål)
- Underminerer systemets troverdighet

**Avbøtende tiltak:**
- ✅ Lærer MÅ alltid godkjenne AI-forslag (ikke automatisk)
- ✅ Tydelig UI som viser at forslag er veiledende
- ✅ Mulighet for manuell valg av kompetansemål
- ✅ Fallback hvis AI feiler
- ✅ Ingen elevdata sendes til OpenAI (kun beskrivelsestekst)

**Restrisiko:** ✅ Akseptabel (Lav)

---

#### Risiko 4: Utilsiktet deling av sensitive tilbakemeldinger

**Trussel:**
- Lærer publiserer sensitiv tilbakemelding ved et uhell
- Foresatt ser intern merknad (bug)

**Konsekvens:**
- Brudd på taushetsplikt
- Ubehag for elev/foresatt

**Avbøtende tiltak:**
- ✅ Kladd/publiser-funksjon (standard: kladd)
- ✅ Intern merknad ALDRI synlig for foresatt (teknisk sperret)
- ✅ Tydelig UI som viser hva som er synlig
- ✅ Mulighet for å angre publisering

**Restrisiko:** ✅ Akseptabel (Lav)

---

#### Risiko 5: Datatap

**Trussel:**
- Database-feil/korrupsjon
- Feil i kode sletter data
- Cloud-leverandør mister data

**Konsekvens:**
- Tap av vurderingsdata
- Umulig å dokumentere standpunkt
- Klager kan ikke behandles

**Avbøtende tiltak:**
- ✅ Daglig backup (Google Cloud SQL)
- ✅ Point-in-time recovery (30 dager)
- ✅ Testing av backup/restore
- ✅ Soft delete (data kan gjenopprettes)

**Restrisiko:** ✅ Akseptabel (Lav)

---

#### Risiko 6: Manglende sletting etter 3 år

**Trussel:**
- Data lagres lenger enn nødvendig
- Brudd på lagringsminimering

**Konsekvens:**
- GDPR-brudd
- Unødvendig lagring av personopplysninger

**Avbøtende tiltak:**
- ✅ Automatisk anonymisering/sletting etter 3 år
- ✅ Årlig gjennomgang av lagret data
- ✅ Varsling ved utløp

**Restrisiko:** ✅ Akseptabel (Lav)

---

## 4. Juridisk grunnlag

### 4.1 Behandlingsgrunnlag (GDPR art. 6)

**Grunnleggende personopplysninger:**
- **GDPR art. 6.1 bokstav e:** Oppgave i allmennhetens interesse
- Hjemmel: Opplæringsloven § 3 (vurdering)

### 4.2 Behandlingsgrunnlag for særlige kategorier (GDPR art. 9)

**Fritaksårsaker med helseopplysninger:**
- **GDPR art. 9.2 bokstav g:** Nødvendig av hensyn til offentlig interesse (underveisvurdering, standpunkt)
- Hjemmel: Forskrift til opplæringsloven § 3-5 (fritak)

### 4.3 Rett til innsyn, retting, sletting

- ✅ Elev/foresatt kan kreve innsyn (via foresatt-portal)
- ✅ Elev/foresatt kan kreve retting (lærer kan redigere)
- ⚠️ Rett til sletting kan begrenses (nødvendig for å dokumentere klagerett)

---

## 5. Personvernprinsipper (GDPR art. 5)

| Prinsipp | Hvordan ivaretas |
|----------|------------------|
| **Lovlighet, rettferdighet, åpenhet** | Tydelig informasjon til elev/foresatt, lovlig grunnlag |
| **Formålsbegrensning** | Data brukes KUN til vurdering, ikke andre formål |
| **Dataminimering** | Kun nødvendige data samles inn |
| **Riktighet** | Lærer kan redigere, endringslogg |
| **Lagringsbegrensning** | Automatisk sletting etter 3 år |
| **Integritet og konfidensialitet** | Kryptering, tilgangskontroll, logging |
| **Ansvarlighet** | Denne DPIA dokumenterer etterlevelse |

---

## 6. Avbøtende tiltak (oppsummering)

### Tekniske tiltak

- ✅ **Kryptering:** TLS 1.3 (transit), AES-256 (hvile)
- ✅ **Autentisering:** Feide/BankID, to-faktor (anbefalt)
- ✅ **Tilgangskontroll:** RBAC, least privilege
- ✅ **Logging:** All tilgang logges (1 år oppbevaring)
- ✅ **Backup:** Daglig, 30 dagers oppbevaring
- ✅ **Sikkerhetstesting:** Penetrasjonstesting før lansering

### Organisatoriske tiltak

- ✅ **Databehandleravtale:** Med Google Cloud, OpenAI
- ✅ **Rutiner:** Årlig gjennomgang av lagringsperioder
- ✅ **Opplæring:** Lærere opplæres i personvern
- ✅ **Incident response:** Plan for håndtering av sikkerhetsbrudd
- ✅ **DPIA-oppdatering:** Ved vesentlige endringer

---

## 7. Konklusjon

### 7.1 Er risikoene akseptable?

✅ **JA** - Med de planlagte avbøtende tiltakene er alle identifiserte risikoer redusert til akseptabelt nivå.

### 7.2 Anbefaling

✅ **Behandlingen kan gjennomføres** forutsatt at:
1. Alle avbøtende tiltak implementeres
2. Databehandleravtaler signeres
3. Årlig gjennomgang av DPIA
4. Sikkerhetstesting før lansering

### 7.3 Oppfølging

| Tiltak | Ansvarlig | Frist |
|--------|-----------|-------|
| Signere databehandleravtaler | [Navn] | Før lansering |
| Gjennomføre sikkerhetstesting | [Navn] | Før lansering |
| Informere elev/foresatt | [Navn] | Ved lansering |
| Opplæring av lærere | [Navn] | Ved lansering |
| Årlig DPIA-gjennomgang | [Navn] | Årlig |

---

## 8. Godkjenning

**DPIA gjennomført av:**
- Navn: [Fyll inn]
- Rolle: [Fyll inn]
- Dato: [Fyll inn]

**DPIA godkjent av:**
- Navn: [Personvernombud/Daglig leder]
- Rolle: [Fyll inn]
- Dato: [Fyll inn]
- Signatur: __________________

---

## 9. Vedlegg

### A. Databehandleravtale (mal)
[Vedlegg separat dokument]

### B. Informasjon til elev/foresatt
[Vedlegg separat dokument]

### C. Incident response plan
[Vedlegg separat dokument]

---

**DPIA-versjon:** 1.0  
**Neste gjennomgang:** [Dato + 1 år]
