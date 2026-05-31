# ACP Runtime Maintainer Decisions

Use this note during upgrades that touch ACPX, Discord thread bindings, Codex
ACP auth, or Gateway `dist/` deployment.

Verified locally on Discord, May 31 2026.

## Thread-Bound ACP

- LibreClaw's command-center deployment intentionally enables Discord
  thread-bound ACP session spawning for the trusted crew workflow.
- Claude Code, Cursor, and Codex ACP should all be kept in the smoke matrix.
- Cursor ACP can report a stale persistent-session resume as
  `ACP -32602 Invalid params`. Treat that the same as a missing persistent ACP
  session and retry once with a fresh session.

## Codex ACP Auth

- Codex ACP uses an isolated generated `CODEX_HOME` under ACPX state.
- Do not copy a real Codex or OpenClaw refresh token into that isolated home.
  Multiple refresh-token holders on the same OAuth account can invalidate each
  other.
- The safe bridge shape is:
  - read fresh `openai-codex` access credentials from OpenClaw's canonical auth
    profile store
  - reuse only local Codex `id_token` and account metadata
  - require account metadata to match when both sides provide it
  - write a disabled refresh-token placeholder into isolated `auth.json`
- If the OpenClaw access token is missing or expired, Codex ACP should fail
  closed instead of attempting refresh-token reuse.

## Built Gateway Deploys

- The Gateway lazily imports hashed chunks from `dist/`.
- `pnpm build` cleans and rewrites those chunks. A live Gateway process that was
  started before the rebuild can still hold old lazy-import chunk references.
- Restart the Gateway after a successful build before validating dashboard
  sessions, ACP, cron, usage, or config tabs.
- A missing hashed chunk such as `config-*.js`, `cron-*.js`, `usage-*.js`, or
  `server-methods-*.js` after a local rebuild is usually a stale live process,
  not a bad dashboard client cache.
