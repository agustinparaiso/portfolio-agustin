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
        <h3 className={styles.panelTitle}>{title}</h3>
        {readOnly && <span className={styles.badge}>AI</span>}
      </div>
      <Editor
        height={height}
        language="javascript"
        theme="vs-light"
        value={code}
        options={{ ...defaultOptions, readOnly }}
        onChange={(value) => onChange?.(value ?? "")}
        onMount={(editor, monaco: Monaco) => {
          editor.addAction({
            id: "format",
            label: "Format Document",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
            run: () => editor.getAction("editor.action.formatDocument")?.run(),
          });
        }}
      />
    </div>
  );
}
