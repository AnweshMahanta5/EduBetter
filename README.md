
# EduBetter
**Better access. Better support. Better futures.**

A multilingual PWA that helps students discover scholarships, check basic eligibility, get deadline reminders, and access official board textbooks — with tribal language support.

## Quick Start
```bash
npm install
npm run dev
```

## Tech
- React + Vite + TypeScript + Tailwind
- i18next for multilingual UI (EN/HI/Santali starter)
- JSON-driven data: `src/data/schemes.json`, `src/data/books.json`
- Rule-based matcher: `src/lib/match.ts`
- Calendar export: `src/lib/ics.ts`

## Pages
- `/` — Language-first welcome
- `/onboarding` — Class • Board • State
- `/scholarships` — Matched scholarships
- `/scholarship/:id` — Details + checklist + calendar export
- `/resources` — Textbook/solution links
- `/help` — FAQ + contact

## i18n
- Add languages by creating `src/i18n/<code>.json` and listing the code in `src/i18n/setup.ts`.
- Tribal fonts are loaded via Google Fonts in `index.html`.

## Data
- Each scholarship item includes `source` and `last_updated` for trust.
- **Note:** Sample data uses placeholder links. Replace with official URLs before production.

## License
MIT
