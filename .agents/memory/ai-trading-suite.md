---
name: AI Trading Suite
description: 8-phase AI trading feature added to Deriv Bot; self-contained under src/components/ai-trading-suite/
---

# AI Trading Suite

## What
Eight-phase enterprise feature expansion mounted as `<AiTradingSuite />` in `src/app/app-content.jsx`. Renders a floating 🤖 button (bottom-right) that expands into a tabbed panel.

## Phases
1. Floating AI Assistant — scanner + strategy injection (Load & Inject)
2. Market Analytics — tick velocity, digit heatmap, even/odd, AI confidence
3. Opportunity Ranking Engine — sorted cards with deploy-to-bot-builder
4. Copy Trading Network — 5 trader profiles with sync/mirror state
5. AI Strategy Marketplace — 6 strategies, difficulty filter, AI rating
6. Automated Market Insights — scrolling live feed
7. Global Notification Center — priority-grouped, mark-read
8. Architecture — MobX makeObservable (no decorators), strict TS, SCSS tokens

## Store
- `src/components/ai-trading-suite/store/ai-trading-store.ts` — singleton `aiTradingStore`
- Uses `makeObservable` (not decorators — tsconfig lacks experimentalDecorators)
- 4 setIntervals: assets 2.5s, analytics 1.8s, insights 4s, notifications 8s
- `dispose()` called from `AiTradingSuite` unmount via mount-count guard

## Key rules
- **Why no decorators:** tsconfig has `useDefineForClassFields: true` and no `experimentalDecorators` — always use `makeObservable({...})` pattern
- **CSS BEM:** modifier classes must match the full base class name (e.g. `ats-readiness-badge--ready`, not `ats-readiness--ready`)
- All simulated data — no real WebSocket feeds

## Dev server
- Port 8443, HTTPS (pluginBasicSsl in rsbuild.config.ts)
- Workflow: `npm run start` → waitForPort 8443
