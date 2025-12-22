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
  onClear: () => void;
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
  onClear,
}: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>Panel de IA</h3>
          <p className={styles.panelSubtitle}>Salida estructurada obligatoria</p>
        </div>
        <div className={styles.statusRow}>
          <label className={styles.muted}>
            <input
              type="checkbox"
              checked={stream}
              onChange={(e) => onStreamToggle(e.target.checked)}
            />
            &nbsp;Transmisión en vivo
          </label>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.stack}>
          <label>
            <span className={styles.panelSubtitle}>Proveedor</span>
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
            <span className={styles.panelSubtitle}>
              Modo
              <span className={styles.infoIcon} style={{ cursor: 'help' }}>
                i
                <div className={styles.tooltip}>
                  <strong>Generar:</strong> Crea nuevo código o mejora el existente.<br /><br />
                  <strong>Explicar fallo:</strong> Analiza errores y propone soluciones.
                </div>
              </span>
            </span>
            <select
              className={styles.select}
              value={mode}
              onChange={(e) => onModeChange(e.target.value as AiRequestBody["mode"])}
            >
              <option value="generate">Generar</option>
              <option value="explain_failure">Explicar fallo</option>
            </select>
          </label>
        </div>
        <div className={styles.stack}>
          <label>
            <span className={styles.panelSubtitle}>Instrucciones (Prompt)</span>
            <textarea
              className={styles.textarea}
              rows={6}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe qué quieres que haga la IA"
            />
          </label>
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={onSubmit} disabled={isLoading}>
              {isLoading ? "Pensando..." : "Preguntar a la IA"}
            </button>
            <button className={`${styles.button} ${styles.warning}`} onClick={onClear} disabled={isLoading}>
              Limpiar Todo
            </button>
          </div>
          <span className={styles.muted}>
            Las claves de API están seguras en el servidor.
          </span>
        </div>
      </div>

      {streamPreview && (
        <div style={{ marginTop: '20px' }}>
          <strong>Vista previa de la IA:</strong>
          <p className={styles.mono}>{streamPreview}</p>
        </div>
      )}

      {aiResponse && (
        <div className={styles.stack} style={{ borderTop: '1px solid var(--p-border)', paddingTop: '20px', marginTop: '20px' }}>
          <div className={styles.statusRow}>
            <span className={`${styles.chip} ${styles.success}`}>Complejidad: {aiResponse.complexity || "desconocida"}</span>
            <span className={styles.chip}>Pruebas sugeridas: {aiResponse.tests.length}</span>
          </div>
          <div>
            <strong>Explicación</strong>
            <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{aiResponse.explanation}</p>
          </div>
          {aiResponse.notes.length > 0 && (
            <div>
              <strong>Notas adicionales</strong>
              <ul className={styles.list} style={{ marginTop: '8px' }}>
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
