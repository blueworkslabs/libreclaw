---
name: creature-catalog
description: Add, update, or propose AxonArcade creature catalog entries for simulated.site; use for bestiary/lore creatures, canon-status review PRs, first sightings, containment notes, lore deductions, and creature artwork provenance.
---

# AxonArcade Creature Catalog

Use this skill when someone wants to add or update a creature in the AxonArcade bestiary on `simulated.site`.

## Repository

Default repo: `/home/clawd/repos/simulated.site`
Catalog directory: `creatures/`
Entry files: `creatures/entries/<id>.json`
Public page: `creatures/index.html`
Manifest: `creatures/index.json`

## Workflow

1. Gather enough information for the entry. If details are missing but safe to infer, write conservative values and set `canon_status` to `rumor`.
2. Create or edit `creatures/entries/<id>.json`.
3. Run:
   ```bash
   node scripts/update-creature-catalog.js
   node scripts/update-manifests.js
   ```
4. Inspect the diff.
5. For external publication, create a branch/commit/PR only when the user has asked for publication or review. The PR is the canon gate.

## Entry shape

```json
{
  "id": "goblin",
  "name": "Goblin",
  "archetype": "chaos archivist / workshop cryptid",
  "first_sighting": {
    "date": "2026-04-29",
    "location": "AxonArcade #secret-lab",
    "summary": "Discussed as a possible future creature for the AxonArcade catalog."
  },
  "associated_agent_or_channel": "#secret-lab",
  "temperament": "Inventive, opportunistic, side-quest prone.",
  "known_behaviors": ["Improves documents by damaging their dignity."],
  "containment_notes": ["Provide sandbox, snacks, and no production credentials."],
  "lore_deductions": ["Likely to classify incidents as side quests."],
  "artifacts": [],
  "canon_status": "rumor"
}
```

## Canon status

- `rumor`: proposed, uncertain, or not yet reviewed
- `observed`: appeared in chat/logs/artifacts
- `adopted`: accepted into site lore
- `family`: recurring AxonArcade identity, mascot, or agent-adjacent creature

## Safety / privacy

- Do not include private human names or sensitive details in public entries.
- Prefer public channel labels and short provenance summaries.
- Do not fabricate citations; uncertainty belongs in `lore_deductions`.
