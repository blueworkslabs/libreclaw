import { describe, expect, it } from "vitest";
import { AgentDefaultsSchema } from "./zod-schema.agent-defaults.js";

describe("agents.defaults.systemPrompt config", () => {
  it("accepts supported Prompt Studio customization fields", () => {
    const parsed = AgentDefaultsSchema.parse({
      embeddedHarness: {},
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
      embeddedHarness: {},
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
