---
name: Dep install quirk
description: npm install fails on this project due to shell-quote@1.8.3 firewall block; workaround required.
---

# Dependency Install Quirk

## The problem
`npm install` fails with 403 Blocked by Security Policy for `shell-quote@1.8.3`.

**Chain:** `webpack-dev-server` → `launch-editor` → `shell-quote@^1.8.3`

## Workaround
Run with `--no-package-lock` to force re-resolution (picks up a newer shell-quote):
```bash
npm install --legacy-peer-deps --no-package-lock
```

**Why:** The lock file pins shell-quote@1.8.3 which is blocked. Without the lock file, npm resolves to a non-blocked version.

## Additional peer deps needed
`@deriv-com/translations` requires `i18next` and `react-i18next` as peer deps — they are not in package.json but must be installed for the build to succeed:
```bash
npm install --no-audit --legacy-peer-deps --no-package-lock i18next react-i18next
```

## How to apply
Any time a clean install is needed on this project, use the --no-package-lock flag.
