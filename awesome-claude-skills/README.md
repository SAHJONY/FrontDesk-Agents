# Awesome Claude Skills for FrontDesk Agents

This folder contains the **awesome‑claude‑skills** collection, a curated set of ready‑to‑use Hermes skills for a wide range of services (email, calendar, task management, document processing, etc.).

## How to use
- Load a skill in your workflow with the standard Hermes CLI, for example:
  ```bash
  hermes skill view awesome-claude-skills/gmail-automation
  ```
- Wrap the skill in a FrontDesk‑Agents‑specific module if you want brand‑consistent naming. See `lib/integrations/` for examples.
- All skills live under `awesome-claude-skills/`; they are part of the repository, so CI/CD will ship them with the app.

## Recommended entry points
- **Email sync** – `awesome-claude-skills/gmail-automation`
- **Calendar events** – `awesome-claude-skills/googlecalendar-automation`
- **Task creation** – `awesome-claude-skills/asana-automation` (or any other supported task platform).

Feel free to explore the sub‑folders; each contains a `SKILL.md` with detailed usage instructions.
