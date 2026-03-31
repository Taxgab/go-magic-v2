# Frontend Design Guidelines - Go Magic Gym

This document defines the visual design system and UI patterns for the project.

## Design Philosophy

**Ethereal Athlete** - A calm, sophisticated aesthetic inspired by wellness apps:

- **Tonal Layering**: No borders, use subtle background color changes for depth
- **Glassmorphism**: Frosted glass effect for floating elements (headers, nav)
- **Rounded Corners**: Heavy use of rounded corners (2rem+ for cards, 9999px for buttons)
- **Gradient Accents**: Primary gradient for buttons and hero elements
- **Serif + Sans**: Noto Serif for headings, Plus Jakarta Sans for body

## Color Palette

### Primary (Purple - Brand)

```css
primary: #6d548c        /* Main brand color */
primary-container: #dbbdfd  /* Light variant */
primary-50: #f5f0fa     /* Subtle background */
primary-900: #3c2f4b    /* Dark variant */
```

### Secondary (Green - Success/Active)

```css
secondary: #4b664a      /* Success, active states */
secondary-container: #dbe6db
```

### Tertiary (Orange - Warning/Alerts)

```css
tertiary: #a53d12       /* Warnings, errors */
tertiary-container: #fdf0eb
```

### Surface (Background layers)

```css
surface: #fbf9f5        /* Default background */
surface-lowest: #ffffff /* Cards, elevated elements */
surface-low: #f5f2ed    /* Hover states, sections */
surface-high: #efebe6   /* Borders (no visible borders) */
surface-highest: #e8e4de /* Input backgrounds */
```

### Text Colors

```css
on-surface: #31332f     /* Primary text */
on-surface-variant: #5c5c58  /* Secondary text, labels */
outline-variant: #b2b2ad    /* Dividers, borders */
```

### Semantic Colors

```css
success: #4b664a        /* Same as secondary */
error: #ba1a1a          /* Validation errors */
```

## Typography

### Font Families

```css
font-serif: 'Noto Serif', Georgia, serif     /* Headings */
font-sans: 'Plus Jakarta Sans', system-ui, sans-serif  /* Body */
```

### Font Sizes

| Token      | Size     | Use                   |
| ---------- | -------- | --------------------- |
| display-lg | 3.5rem   | Hero headlines        |
| display-md | 2.5rem   | Page titles           |
| display-sm | 2rem     | Section headers       |
| text-base  | 1rem     | Body text             |
| text-sm    | 0.875rem | Labels, secondary     |
| text-xs    | 0.75rem  | Badges, table headers |

### Typography Rules

- Headings (h1-h6): `font-serif font-medium tracking-tight`
- Body: `font-sans antialiased`
- Labels: `text-xs uppercase tracking-wider font-semibold`
- Gradient text: `.text-gradient-editorial` (primary → tertiary)

## Spacing Scale

| Token | Value   | Use              |
| ----- | ------- | ---------------- |
| xs    | 0.25rem | Tight gaps       |
| sm    | 0.5rem  | Icon spacing     |
| md    | 1rem    | Default padding  |
| lg    | 1.5rem  | Card padding     |
| xl    | 2rem    | Section gaps     |
| 2xl   | 3rem    | Page sections    |
| 3xl   | 4rem    | Large containers |

**Rule**: Use multiples of 4px (0.25rem). Common values: 4, 8, 12, 16, 24, 32, 40, 48.

## Border Radius

| Token   | Value  | Use                    |
| ------- | ------ | ---------------------- |
| DEFAULT | 1rem   | Standard elements      |
| 2xl     | 1.5rem | Cards                  |
| 3xl     | 2rem   | Modals, large cards    |
| full    | 9999px | Buttons, badges, chips |

**Rule**: Always use rounded corners. Never sharp corners.

## Shadows

```css
shadow-ambient: 0 20px 40px rgba(49, 51, 47, 0.06)  /* Floating cards */
shadow-float: 0 8px 24px rgba(49, 51, 47, 0.08)     /* Hover, buttons */
```

**Rule**: Subtle, warm-tinted shadows. No harsh dark shadows.

## Components

### Button

**Variants**: `primary`, `secondary`, `danger`, `ghost`
**Sizes**: `sm`, `md`, `lg`

```tsx
<Button variant="primary" size="md" loading={isLoading}>
  Guardar
</Button>
```

**Styles**:

- Primary: Gradient background `bg-gradient-to-r from-primary to-primary-container`
- Secondary: Transparent with subtle border
- All: `rounded-full` (9999px), hover scale (1.02), disabled opacity 50%

### Input

```tsx
<Input label="Nombre" error={formErrors.nombre} required />
```

**Styles**:

- Background: `bg-surface-highest`
- Focus: `bg-surface-lowest ring-2 ring-primary`
- Radius: `rounded-2xl` (1.5rem)
- No visible borders

### Modal

```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Editar Alumno" maxWidth="md">
  {/* Content */}
</Modal>
```

**Sizes**: `sm` (384px), `md` (512px), `lg` (672px), `xl` (896px)

**Styles**:

- Backdrop: `bg-on-surface/30 backdrop-blur-sm`
- Content: `bg-surface-lowest rounded-3xl`
- Title: `font-serif text-2xl`

### Card

```tsx
<div className="card card-hover">{/* Content */}</div>
```

**Styles**:

- Background: `bg-surface-lowest`
- Radius: `rounded-3xl` (2rem)
- Padding: `p-6` (1.5rem)
- Hover: `-translate-y-0.5 shadow-ambient`

### StatCard

