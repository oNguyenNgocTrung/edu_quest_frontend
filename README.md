# EduQuest Web

Next.js 16 frontend for EduQuest — a gamified learning platform for children with parent oversight.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand + React Query
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Component Library:** Storybook 10

## Getting Started

**Requirements:** Node.js 20+ (Storybook requires Node 20)

```bash
# If using nvm
nvm use 20

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run storybook` | Start Storybook at localhost:6006 |
| `npm run build-storybook` | Build static Storybook site |

## Storybook

The component library is documented with Storybook 10 using `@storybook/nextjs-vite`.

```bash
npm run storybook
```

### What's in Storybook

**UI Primitives** (`src/components/ui/`) — Reusable building blocks:
- Button, Card, Badge, ProgressBar, Alert, Input, Select

**Components** — App-specific components with stories:
- Mascot, BottomNav, BrainBoostBanner, YourSubjects

**Design System** (`src/stories/`) — Documentation pages:
- Design Tokens (colors, typography, spacing)
- Animations (hover, floating, spinning, shimmer)
- Icons (Lucide icon gallery)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/           # Reusable UI primitives (Button, Card, etc.)
│   ├── child/        # Child-facing app components
│   └── Mascot.tsx    # Animated owl mascot
├── lib/
│   └── utils.ts      # cn() classname utility
├── stores/           # Zustand stores
├── services/         # API service layer
├── types/            # TypeScript type definitions
└── stories/          # Design system documentation
```
