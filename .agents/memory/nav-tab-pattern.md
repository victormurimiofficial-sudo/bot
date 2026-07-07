---
name: Nav tab registration pattern
description: How to correctly add a new main nav tab to Deriv Bot (main.tsx + bot-contents.ts)
---

## Rule
Adding a tab requires **4 sync edits** — miss any one and the tab will render at the wrong index or the hash routing will break.

1. **`src/constants/bot-contents.ts`** — add `NEWNAME: N` to `DBOT_TABS` and `'id-newname'` to `TAB_IDS` at position N.
2. **`src/pages/main/main.tsx` — `hash` array** — insert `'newname'` at index N in `const hash = [...]`.
3. **`src/pages/main/main.tsx` — `<Tabs>` children** — add a new `<div label={...} id='id-newname'>` at child position N (0-indexed order matches DBOT_TABS index).
4. **Import** — add the page component import at the top of main.tsx.

## Current tab order (as of last update)
| Index | DBOT_TABS key | hash value    | TAB_ID           |
|-------|---------------|---------------|------------------|
| 0     | DASHBOARD     | dashboard     | id-dbot-dashboard|
| 1     | BOT_BUILDER   | bot_builder   | id-bot-builder   |
| 2     | DTRADER       | dtrader       | id-dtrader       |
| 3     | CHART         | chart         | id-charts        |
| 4     | TUTORIAL      | tutorial      | id-tutorials     |
| 5     | AI_TRADING    | ai_trading    | id-ai-trading    |

**Why:** The `handleTabChange` function maps tab click → `TAB_IDS[index]` → scroll. The URL hash uses the `hash` array. Both must stay in sync with the DOM child order inside `<Tabs>`.

**How to apply:** Any time a tab is added, removed, or reordered, update all four locations atomically. Run `git add -A && git commit` only after verifying the build passes (no ESLint/stylelint errors).
