# Activating the GitHub Actions uptime watchdog

The push token lacks `workflow` scope, so this file can't be pushed into
`.github/workflows/` automatically. To activate cloud monitoring:

1. Create a GitHub token with `repo` + `workflow` scopes, OR move this file
   from the GitHub web UI: Add file → paste `uptime.yml` content into
   `.github/workflows/uptime.yml`.
2. Repo secrets BLAND_API_KEY, ALERT_PHONE, ALERT_CALLER_ID are ALREADY SET.

Until then, the same watchdog runs locally via launchd on the owner's Mac
(`ops/uptime-check.sh`).
