import { resolveControlUiAuthCandidates } from "../control-ui-auth.ts";
import { normalizeBasePath } from "../navigation.ts";

export type SystemPromptPreviewState = {
  basePath: string;
  hello?: { auth?: { deviceToken?: string | null } | null } | null;
  settings?: { token?: string | null } | null;
  password?: string | null;
  systemPromptPreview: string;
  systemPromptPreviewLoading: boolean;
  systemPromptPreviewError: string | null;
};

type SystemPromptPreviewResponse = {
  ok?: boolean;
  prompt?: unknown;
  warnings?: unknown;
  error?: unknown;
};

function normalizeErrorMessage(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }
  return "System prompt preview failed.";
}

export async function loadSystemPromptPreview(
  state: SystemPromptPreviewState,
  systemPrompt: Record<string, unknown>,
) {
  if (typeof fetch !== "function") {
    return;
  }
  const basePath = normalizeBasePath(state.basePath ?? "");
  const url = basePath ? `${basePath}/api/system-prompt/preview` : "/api/system-prompt/preview";
  const authCandidates = resolveControlUiAuthCandidates(state);
  const attempts = authCandidates.length > 0 ? authCandidates : [""];
  state.systemPromptPreviewLoading = true;
  state.systemPromptPreviewError = null;
  try {
    let response: Response | null = null;
    for (const candidate of attempts) {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (candidate) {
        headers.Authorization = `Bearer ${candidate}`;
      }
      response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: JSON.stringify({ systemPrompt }),
      });
      if (response.ok || (response.status !== 401 && response.status !== 403)) {
        break;
      }
    }
    if (!response) {
      throw new Error("System prompt preview failed.");
    }
    let parsed: SystemPromptPreviewResponse | null = null;
    try {
      parsed = (await response.json()) as SystemPromptPreviewResponse;
    } catch {
      parsed = null;
    }
    if (!response.ok || parsed?.ok === false) {
      throw new Error(normalizeErrorMessage(parsed?.error ?? response.statusText));
    }
    state.systemPromptPreview = typeof parsed?.prompt === "string" ? parsed.prompt : "";
    state.systemPromptPreviewError = null;
  } catch (err) {
    state.systemPromptPreviewError = String(err);
  } finally {
    state.systemPromptPreviewLoading = false;
  }
}
