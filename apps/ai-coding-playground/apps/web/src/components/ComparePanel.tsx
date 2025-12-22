import DiffEditor from "@monaco-editor/react";
import { SandboxResponse, StructuredAiOutput } from "@ai-playground/shared";
import styles from "../styles/panels.module.css";

interface Props {
  userCode: string;
  aiCode: string;
  aiResponse: StructuredAiOutput | null;
  compareResults: {
    user?: SandboxResponse;
    ai?: SandboxResponse;
  };
  onCompare: () => void;
}

export function ComparePanel({ userCode, aiCode, aiResponse, compareResults, onCompare }: Props) {
  const testsPassed = Boolean(compareResults.user && compareResults.user.tests.every((t) => t.passed));
  const aiPassed = Boolean(compareResults.ai && compareResults.ai.tests.every((t) => t.passed));
  const edgeCases = (aiResponse?.tests.length ?? 0) > 0;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Compare</h3>
        <button className={styles.button} onClick={onCompare} disabled={!aiCode}>
          Run diff & tests
        </button>
      </div>

      {!aiCode ? (
        <p className={styles.muted}>Ask the AI for a solution to enable comparison.</p>
      ) : (
        <div className={styles.stack}>
          <DiffEditor
            height="320px"
            original={userCode}
            modified={aiCode}
            language="javascript"
            theme="vs-light"
            options={{ readOnly: true, renderSideBySide: true, minimap: { enabled: false } }}
          />

          <div>
            <strong>Scoreboard</strong>
            <ul className={styles.scoreList}>
              <li className={styles.scoreItem}>
                <span>{testsPassed ? "✅" : "⚠️"}</span>
                <span>Your code - tests {testsPassed ? "passed" : "pending/failing"}</span>
              </li>
              <li className={styles.scoreItem}>
                <span>{aiPassed ? "✅" : "⚠️"}</span>
                <span>AI code - tests {aiPassed ? "passed" : "pending/failing"}</span>
              </li>
              <li className={styles.scoreItem}>
                <span>{edgeCases ? "✅" : "⚠️"}</span>
                <span>Edge cases surfaced from AI tests</span>
              </li>
              <li className={styles.scoreItem}>
                <span>ℹ️</span>
                <span>Complexity: {aiResponse?.complexity ?? "unknown"}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
