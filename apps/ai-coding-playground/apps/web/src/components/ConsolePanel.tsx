import { SandboxResponse } from "@ai-playground/shared";
import styles from "../styles/panels.module.css";

interface Props {
  title: string;
  result: SandboxResponse | null;
}

export function ConsolePanel({ title, result }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{title}</h3>
        <span className={styles.panelSubtitle}>{result ? `${result.runtimeMs} ms` : "Waiting"}</span>
      </div>
      {result ? (
        <div className={styles.stack}>
          <div>
            <strong>stdout</strong>
            <div className={styles.mono}>{result.stdout || "(empty)"}</div>
          </div>
          <div>
            <strong>stderr</strong>
            <div className={styles.mono}>{result.stderr || "(empty)"}</div>
          </div>
          <div>
            <strong>Tests</strong>
            {result.tests.length === 0 ? (
              <p className={styles.muted}>No tests executed.</p>
            ) : (
              <ul className={styles.scoreList}>
                {result.tests.map((test) => (
                  <li key={test.name} className={styles.scoreItem}>
                    <span>{test.passed ? "✅" : "❌"}</span>
                    <span>{test.name}</span>
                    {!test.passed && <span className={styles.muted}>{test.error}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <p className={styles.muted}>Run code to see console output.</p>
      )}
    </div>
  );
}
