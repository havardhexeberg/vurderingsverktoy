# OpenAI Prompt Templates - Vurderingsverktøy

## 1. Kompetansemålforslag

**Bruk:** Foreslå relevante kompetansemål basert på vurderingsbeskrivelse

**API endpoint:** POST /api/ai/suggest-goals

**TypeScript implementering:**

```typescript
import OpenAI from 'openai';

interface CompetenceGoal {
  id: string;
  code: string;
  area: string;
  description: string;
}

async function suggestCompetenceGoals(
  description: string,
  form: 'WRITTEN' | 'ORAL' | 'ORAL_PRACTICAL' | 'PRACTICAL',
  subject: string,
  grade: number,
  availableGoals: CompetenceGoal[]
): Promise<string[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Format goals for AI
  const goalsContext = availableGoals
    .map((g) => `${g.code}: ${g.description} (${g.area})`)
    .join('\n');

  const prompt = `Du er en ekspert på norsk læreplan LK20 for ${subject}.

OPPGAVE:
Foreslå 3-5 mest relevante kompetansemål basert på følgende vurdering.

VURDERINGSINFORMASJON:
- Beskrivelse: "${description}"
- Vurderingsform: ${form}
- Årstrinn: ${grade}

TILGJENGELIGE KOMPETANSEMÅL:
${goalsContext}

INSTRUKSJONER:
1. Velg kompetansemål som best matcher vurderingsbeskrivelsen
2. Prioriter mål som direkte relaterer til innholdet
3. Inkluder mål fra ulike kompetanseområder hvis relevant
4. Returner BARE en JSON-array med kompetansemål-koder

EKSEMPEL OUTPUT:
["MAT-10-TA-01", "MAT-10-TA-03"]

OUTPUT (kun JSON):`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Du er en pedagogisk assistent som hjelper lærere med å koble vurderinger til kompetansemål i LK20. Svar alltid med valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Low temperature for consistent results
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Parse JSON response
    const suggestedCodes = JSON.parse(content) as string[];
    
    // Return only valid IDs
    return availableGoals
      .filter((g) => suggestedCodes.includes(g.code))
      .map((g) => g.id);
      
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback: Return goals from same area if description contains keywords
    const keywords = description.toLowerCase().split(/\s+/);
    return availableGoals
      .filter((g) => 
        keywords.some(kw => g.description.toLowerCase().includes(kw))
      )
      .slice(0, 3)
      .map((g) => g.id);
  }
}
```

---

## 2. Nøkkelordekstraksjon

**Bruk:** Forbedre kompetansemålforslag ved å ekstrahere fagord først

```typescript
async function extractKeywords(description: string): Promise<string[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Ekstrahér de 3-5 viktigste fagordene fra denne vurderingsbeskrivelsen:

"${description}"

Returner kun en JSON-array med fagord (norsk).

Eksempel: ["likninger", "algebra", "løsningsmetoder"]

OUTPUT (kun JSON):`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Du ekstraherer fagtermer fra matematikkoppgaver.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 100,
  });

  const content = response.choices[0]?.message?.content || '[]';
  return JSON.parse(content);
}
```

---

## 3. Validering av AI-forslag

**Bruk:** Sikre at AI-forslag er fornuftige

```typescript
function validateSuggestions(
  suggestions: string[],
  description: string,
  availableGoals: CompetenceGoal[]
): string[] {
  // 1. Sjekk at alle forslag er gyldige IDer
  const validIds = availableGoals.map(g => g.id);
  const validSuggestions = suggestions.filter(id => validIds.includes(id));

  // 2. Maks 5 forslag
  const limitedSuggestions = validSuggestions.slice(0, 5);

  // 3. Hvis ingen forslag, returner tomt array (lærer må velge manuelt)
  if (limitedSuggestions.length === 0) {
    console.warn('No valid suggestions from AI');
    return [];
  }

  return limitedSuggestions;
}
```

---

## 4. Error Handling

```typescript
// Wrapper med retry-logikk
async function suggestCompetenceGoalsWithRetry(
  ...args: Parameters<typeof suggestCompetenceGoals>
): Promise<string[]> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await suggestCompetenceGoals(...args);
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      // Vent litt før retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  console.error('All attempts failed:', lastError);
  
  // Fallback: Return empty array
  return [];
}
```

---

## 5. Caching

**Bruk:** Cache AI-forslag for å spare API-kall

```typescript
import { createHash } from 'crypto';

