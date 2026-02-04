# UI/UX Design-guide - Vurderingsverktøy

## Fargepalett

### Primærfarger
```css
/* Primær (blå) - Handlinger, lenker, fokus */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Hovedfarge */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Semantiske farger
```css
/* Suksess (grønn) - Alt OK, klar for standpunkt */
--success-50: #f0fdf4;
--success-500: #10b981;
--success-700: #047857;

/* Advarsel (gul) - Trenger oppmerksomhet */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-700: #b45309;

/* Fare (rød) - Kritiske mangler */
--danger-50: #fef2f2;
--danger-500: #ef4444;
--danger-700: #b91c1c;
```

### Gråtoner
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

---

## Typografi

### Font
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Størrelser
```css
/* Heading */
--text-4xl: 2.25rem;  /* 36px - H1 */
--text-3xl: 1.875rem; /* 30px */
--text-2xl: 1.5rem;   /* 24px - H2 */
--text-xl: 1.25rem;   /* 20px - H3 */
--text-lg: 1.125rem;  /* 18px - H4 */

/* Body */
--text-base: 1rem;    /* 16px - Standard */
--text-sm: 0.875rem;  /* 14px - Small */
--text-xs: 0.75rem;   /* 12px - Caption */
```

### Vekter
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line-height
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## Spacing

### Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Vanlig bruk
- **Små gaps:** 8px (space-2)
- **Standard gaps:** 16px (space-4)
- **Store gaps:** 24px (space-6)
- **Section padding:** 32px (space-8)

---

## Komponenter

### StudentCard

**Status-indikatorer:**
```tsx
// Grønn: Klar for standpunkt
<div className="border-l-4 border-green-500 bg-white shadow-sm hover:shadow-md">
  <Badge variant="success">Klar</Badge>
</div>

// Gul: Nesten klar (advarsler)
<div className="border-l-4 border-yellow-500 bg-white shadow-sm hover:shadow-md">
  <Badge variant="warning">Nesten klar</Badge>
</div>

// Rød: Kritiske mangler
<div className="border-l-4 border-red-500 bg-white shadow-sm hover:shadow-md">
  <Badge variant="destructive">Risiko</Badge>
</div>
```

**Layout:**
```tsx
<Card>
  <CardHeader>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold">Emma Hansen</h3>
        <Badge variant="success">Klar</Badge>
      </div>
      <DropdownMenu>...</DropdownMenu>
    </div>
  </CardHeader>
  <CardContent className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Vurderinger:</span>
      <span className="font-medium">8</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Kompetansemål:</span>
      <span className="font-medium">12/12</span>
    </div>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button variant="outline" size="sm">Vis detaljer</Button>
    <Button size="sm">Legg til vurdering</Button>
  </CardFooter>
</Card>
```

---

### Badges

```tsx
// Status badges
<Badge variant="success">Klar</Badge>
<Badge variant="warning">Nesten klar</Badge>
<Badge variant="destructive">Risiko</Badge>
<Badge variant="secondary">Kladd</Badge>

// Count badges
<Badge variant="outline">8 vurderinger</Badge>
```

---

### Buttons

```tsx
// Primary action
<Button>Lagre</Button>

// Secondary action
<Button variant="outline">Avbryt</Button>

// Danger action
<Button variant="destructive">Slett</Button>

// Sizes
<Button size="sm">Liten</Button>
<Button size="default">Standard</Button>
<Button size="lg">Stor</Button>
```

---

### Forms

```tsx
<Form>
  <FormField
    control={form.control}
    name="grade"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Karakter</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Velg karakter" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="1">1</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

### Tables

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Elev</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Vurderinger</TableHead>
      <TableHead className="text-right">Handlinger</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">Emma Hansen</TableCell>
      <TableCell>
        <Badge variant="success">Klar</Badge>
      </TableCell>
      <TableCell>8</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm">...</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### Alerts

```tsx
// Info
<Alert>
  <InfoIcon className="h-4 w-4" />
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>
    Halvårsvurdering ikke registrert i systemet (håndteres i Vigilo)
  </AlertDescription>
</Alert>

// Warning
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Advarsel</AlertTitle>
  <AlertDescription>
    Emma har kun 1 skriftlig vurdering - minimum 2 påkrevd
  </AlertDescription>
</Alert>

// Destructive
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Feil</AlertTitle>
  <AlertDescription>
    Kunne ikke lagre vurdering
  </AlertDescription>
</Alert>
```

---

## Layout

### Dashboard Layout

```tsx
<div className="min-h-screen bg-gray-50">
  {/* Sidebar */}
  <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
    <nav className="p-4 space-y-2">
      <Button variant="ghost" className="w-full justify-start">
        Mine faggrupper
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        Min side
      </Button>
    </nav>
  </aside>

  {/* Main content */}
  <main className="ml-64 p-8">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900">Matematikk 10A</h1>
      <p className="text-gray-600">24 elever</p>
    </div>

    {/* Content */}
    <div className="space-y-6">
      {/* Tabs, filters, content... */}
    </div>
  </main>
</div>
```

---

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <StudentCard />
  <StudentCard />
  <StudentCard />
</div>
```

---

## Responsivt Design

### Breakpoints
```css
/* Tailwind defaults */
sm: 640px   /* Mobil landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-first approach
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 kolonne på mobil, 2 på tablet, 3 på desktop */}
</div>
```

---

## Loading States

```tsx
// Skeleton for StudentCard
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-16 mt-2" />
  </CardHeader>
  <CardContent className="space-y-2">
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
  </CardContent>
</Card>

// Spinner
<div className="flex items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
</div>
```

---

## Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <FileX className="h-16 w-16 text-gray-400 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Ingen vurderinger ennå
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    Kom i gang ved å registrere din første vurdering
  </p>
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Legg til vurdering
  </Button>
</div>
```

---

## Icons

**Bruk Lucide React:**
```tsx
import { Plus, Edit, Trash, Check, X, AlertTriangle, Info } from 'lucide-react'
```

**Størrelser:**
- Small: `h-4 w-4` (16px)
- Medium: `h-5 w-5` (20px)
- Large: `h-6 w-6` (24px)

---

## Animasjoner

```tsx
// Hover effects
<Card className="transition-shadow hover:shadow-md">

// Fade in
<div className="animate-in fade-in duration-200">

// Slide in
<div className="animate-in slide-in-from-bottom duration-300">
```

---

## Accessibility

- **Alt text** på alle bilder
- **aria-label** på ikoner uten tekst
- **Focus states** synlige på alle interactive elementer
- **Keyboard navigation** fungerer overalt
- **Color contrast** minimum WCAG AA (4.5:1 for normal tekst)

```tsx
// Eksempel
<Button aria-label="Slett vurdering">
  <Trash className="h-4 w-4" />
</Button>
```

---

## Best Practices

1. **Konsistens**: Bruk shadcn/ui komponenter fremfor custom styling
2. **Spacing**: Bruk Tailwind spacing-scale konsekvent
3. **Colors**: Bruk kun farger fra paletten
4. **Typography**: Maks 3 font-størrelser per side
5. **Buttons**: Ikke mer enn 1 primær-knapp per seksjon
6. **Loading**: Alltid vis loading state for async operations
7. **Errors**: Vis tydelige feilmeldinger med handlingsvalg

---

**Dette bør være nok for Claude Code å lage konsistent UI! 🎨**
