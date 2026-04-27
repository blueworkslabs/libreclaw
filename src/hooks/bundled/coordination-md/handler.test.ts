import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../../../config/config.js";
import { makeTempWorkspace, writeWorkspaceFile } from "../../../test-helpers/workspace.js";
import type { AgentBootstrapHookContext } from "../../hooks.js";
import { createHookEvent } from "../../hooks.js";
import handler from "./handler.js";

function createCoordinationConfig(enabled = true): OpenClawConfig {
  return {
    hooks: {
      internal: {
        entries: {
          "coordination-md": { enabled },
        },
      },
    },
  };
}

async function createBootstrapContext(params: {
  workspaceDir: string;
  cfg: OpenClawConfig;
  sessionKey: string;
  rootFiles: Array<{ name: string; content: string }>;
}): Promise<AgentBootstrapHookContext> {
  const bootstrapFiles = (await Promise.all(
    params.rootFiles.map(async (file) => ({
      name: file.name,
      path: await writeWorkspaceFile({
        dir: params.workspaceDir,
        name: file.name,
        content: file.content,
      }),
      content: file.content,
      missing: false,
    })),
  )) as AgentBootstrapHookContext["bootstrapFiles"];
  return {
    workspaceDir: params.workspaceDir,
    bootstrapFiles,
    cfg: params.cfg,
    sessionKey: params.sessionKey,
  };
}

describe("coordination-md hook", () => {
  it("injects COORDINATION.md when present", async () => {
    const tempDir = await makeTempWorkspace("openclaw-coordination-md-");
    await fs.writeFile(path.join(tempDir, "COORDINATION.md"), "shared plan", "utf-8");
    const context = await createBootstrapContext({
      workspaceDir: tempDir,
      cfg: createCoordinationConfig(),
      sessionKey: "agent:main:main",
      rootFiles: [{ name: "AGENTS.md", content: "root agents" }],
    });

    const event = createHookEvent("agent", "bootstrap", "agent:main:main", context);
    await handler(event);

    const injected = context.bootstrapFiles.find((file) => file.content === "shared plan");
    expect(injected?.path.endsWith("COORDINATION.md")).toBe(true);
  });

  it("does nothing when disabled", async () => {
    const tempDir = await makeTempWorkspace("openclaw-coordination-md-disabled-");
    await fs.writeFile(path.join(tempDir, "COORDINATION.md"), "shared plan", "utf-8");
    const context = await createBootstrapContext({
      workspaceDir: tempDir,
      cfg: createCoordinationConfig(false),
      sessionKey: "agent:main:main",
      rootFiles: [{ name: "AGENTS.md", content: "root agents" }],
    });

    const event = createHookEvent("agent", "bootstrap", "agent:main:main", context);
    await handler(event);

    expect(context.bootstrapFiles.some((file) => file.path.endsWith("COORDINATION.md"))).toBe(
      false,
    );
  });

  it("deduplicates an already injected COORDINATION.md", async () => {
    const tempDir = await makeTempWorkspace("openclaw-coordination-md-dedupe-");
    const coordinationPath = path.join(tempDir, "COORDINATION.md");
    await fs.writeFile(coordinationPath, "shared plan", "utf-8");
    const context = await createBootstrapContext({
      workspaceDir: tempDir,
      cfg: createCoordinationConfig(),
      sessionKey: "agent:main:main",
      rootFiles: [{ name: "AGENTS.md", content: "root agents" }],
    });
    context.bootstrapFiles.push({
      name: "COORDINATION.md" as AgentBootstrapHookContext["bootstrapFiles"][number]["name"],
      path: await fs.realpath(coordinationPath),
      content: "shared plan",
      missing: false,
    });

    const event = createHookEvent("agent", "bootstrap", "agent:main:main", context);
    await handler(event);

    expect(context.bootstrapFiles.filter((file) => file.path.endsWith("COORDINATION.md"))).toHaveLength(
      1,
    );
  });
});
