---
name: Spinner fix — invalid App ID
description: How the infinite loading spinner bug was diagnosed and fixed; rules to keep it from regressing.
---

## The bug
The app spinner never cleared when an invalid or stale App ID was stored in
`localStorage` (`config.app_id`).  The exact hang chain was:

1. `api-base.ts::getActiveSymbols` — `doUntilDone` rejected `active_symbols_promise`
   on `InvalidAppID` responses instead of resolving gracefully.
2. `active-symbols.js::retrieveActiveSymbols` — `await api_base.active_symbols_promise`
   had no null guard; for logged-in users the promise is sometimes never set, so
   the await hung forever.
3. `app-content.jsx::changeActiveSymbolLoadingState` — the 10-second fallback
   timeout used a stale closure (`is_loading`) and was only wired in the `else`
   branch (when `ApiHelpers.instance` wasn't ready yet), so it never fired in the
   common case.
4. `config.ts::getAppId` — `localStorage` `config.app_id` unconditionally overrode
   the `domain_app_ids` lookup, so a manually-entered bad App ID from the
   `/endpoint` page would persist across reloads with no escape hatch.

## Fixes applied (all in one commit, pushed to master)

| File | Change |
|------|--------|
| `api-base.ts` | `getActiveSymbols` wrapped in `try/catch`; always resolves. Also clears `localStorage` `config.app_id` + `config.server_url` on `InvalidAppID`/`AppDisabled`. |
| `active-symbols.js` | Null-check `api_base.active_symbols_promise` before awaiting; also `try/catch` the await so a rejection is caught and logged rather than propagated. |
| `app-content.jsx` | `retrieveActiveSymbols` call wrapped in `Promise.race` with a 12 s hard timeout via `withTimeout()`. Outer interval guard also uses the same 12 s budget. |
| `config.ts` | `bot-cupu.vercel.app` added to `domain_app_ids`. `getAppId` now checks explicit domain entries **first**, before `localStorage`, so no manual override can break a known deployment domain. |

## Rules to avoid regression

**Why:** A stale `localStorage` `config.app_id` is enough to hang the entire app
indefinitely.  The three code layers above are the only gates between an invalid
App ID and a visible spinner.

**How to apply:**
- Any new API call used during initialisation must either resolve or have an
  explicit timeout / catch.  Never `await` an uncaught promise during the boot
  path.
- If a new deployment domain is added, always add it to `domain_app_ids` in
  `config.ts` **and** keep `getAppId`'s domain-first priority order intact.
- Do not add `shouldThrowError` ignore-codes for `InvalidAppID` — we want the
  error surfaced so the localStorage auto-clear in `getActiveSymbols` fires.
