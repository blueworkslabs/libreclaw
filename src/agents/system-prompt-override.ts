import type { SystemPromptConfig } from "../config/types.agent-defaults.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import { resolveAgentConfig } from "./agent-scope.js";

function trimNonEmpty(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function resolveSystemPromptOverride(params: {
  config?: OpenClawConfig;
  agentId?: string;
}): string | undefined {
  const config = params.config;
  if (!config) {
    return undefined;
  }
  const agentOverride = trimNonEmpty(
    params.agentId ? resolveAgentConfig(config, params.agentId)?.systemPromptOverride : undefined,
  );
  if (agentOverride) {
    return agentOverride;
  }
  return trimNonEmpty(config.agents?.defaults?.systemPromptOverride);
}

export function resolveSystemPromptConfig(params: {
  config?: OpenClawConfig;
  agentId?: string;
}): SystemPromptConfig | undefined {
  const config = params.config;
  if (!config) {
    return undefined;
  }
  return config.agents?.defaults?.systemPrompt;
}
