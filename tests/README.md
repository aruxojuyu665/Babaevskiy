# Test infrastructure

Mobile-first performance and E2E testing pipeline for the Babaevskiy Advanced landing page.

## Layout

```
tests/
├── e2e/              Critical-flow E2E tests (Playwright, Mobile Chrome + Safari + SE)
│   ├── lead-contacts.spec.ts    Hero callback form happy path + validation
│   ├── lead-calculator.spec.ts  Calculator section reachability and input
│   └── scroll-journey.spec.ts   Full-page scroll with runtime CLS + console-error asserts
├── perf/             Runtime CWV budgets via PerformanceObserver
│   └── mobile-budgets.spec.ts
├── throttle/         CDP Slow 3G / Fast 3G smoke tests
│   └── slow3g.spec.ts
├── visual/           Visual regression (toHaveScreenshot baselines)
│   └── home.mobile.spec.ts
├── helpers/
│   └── wait-ready.ts            Waits for the Preloader overlay to unmount
└── README.md         This file
```

## Commands

| Command | What it does |
|---|---|
| `npm run test:e2e` | Run every Playwright test on every configured device project |
| `npm run test:e2e:mobile` | Mobile Chrome + Mobile Safari only |
| `npm run test:visual` | Visual regression on mobile viewports |
| `npm run test:visual:update` | Regenerate baseline screenshots |
| `npm run test:throttle` | CDP throttled Slow/Fast 3G runs |
| `npm run test:perf` | Runtime CWV budget gate |
| `npm run lhci` | Lighthouse CI (3 runs, mobile preset) — **note: flaky on Windows (temp EPERM cleanup)** |
| `npm run analyze` | `ANALYZE=true next build` — opens bundle report |
| `npm run size` | Enforces `.size-limit.json` budgets |
| `npm run optimize:images` | Idempotent sharp downscale for `public/cases|process|textures` |
| `npm run perf:all` | Build → start → lhci → mobile e2e → size-limit |

## Baselines

- Visual snapshots live in `tests/visual/home.mobile.spec.ts-snapshots/` (one per device project).
- On the first clean run, generate them with `npm run test:visual:update`.
- Commit baselines only after reviewing the HTML Playwright report (`npx playwright show-report`).

## Running against a custom host

Set `PLAYWRIGHT_BASE_URL=http://localhost:4000 npm run test:e2e`.

## Known quirks on Windows

- `lhci autorun` may crash at the end with `EPERM` while cleaning up Chrome's temp dir. The audits already ran successfully at that point; you can work around it by running `npx lighthouse` directly — see `perf-reports/` for the most recent manual report.
- Playwright's `webServer` block runs `npm run start`, but leaves the process alive if tests are cancelled mid-run. If you see `EADDRINUSE`, kill node processes on port 3000: `netstat -ano | grep :3000` → `taskkill /F /PID <pid>`.
