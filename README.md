# CoachLink — Sports Coaching Marketplace (Prototype)

A high-fidelity, interactive front-end prototype of the CoachLink mobile app, built with React + Vite.
It runs entirely client-side with mock data — booking, payments, and verification flows are simulated
for demonstration. No backend is required to run or deploy it.

## Requirements

- Node.js 18+ and npm

## Getting started (local development)

```bash
npm install
npm run dev
```

This starts a local dev server (usually at `http://localhost:5173`) with hot reload.

## Build for production

```bash
npm run build
```

This outputs a static, deployable site to the `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

## Deploying

The build output in `dist/` is a static site (HTML/CSS/JS) and can be deployed anywhere that serves
static files:

- **Vercel**: `npx vercel` (or connect the repo in the Vercel dashboard — it auto-detects Vite)
- **Netlify**: drag-and-drop the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
  or set build command `npm run build` and publish directory `dist`
- **GitHub Pages / Cloudflare Pages / any static host**: upload the contents of `dist/`

## Project structure

```
coachlink-app/
├─ index.html          # HTML entry point
├─ src/
│  ├─ main.jsx         # React root
│  ├─ App.jsx           # Entire app: design tokens, mock data, all screens, routing, device frame
│  └─ index.css         # Base reset
├─ package.json
└─ vite.config.js
```

## Notes

- The whole app lives in `src/App.jsx` for portability — it's organized into clearly labeled
  sections (design tokens, mock data, shared UI primitives, onboarding, client screens, coach
  screens, admin screens, and the app shell/router) if you want to split it into multiple files later.
- Uses [`lucide-react`](https://lucide.dev/) for icons. No CSS framework/build step is required —
  styling is done with inline styles using the CoachLink brand tokens defined at the top of `App.jsx`.
- Fonts (Outfit + Inter) are loaded from Google Fonts at runtime.
- All data (coaches, bookings, messages, etc.) is mock data held in React state — nothing persists
  between page reloads, and there is no real payment, auth, or backend integration.
