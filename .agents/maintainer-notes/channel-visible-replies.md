# Channel Visible Replies Maintainer Decisions

Use this note during upgrades that touch channel reply dispatch, grouped chat
delivery, or bundled channel plugins.

Verified locally on Discord, May 21 2026.

## Per-Agent Delivery Overrides

- Global `messages.groupChat.visibleReplies: "message_tool"` is intentional for
  agents that rely on progress updates and explicit visible `message.send`
  calls.
- Agent-level `agents.list[].groupChat.visibleReplies` must override the global
  group/channel visible reply mode when computing source reply delivery.
- The channel reply pipeline needs the active `agentId`; otherwise Discord,
  Slack, and WhatsApp will resolve delivery from global config only and may
  inject a message-tool reminder into agents that do not have that tool.
- Keep `messageToolAvailable=false` fallback behavior: if a turn explicitly
  requests message-tool-only delivery but the tool is unavailable, automatic
  delivery is the safer visible fallback.

## Live AxonArcade Configuration

- `Codex`/global group-channel delivery stays `message_tool`.
- `Clawd`/default stays on the Anthropic/pi-runner path and should not be moved
  to Claude CLI by this patch.
- `Spark`, `Echo`, `Lumen`, and `Davinci` use the Claude CLI runner and
  per-agent `groupChat.visibleReplies: "automatic"` so their normal final
  replies post visibly without requiring the message tool.

## Build Safety

- In this runtime, do not use a bare `npm run build` for quick Gateway deploys
  unless PATH has been verified. A non-login environment can miss `pnpm`; the
  build may remove `dist/` before failing.
- Preferred minimal Gateway rebuild command:
  `PATH="$HOME/.npm-global/bin:$PATH" node scripts/build-all.mjs gatewayWatch`
- Before restarting the repo-backed Gateway, verify `dist/index.js` exists.