const cache = new Map<string, { suggestions: string[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 timer

function getCacheKey(description: string, form: string, grade: number): string {
  const hash = createHash('md5')
    .update(`${description}-${form}-${grade}`)
    .digest('hex');
  return hash;
}

async function suggestCompetenceGoalsWithCache(
  description: string,
  form: 'WRITTEN' | 'ORAL' | 'ORAL_PRACTICAL' | 'PRACTICAL',
  subject: string,
  grade: number,
  availableGoals: CompetenceGoal[]
): Promise<string[]> {
  const cacheKey = getCacheKey(description, form, grade);
  const cached = cache.get(cacheKey);

  // Check cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit for:', description.substring(0, 30));
    return cached.suggestions;
  }

  // Call AI
  const suggestions = await suggestCompetenceGoalsWithRetry(
    description,
    form,
    subject,
    grade,
    availableGoals
  );

  // Store in cache
  cache.set(cacheKey, {
    suggestions,
    timestamp: Date.now(),
  });

  return suggestions;
}
```

---

## 6. Rate Limiting

**Bruk:** Beskytt mot for mange API-kall

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsThisMinute = 0;
  private maxRequestsPerMinute = 20;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      if (this.requestsThisMinute >= this.maxRequestsPerMinute) {
        await new Promise(resolve => setTimeout(resolve, 60000));
        this.requestsThisMinute = 0;
      }

      const fn = this.queue.shift();
      if (fn) {
        this.requestsThisMinute++;
        await fn();
      }
    }

    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

// Bruk
export async function suggestGoalsRateLimited(...args: Parameters<typeof suggestCompetenceGoals>) {
  return rateLimiter.add(() => suggestCompetenceGoalsWithCache(...args));
}
```

---

## 7. Testing prompt (lokal)

**Bruk under utvikling:**

```typescript
// Mock OpenAI for testing
const mockSuggestions: Record<string, string[]> = {
  'prøve i likninger': ['MAT-10-TA-03', 'MAT-09-TA-03'],
  'muntlig presentasjon funksjoner': ['MAT-10-TA-01', 'MAT-10-TA-02'],
  'geometri': ['MAT-10-GE-01', 'MAT-10-GE-03'],
};

function mockSuggestCompetenceGoals(
  description: string,
  availableGoals: CompetenceGoal[]
): string[] {
  const lowerDesc = description.toLowerCase();
  
  for (const [key, codes] of Object.entries(mockSuggestions)) {
    if (lowerDesc.includes(key)) {
      return availableGoals
        .filter(g => codes.includes(g.code))
        .map(g => g.id);
    }
  }
  
  // Default: returner første 3
  return availableGoals.slice(0, 3).map(g => g.id);
}
```

---

## 8. API Route Implementering (Next.js)

```typescript
// app/api/ai/suggest-goals/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { suggestGoalsRateLimited } from '@/lib/ai/suggest-goals';

export async function POST(request: Request) {
  try {
    const { description, form, subject, grade } = await request.json();

    // Validate input
    if (!description || !form || !subject || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get available goals
    const availableGoals = await prisma.competenceGoal.findMany({
      where: {
        subject,
        grade,
      },
    });

    // Get AI suggestions
    const suggestedIds = await suggestGoalsRateLimited(
      description,
      form,
      subject,
      grade,
      availableGoals
    );

    // Return full goal objects
    const suggestions = availableGoals.filter(g => 
      suggestedIds.includes(g.id)
    );

    return NextResponse.json({ suggestions });
    
  } catch (error) {
    console.error('Suggest goals error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest goals' },
      { status: 500 }
    );
  }
}
```

---

## 9. Frontend Integrasjon

```typescript
// components/assessments/AssessmentForm.tsx
async function handleDescriptionChange(description: string) {
  if (description.length < 10) return; // For kort

  setIsLoadingSuggestions(true);

  try {
    const response = await fetch('/api/ai/suggest-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        form: form.getValues('form'),
        subject: classGroup.subject,
        grade: classGroup.grade,
      }),
    });

    const { suggestions } = await response.json();
    
    // Show suggestions to user
    setSuggestedGoals(suggestions);
    
  } catch (error) {
    console.error('Failed to get suggestions:', error);
  } finally {
    setIsLoadingSuggestions(false);
  }
}
```

---

## 10. Best Practices

### Do:
✅ Bruk lave temperature (0.2-0.4) for konsistente forslag  
✅ Cache resultater for identiske queries  
✅ Implementer retry-logikk  
✅ Ha fallback hvis API feiler  
✅ Valider AI-output før bruk  
✅ Rate-limit for å spare kostnader  

### Don't:
❌ Stol 100% på AI-forslag uten validering  
❌ Send sensitiv elevdata til OpenAI  
❌ Kall API for hver keystroke (debounce!)  
❌ Ignorer feilhåndtering  
❌ Glem å logge for debugging  

---

## 11. Kostnadsoptimalisering

**GPT-4 pricing (ca):**
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens

**Estimert forbruk per forslag:**
- Input: ~500 tokens (prompt + goals list)
- Output: ~50 tokens (JSON response)
- Kostnad: ~$0.02 per forslag

**Med caching:**
- 1000 unike vurderinger/måned = $20
- Med 80% cache-hit: $4/måned

---

**Ferdig! Dette bør dekke all AI-funksjonalitet for prototypen. 🚀**
