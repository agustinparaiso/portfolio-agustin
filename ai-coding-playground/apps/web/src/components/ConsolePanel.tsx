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
        {result && <span className={styles.badge}>{result.runtimeMs}ms</span>}
      </div>

      {!result ? (
        <p className={styles.muted}>Ejecuta el código para ver los resultados aquí.</p>
      ) : (
        <div className={styles.stack}>
          {result.stdout && (
            <div>
              <strong className={styles.panelSubtitle}>Salida estándar (STDOUT)</strong>
              <pre className={styles.mono}>{result.stdout}</pre>
            </div>
          )}
          {result.stderr && (
            <div>
              <strong className={styles.panelSubtitle} style={{ color: 'var(--p-danger)' }}>Errores (STDERR)</strong>
              <pre className={styles.mono} style={{ color: '#fda4af' }}>{result.stderr}</pre>
            </div>
          )}

          {result.tests.length > 0 && (
            <div>
              <strong className={styles.panelSubtitle}>Pruebas</strong>
              <div className={styles.scoreList} style={{ marginTop: '8px' }}>
                {result.tests.map((test, i) => (
                  <div key={i} className={styles.scoreItem}>
                    <span className={test.passed ? styles.chip : `${styles.chip} ${styles.warning}`}>
                      {test.passed ? "✅" : "❌"}
                    </span>
                    <div className={styles.stack} style={{ gap: '2px' }}>
                      <code style={{ fontSize: '12px', opacity: 0.8 }}>{test.name}</code>
                      {test.error && <small style={{ color: 'var(--p-danger)' }}>{test.error}</small>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
