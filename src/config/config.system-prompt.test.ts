import { describe, expect, it } from "vitest";
import { resolveSystemPromptConfig } from "../agents/system-prompt-override.js";
import { AgentDefaultsSchema } from "./zod-schema.agent-defaults.js";
import { AgentEntrySchema } from "./zod-schema.agent-runtime.js";

describe("agents.defaults.systemPrompt config", () => {
  it("accepts supported Prompt Studio customization fields", () => {
    const parsed = AgentDefaultsSchema.parse({
      embeddedAgent: {},
      contextLimits: {},
      memorySearch: {},
      heartbeat: {},
      systemPrompt: {
        mode: "default",
        safetyStyle: "libreclaw",
        prepend: "Before",
        append: "After",
        removeSections: ["safety", "project_context"],
        allowUnsafeReplace: false,
      },
    });

    expect(parsed.systemPrompt?.removeSections).toEqual(["safety", "project_context"]);
  });

  it("rejects unknown system prompt section IDs", () => {
    const result = AgentDefaultsSchema.safeParse({
      embeddedAgent: {},
      contextLimits: {},
      memorySearch: {},
      heartbeat: {},
      systemPrompt: {
        removeSections: ["not_a_section"],
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Invalid system prompt section ID");
  });
});

describe("agents.list systemPrompt config", () => {
  it("accepts per-agent prompt overrides and Prompt Studio customization fields", () => {
    const parsed = AgentEntrySchema.parse({
      id: "codex",
      systemPromptOverride: "Replace the prompt for this agent.",
      systemPrompt: {
        mode: "replace",
        safetyStyle: "openclaw",
        prepend: "Agent-specific before",
        append: "Agent-specific after",
        removeSections: ["skills", "runtime"],
        allowUnsafeReplace: true,
      },
    });

    expect(parsed.systemPromptOverride).toBe("Replace the prompt for this agent.");
    expect(parsed.systemPrompt?.removeSections).toEqual(["skills", "runtime"]);
  });

  it("rejects unknown per-agent system prompt section IDs", () => {
    const result = AgentEntrySchema.safeParse({
      id: "codex",
      systemPrompt: {
        removeSections: ["not_a_section"],
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Invalid system prompt section ID");
  });

  it("uses per-agent prompt customization at runtime when an agent id is provided", () => {
    const resolved = resolveSystemPromptConfig({
      agentId: "codex",
      config: {
        agents: {
          defaults: {
            systemPrompt: {
              append: "Global",
            },
          },
          list: [
            {
              id: "codex",
              systemPrompt: {
                append: "Per-agent",
                removeSections: ["skills"],
              },
            },
          ],
        },
      },
    });

    expect(resolved?.append).toBe("Per-agent");
    expect(resolved?.removeSections).toEqual(["skills"]);
  });

  it("falls back to default prompt customization when the agent has none", () => {
    const resolved = resolveSystemPromptConfig({
      agentId: "codex",
      config: {
        agents: {
          defaults: {
            systemPrompt: {
              append: "Global",
            },
          },
          list: [
            {
              id: "codex",
            },
          ],
        },
      },
    });

    expect(resolved?.append).toBe("Global");
  });
});
