---
summary: "Coordinate durable worker loops with wakebacks, review/fix iterations, and human-visible threads"
read_when:
  - You want an agent to run a durable multi-step workflow
  - You need workers to wake an orchestrator after completion
  - You want to track parallel project workflows in Discord threads
title: "Workflow loops"
sidebarTitle: "Workflow loops"
---

Workflow loops are an orchestration pattern for long-running project work where an
agent coordinates bounded workers, waits for completion wakebacks, reviews the
result, and advances the next state transition.

Use workflow loops when you want more structure than a single background task but
less machinery than a custom workflow engine.

## Mental model

A workflow loop has three layers:

1. **Orchestrator** — the agent that owns the project judgment, state file,
   review/fix loop, and final user-facing updates.
2. **Workers** — bounded implementation, review, test, or documentation phases
   that write result artifacts and wake the orchestrator when done.
3. **Ledger** — a human-readable thread plus machine-readable project state.

The orchestrator does not blindly trust worker output. A worker completion is a
signal to inspect state, review the diff, run gates, and decide exactly one next
transition.

## When to use a workflow loop

Good fits:

- implementation → test → review → fix → PR workflows;
- detached or long-running worker phases;
- project work that should survive compaction, restarts, or human context
  switches;
- multiple parallel loops that need clear ownership and status tracking.

Avoid workflow loops for trivial one-step edits, destructive actions without
explicit approval, or broad unsupervised autonomous chains.

## Discord tracking

For human-visible coordination, create one Discord thread per workflow loop in a
dedicated channel such as `#workflow-loops`.

Thread name pattern:

```text
PROJECT workflow-id — short goal
```

Post concise state transitions only:

- started: objective, branch, allowed scope, intervention rules;
- worker spawned: phase, harness/model, expected wakeback;
- wake received: worker status, commit, result path;
- gates running/passed/failed;
- review requested/received;
- fix iteration started/completed;
- PR opened/updated;
- PR ready for merge or blocked for intervention;
- merged/blocked.

Keep raw worker transcript noise out of the thread. Link artifacts, commits,
PRs, and state paths instead.

## Project-local scaffolding

Prefer keeping workflow-loop scaffolding inside the project repo/worktree, under a hidden directory:

```text
.openclaw/workflows/<workflow-id>/
```

A project-specific hidden directory is also fine when it is already established, for example:

```text
.classic/workflows/<workflow-id>/
```

Project-local state has a practical advantage: another machine or agent can find the current loop state next to the branch, commits, and project docs. It prevents orchestration state from living only in one session's memory.

The cost is repo noise, so keep the scaffolding disciplined. Commit or preserve compact state, redacted summaries, handoff notes, and evidence links. Do not commit raw transcripts, raw worker result files with stdout/stderr tails, large logs, temporary scratch files, generated artifacts, or sensitive/private material unless they are intentionally promoted as durable evidence.

Every scaffolding root should include a short `README.md` explaining what the directory is for, plus a local `.gitignore` for noisy subdirectories such as `logs/`, `tmp/`, and `artifacts/`. If the parent repo ignores the whole hidden scaffolding directory, add explicit exceptions for the root docs, workflow directories, `state.json`, and redacted `*.summary.json` summaries so durable handoff evidence is not silently dropped. Raw `*.result.json` files should usually stay ignored when they contain stdout/stderr tails, diffs, prompts, or local-only details.

## Machine-readable state

Each workflow should have durable state in the project repo, for example:

```text
.classic/workflows/classic-r42-text-response-001/state.json
```

Record at least:

- workflow id;
- phase and status;
- branch;
- PR number and URL when available;
- latest worker result path;
- latest wake result;
- Discord thread id;
- commits and merge commit;
- review/fix iteration counts;
- timestamps.

The thread is the human ledger. The state file is the machine-readable truth. Keep it synced with actual repo/PR state before committing, reviewing, or resuming workflow scaffolding. Store tracked ledger paths relative to the repo root so another clone or container can resume the workflow. If a worker footer records a sentinel such as `pr=none`, treat it as unknown and fall back to later top-level or event PR metadata; sentinels and non-PR URLs must not mask durable PR state.

## Wakeback contract

Workers should emit an immediate system event to the orchestrator's canonical
session key when they finish.

Use a canonical session key such as:

```text
agent:codex:discord:channel:1518724179296387144
```

Do not use aliases like `current` from detached worker contexts.

Wake text should be actionable:

```text
PROJECT workflow <id> phase <phase> finished: status=<status> branch=<branch> pr=<pr> commit=<commit>. State: <statePath>. Result: <resultPath>. IMPORTANT HEARTBEAT ACTION: notify=true with a concise status, then inspect result/state and advance exactly one workflow transition.
```

An accepted wake is not the same as a delivered wake. The loop passes only when
the orchestrator actually resumes from the wake and acts from that delivered
turn.

## Review/fix loop

Before calling a branch PR-ready, the orchestrator should run an explicit review
pass.

Use the best available review surface:

- `/review` when available in the current OpenClaw/Codex surface;
- `codex review` or an equivalent CLI/harness reviewer;
- a separate reviewer worker;
- direct parent-side review for very small diffs.

Findings become workflow transitions:

- valid bug → focused fix phase;
- questionable finding → inspect and accept or reject with evidence;
- false positive → record why it is non-blocking;
- unresolved or risky issue → stop and request human intervention.

Continue implementation → review → fix → retest until relevant bugs are
resolved, explicitly judged non-blocking, or blocked for human input.

## Merge policy

Opening a PR is not the end of a workflow loop.

A PR is ready only after:

- orchestrator inspection;
- relevant local gates;
- review/fix iterations;
- CI/check status;
- any project-specific privacy or asset guards.

Do not merge unless the user has explicitly approved merging, or the project has
a separate narrow auto-merge policy.

## Skills

Workflow loops are a good use case for skills because the orchestrator behavior
is procedural and reusable across projects.

A workflow-loop skill should cover:

- trigger phrases;
- thread creation and milestone updates;
- canonical wakeback rules;
- worker prompt contracts;
- review/fix policy;
- verification gates;
- state hygiene;
- parallel-loop discipline.

See also:

- [Sub-agents](/tools/subagents)
- [Skill Workshop](/tools/skill-workshop)
- [Heartbeat](/gateway/heartbeat)
- [Agent loop](/concepts/agent-loop)
