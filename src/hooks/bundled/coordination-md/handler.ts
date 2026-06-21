import fs from "node:fs/promises";
import path from "node:path";
import type { WorkspaceBootstrapFile } from "../../../agents/workspace.js";
import { createSubsystemLogger } from "../../../logging/subsystem.js";
import { resolveHookConfig } from "../../config.js";
import type { InternalHookEvent } from "../../internal-hook-types.js";
import { isAgentBootstrapEvent } from "../../internal-hooks.js";

const HOOK_KEY = "coordination-md";
const COORDINATION_FILENAME = "COORDINATION.md";
const MAX_COORDINATION_BYTES = 2 * 1024 * 1024;
const log = createSubsystemLogger(HOOK_KEY);

function isInsideWorkspace(workspaceDir: string, filePath: string): boolean {
  const relative = path.relative(workspaceDir, filePath);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function readCoordinationFile(workspaceDir: string): Promise<WorkspaceBootstrapFile | null> {
  const workspaceReal = await fs.realpath(workspaceDir);
  const candidate = path.join(workspaceReal, COORDINATION_FILENAME);
  let fileReal: string;
  try {
    fileReal = await fs.realpath(candidate);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }
    throw err;
  }
  if (!isInsideWorkspace(workspaceReal, fileReal)) {
    log.warn(`skipping ${COORDINATION_FILENAME}: resolved path escapes workspace`);
    return null;
  }
  const stat = await fs.stat(fileReal);
  if (!stat.isFile()) {
    return null;
  }
  if (stat.size > MAX_COORDINATION_BYTES) {
    log.warn(
      `skipping ${COORDINATION_FILENAME}: file is larger than ${MAX_COORDINATION_BYTES} bytes`,
    );
    return null;
  }
  const content = await fs.readFile(fileReal, "utf-8");
  return {
    name: COORDINATION_FILENAME as WorkspaceBootstrapFile["name"],
    path: fileReal,
    content,
    missing: false,
  };
}

const coordinationMdHook = async (event: InternalHookEvent) => {
  if (!isAgentBootstrapEvent(event)) {
    return;
  }
  const context = event.context;
  const hookConfig = resolveHookConfig(context.cfg, HOOK_KEY);
  if (!hookConfig || hookConfig.enabled === false) {
    return;
  }
  try {
    const coordinationFile = await readCoordinationFile(context.workspaceDir);
    if (!coordinationFile) {
      return;
    }
    if (context.bootstrapFiles.some((file) => file.path === coordinationFile.path)) {
      return;
    }
    context.bootstrapFiles = [...context.bootstrapFiles, coordinationFile];
  } catch (err) {
    log.warn(`failed: ${String(err)}`);
  }
};

export default coordinationMdHook;
