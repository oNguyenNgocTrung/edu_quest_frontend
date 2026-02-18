# EduQuest Web

Next.js 16 frontend for EduQuest — a gamified learning platform for children with parent oversight.

## Prerequisites

- Node.js 20+ (required for Storybook 10)
- API server running on `localhost:3000` (see `../api/README.md`)

## Setup

```bash
cp .env.example .env.local    # configure environment variables
nvm use 20                    # if using nvm
npm install
npm run dev                   # starts on http://localhost:3001
```

> The dev server auto-increments to port 3001 since the API occupies 3000.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Rails API base URL (e.g. `http://localhost:3000/api/v1`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run storybook` | Start Storybook at `localhost:6006` |
| `npm run build-storybook` | Build static Storybook site |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **State:** Zustand (auth), React Query (server data)
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Components:** CVA (class-variance-authority) + tailwind-merge
- **Component Library:** Storybook 10
- **PWA:** @ducanh2912/next-pwa

## PWA Support

LearnNest is a Progressive Web App, enabling:

- **Offline access** — Cached pages work without internet
- **Installable** — Add to home screen on mobile/desktop
- **Fast navigation** — Front-end caching for instant page transitions

### Configuration

PWA is configured in `next.config.ts` using `@ducanh2912/next-pwa`:

- Service worker disabled in development (enable with `disable: false` for testing)
- Manifest generated from `src/app/manifest.ts`
- App icon at `public/icons/icon.svg`

### Testing PWA Locally

```bash
npm run build
npm run start    # PWA only works in production mode
```

Open Chrome DevTools > Application > Service Workers to verify registration.

## Project Structure

```
src/
  app/
    (public)/           # Unauthenticated routes (/login, /register)
    (auth)/             # Protected routes (redirects to /login if no token)
      child/            # Child-facing pages (home, learn, flashcards, session, etc.)
      parent/           # Parent-facing pages (dashboard, analytics, content, etc.)
  components/
    ui/                 # Reusable UI primitives (Button, Card, Badge, etc.)
    child/              # Child-specific components
    parent/             # Parent-specific components
    Mascot.tsx          # Animated owl mascot
  lib/
    api-client.ts       # Axios instance with auth interceptors
    utils.ts            # cn() helper, utility functions
  stores/
    auth-store.ts       # Zustand auth state (tokens, profiles)
  types/
    index.ts            # TypeScript interfaces for API responses
  stories/              # Design system documentation
```

## Design System

- **Headings:** Nunito (font-black)
- **Body:** Inter
- **Primary:** Purple (#9333EA)
- **Accent:** Pink (#EC4899)
- **Secondary:** Orange (#F97316)

Refer to `../Eduquestdesign/src/components/UIKit.tsx` for the full design spec.

## Storybook

The component library is documented with Storybook 10 using `@storybook/nextjs-vite`.

```bash
npm run storybook     # http://localhost:6006
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

Note: Storybook 10 uses different import paths:
- `storybook/test` (not `@storybook/test`)
- `@storybook/addon-docs/blocks` (not `@storybook/blocks`)

## Deploy to Vercel

### 1. Import project

Connect your GitHub repository in the [Vercel dashboard](https://vercel.com/new).

### 2. Configure build settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Node.js Version** | 20.x |

### 3. Set environment variables

In the Vercel project settings (Settings > Environment Variables):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.up.railway.app/api/v1` |

### 4. Deploy

Vercel deploys automatically on push to your main branch. You can also trigger manual deploys:

```bash
npx vercel          # preview deploy
npx vercel --prod   # production deploy
```

## Demo Credentials

- **Email:** parent@example.com
- **Password:** password123
- **PIN:** 1234
- **Child profiles:** Alex (fox, age 7-9), Emma (owl, age 10-12)
