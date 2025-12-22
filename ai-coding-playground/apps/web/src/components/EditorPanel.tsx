import { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import styles from "../styles/panels.module.css";

interface Props {
  title: string;
  code: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number;
}

const defaultOptions = {
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
};

export function EditorPanel({ title, code, onChange, readOnly = false, height = 380 }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{title === "My solution" ? "Mi solución" : "Solución de la IA"}</h3>
      </div>
      <Editor
        height="400px"
        defaultLanguage="javascript"
        value={code}
        onChange={(v) => onChange?.(v ?? "")}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          roundedSelection: true,
        }}
        onMount={(editor, monaco: Monaco) => {
          editor.addAction({
            id: "format",
            label: "Formatear Documento", // Translated label
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
            run: () => editor.getAction("editor.action.formatDocument")?.run(),
          });
        }}
      />
    </div>
  );
}
