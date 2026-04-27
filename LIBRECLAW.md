# LibreClaw

LibreClaw is a downstream build of [OpenClaw](https://github.com/openclaw/openclaw) maintained for the AxonArcade/OpenClaw family setup.

The upstream OpenClaw README remains the authoritative overview for the base product. This file documents the additional LibreClaw-specific features carried in this repository so readers can tell what differs from upstream.

## Current base

- Upstream base: OpenClaw `2026.4.25`
- LibreClaw branch: `rebuild/libreclaw-features-2026-04-25`

## LibreClaw additions

### LibreClaw Prompt Studio

LibreClaw adds a dedicated Control UI area at `/libreclaw` for editing and previewing assistant prompt customizations without replacing the upstream prompt wholesale.

It supports the `agents.defaults.systemPrompt` customization surface:

- `mode`: controls how the local customization is applied
- `prepend`: text inserted before the generated upstream prompt
- `append`: text inserted after the generated upstream prompt
- `removeSections`: named generated sections to omit
- `allowUnsafeReplace`: explicit opt-in for full replacement-style behavior

The preview endpoint lets the UI show the composed prompt before saving or applying config changes.

### System prompt customization engine

LibreClaw carries backend support for composing the generated OpenClaw system prompt with local customization rules. The goal is to keep local personality, safety, and coordination layers easy to audit while still inheriting upstream prompt improvements.

### `COORDINATION.md` bootstrap hook

LibreClaw includes a bundled `coordination-md` hook that can inject a shared `COORDINATION.md` file into agent bootstrap context.

This is intended for multi-agent coordination setups where several assistants need the same current operating context without duplicating it across every workspace.

### Claude CLI streaming and Discord delivery hardening

LibreClaw carries fixes around Claude CLI `stream-json` output and channel delivery so assistant text deltas are surfaced more reliably in Discord-style channels, including cases where tool calls happen mid-turn.

### Control UI polish

LibreClaw includes small dashboard/UI refinements used by this deployment, including clearer recent session identifiers and the dedicated LibreClaw navigation entry.

## Non-goals

LibreClaw is not a separate upstream product and does not replace OpenClaw documentation or support channels.

- For base install, configuration, and usage docs, use the upstream OpenClaw README and docs.
- LibreClaw-specific features may be experimental and can change as upstream catches up or local needs evolve.
- This repository may carry deployment-specific conventions that are useful here but not necessarily intended for every OpenClaw install.

## Maintenance notes

When rebasing onto a newer OpenClaw release, keep this file in sync with the actual carried patch stack. If a feature is upstreamed or dropped, update this document in the same branch.
