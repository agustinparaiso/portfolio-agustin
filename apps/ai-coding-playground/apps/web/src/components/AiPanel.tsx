import { AiRequestBody, StructuredAiOutput } from "@ai-playground/shared";
import styles from "../styles/panels.module.css";

interface Props {
  provider: AiRequestBody["provider"];
  mode: AiRequestBody["mode"];
  prompt: string;
  stream: boolean;
  isLoading: boolean;
  streamPreview: string;
  aiResponse: StructuredAiOutput | null;
  onProviderChange: (provider: AiRequestBody["provider"]) => void;
  onModeChange: (mode: AiRequestBody["mode"]) => void;
  onPromptChange: (value: string) => void;
  onStreamToggle: (value: boolean) => void;
  onSubmit: () => void;
}

export function AiPanel({
  provider,
  mode,
  prompt,
  stream,
  isLoading,
  streamPreview,
  aiResponse,
  onProviderChange,
  onModeChange,
  onPromptChange,
  onStreamToggle,
  onSubmit,
}: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>AI Panel</h3>
          <p className={styles.panelSubtitle}>Structured JSON output enforced</p>
        </div>
        <div className={styles.statusRow}>
          <label>
            <input
              type="checkbox"
              checked={stream}
              onChange={(e) => onStreamToggle(e.target.checked)}
            />
            &nbsp;Streaming
          </label>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.stack}>
          <label>
            <span>Provider</span>
            <select
              className={styles.select}
              value={provider}
              onChange={(e) => onProviderChange(e.target.value as AiRequestBody["provider"])}
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </label>
          <label>
            <span>Mode</span>
            <select
              className={styles.select}
              value={mode}
              onChange={(e) => onModeChange(e.target.value as AiRequestBody["mode"])}
            >
              <option value="generate">Generate</option>
              <option value="compare">Compare</option>
              <option value="explain_failure">Explain failure</option>
            </select>
          </label>
        </div>
        <div className={styles.stack}>
          <label>
            <span>Prompt</span>
            <textarea
              className={styles.textarea}
              rows={6}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe what you want the AI to do"
            />
          </label>
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={onSubmit} disabled={isLoading}>
              {isLoading ? "Thinking..." : "Ask AI"}
            </button>
            <span className={styles.muted}>
              Responses are proxied through the API; keys never reach the client.
            </span>
          </div>
        </div>
      </div>

      {streamPreview && (
        <div>
          <strong>Streaming</strong>
          <p className={styles.mono}>{streamPreview}</p>
        </div>
      )}

      {aiResponse && (
        <div className={styles.stack}>
          <div className={styles.statusRow}>
            <span className={styles.chip}>Complexity: {aiResponse.complexity || "unknown"}</span>
            <span className={styles.chip}>Tests suggested: {aiResponse.tests.length}</span>
          </div>
          <div>
            <strong>Explanation</strong>
            <p>{aiResponse.explanation}</p>
          </div>
          {aiResponse.notes.length > 0 && (
            <div>
              <strong>Notes</strong>
              <ul className={styles.list}>
                {aiResponse.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