```tsx
<StatCard label="Alumnos Activos" value={42} icon={Users} color="primary" />
```

**Colors**: `primary`, `secondary`, `tertiary`

### DataTable

```tsx
<DataTable
  data={alumnos}
  columns={[
    { key: 'nombre', header: 'Nombre' },
    { key: 'estado', header: 'Estado', render: item => <Badge status={item.estado} /> },
  ]}
  keyExtractor={item => item.id}
  cardBreakpoint="sm"
/>
```

**Features**:

- Responsive: Cards on mobile, table on desktop (use `cardBreakpoint`)
- Loading spinner
- Empty state message
- Row click handler

### Badge/Chip (Status)

```tsx
<span className="badge-success">Activo</span>
<span className="badge-warning">Pendiente</span>
<span className="chip chip-primary">Pilates</span>
```

**Styles**:

- `badge-success`: Green background (secondary-container)
- `badge-warning`: Orange background (tertiary-container)
- `badge-neutral`: Gray background (surface-low)
- All: `rounded-full text-xs font-medium uppercase`

## Layout Patterns

### Page Header

```tsx
<div className="page-header">
  <h1 className="page-title font-serif text-display-sm">Alumnos</h1>
  <p className="text-on-surface-variant">Gestiona los alumnos del gimnasio</p>
</div>
```

### Section Container

```tsx
<div className="section-surface-low">{/* Content with tonal layer */}</div>
```

### Sidebar Navigation

- Fixed on desktop, slide-in on mobile
- Active item: `bg-primary/10 text-primary`
- Inactive: `text-on-surface-variant hover:bg-surface-low`
- All nav items: `rounded-2xl`

### Main Content

```tsx
<main className="flex-1 p-6 lg:p-10">
  <div className="max-w-7xl mx-auto">{/* Page content */}</div>
</main>
```

## Tailwind Class Patterns

### Common Patterns

```css
/* Card */
bg-surface-lowest rounded-3xl p-6

/* Card hover */
bg-surface-lowest rounded-3xl p-6 hover:-translate-y-0.5 hover:shadow-ambient transition-all

/* Button primary */
bg-gradient-to-r from-primary to-primary-container text-white rounded-full px-6 py-3 font-semibold

/* Button secondary */
bg-transparent border border-outlineVariant/15 rounded-full px-6 py-3 hover:bg-surface-low

/* Input */
bg-surface-highest rounded-2xl px-4 py-3 focus:bg-surface-lowest focus:ring-2 focus:ring-primary

/* Label */
text-xs uppercase tracking-wider font-semibold text-on-surface-variant

/* Badge */
rounded-full px-3 py-1 text-xs font-medium uppercase

/* Page title */
font-serif text-2xl text-on-surface

/* Loading spinner */
animate-spin rounded-full h-8 w-8 border-b-2 border-primary
```

### clsx Pattern

```tsx
import { clsx } from 'clsx'

<div className={clsx(
  'base-classes',
  condition && 'conditional-classes',
  className
)}>
```

## Animations

### Transitions

- `transition-all duration-200` - Standard (hover, focus)
- `transition-all duration-300` - Modal, sidebar
- `transition-colors` - Background only changes

### Hover Effects

- Scale: `hover:scale-1.02` (buttons), `hover:-translate-y-0.5` (cards)
- Shadow: `hover:shadow-float` (buttons), `hover:shadow-ambient` (cards)
- Background: `hover:bg-surface-low`

### Loading

```tsx
/* Spinner */
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />

/* Skeleton */
<div className="loading-skeleton h-4 w-24" />
```

## Responsive Breakpoints

| Breakpoint | Width  | Use                   |
| ---------- | ------ | --------------------- |
| sm         | 640px  | Mobile landscape      |
| md         | 768px  | Tablet                |
| lg         | 1024px | Desktop sidebar shown |
| xl         | 1280px | Large desktop         |
| 2xl        | 1536px | Extra large           |

### Responsive Patterns

```css
/* Sidebar: hidden on mobile */
lg:static -translate-x-full lg:translate-x-0

/* Padding: more on desktop */
p-6 lg:p-10

/* Grid: 1 col mobile, 2+ desktop */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* DataTable cards */
<DataTable cardBreakpoint="sm" />  /* Cards below 640px */
```

## Icons (Lucide)

- Size: `size={20}` for nav, `size={24}` for headers/buttons
- Color: inherit from parent `text-*`
- Active state: `text-primary`

```tsx
import { Users, Calendar, Plus, Search } from 'lucide-react'

<Users size={20} className="text-on-surface-variant" />
<Plus size={24} className="text-white" />
```

## Empty States

```tsx
<div className="empty-state">
  <Icon size={48} className="text-outline-variant mb-4" />
  <p className="text-on-surface-variant">No hay datos disponibles</p>
</div>
```

## Forms

### Form Layout

```tsx
<form className="space-y-4">
  <Input label="Nombre" required error={errors.nombre} />
  <Input label="Email" type="email" />
  <div className="flex gap-3 pt-4">
    <Button variant="secondary" onClick={onClose}>
      Cancelar
    </Button>
    <Button variant="primary" loading={loading}>
      Guardar
    </Button>
  </div>
</form>
```

### Error Display

- Field errors: `text-sm text-tertiary mt-2` below input
- Form errors: Alert at top of form

## Accessibility

- All interactive elements must have focus states
- Use `aria-label` for icon-only buttons
- Modal: `role="dialog" aria-modal="true" aria-labelledby`
- Skip visible focus rings: `focus:ring-2 focus:ring-primary`
