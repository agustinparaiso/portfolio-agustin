import { useMemo, useState } from "react";
import { AiRequestBody, SandboxResponse, StructuredAiOutput } from "@ai-playground/shared";
import { EditorPanel } from "./components/EditorPanel";
import { ConsolePanel } from "./components/ConsolePanel";
import { AiPanel } from "./components/AiPanel";
import { requestAi, runCode } from "./lib/api";
import layout from "./App.module.css";
import styles from "./styles/panels.module.css";

const starterCode = `// Write a simple function to reverse a string
function reverse(input) {
  return input.split('').reverse().join('');
}

console.log('reverse(hello):', reverse('hello'));
`;

function App() {
  const [provider, setProvider] = useState<AiRequestBody["provider"]>("openai");
  const [mode, setMode] = useState<AiRequestBody["mode"]>("generate");
  const [prompt, setPrompt] = useState(
    "Generate an improved implementation and tests for reversing strings."
  );
  const [userCode, setUserCode] = useState(starterCode);
  const [aiResponse, setAiResponse] = useState<StructuredAiOutput | null>(null);
  const [aiCode, setAiCode] = useState("");
  const [streamPreview, setStreamPreview] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [stream, setStream] = useState(true);
  const [runResult, setRunResult] = useState<SandboxResponse | null>(null);
  const [aiRunResult, setAiRunResult] = useState<SandboxResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testsFromAi = useMemo(() => aiResponse?.tests ?? [], [aiResponse]);

  const handleAskAi = async () => {
    setIsThinking(true);
    setErrorMessage(null);
    setStreamPreview("");
    try {
      const response = await requestAi(
        {
          provider,
          mode,
          prompt,
          userCode,
          language: "javascript",
          stream,
        },
        (chunk) => setStreamPreview((prev) => prev + chunk)
      );
      setAiResponse(response);
      setAiCode(response.code);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "AI request failed");
    } finally {
      setIsThinking(false);
    }
  };

  const handleRunUser = async () => {
    setErrorMessage(null);
    try {
      const result = await runCode({ code: userCode, tests: testsFromAi });
      setRunResult(result);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Failed to run code");
    }
  };

  const handleRunAi = async () => {
    if (!aiCode) return;
    setErrorMessage(null);
    try {
      const result = await runCode({ code: aiCode, tests: testsFromAi });
      setAiRunResult(result);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Failed to run AI code");
    }
  };

  const handleNewTask = () => {
    setPrompt("");
    setAiResponse(null);
    setAiCode("");
    setStreamPreview("");
    setAiRunResult(null);
  };


  return (
    <div className={layout.container}>
      <div className={layout.actionBar}>
        <button className={`${styles.button} ${styles.warning}`} onClick={handleNewTask}>
          Nueva Tarea
        </button>
        <button className={styles.button} onClick={handleRunUser}>
          Ejecutar mi código
        </button>
        <button className={`${styles.button} ${styles.secondary}`} onClick={handleRunAi} disabled={!aiCode}>
          Ejecutar código de IA
        </button>
      </div>

      <header className={layout.header}>
        <div>
          <h1 className={layout.title}>Laboratorio de Código IA</h1>
          <p className={layout.lead}>
            Editor + Guía de IA + Ejecución segura con JSON estructurado.
          </p>
        </div>
      </header>

      {errorMessage && <div className={styles.chip}>⚠️ {errorMessage}</div>}

      <div style={{ marginBottom: "20px" }}>
        <AiPanel
          provider={provider}
          mode={mode}
          prompt={prompt}
          stream={stream}
          isLoading={isThinking}
          streamPreview={streamPreview}
          aiResponse={aiResponse}
          onProviderChange={setProvider}
          onModeChange={setMode}
          onPromptChange={setPrompt}
          onStreamToggle={setStream}
          onSubmit={handleAskAi}
          onClear={handleNewTask}
        />
      </div>

      <div className={styles.gridTwo}>
        <EditorPanel title="My solution" code={userCode} onChange={setUserCode} />
        <ConsolePanel title="My Console & tests" result={runResult} />
      </div>

      <div className={styles.gridTwo}>
        <EditorPanel title="AI solution" code={aiCode || "// Ask the AI to populate this"} readOnly />
        <ConsolePanel title="AI execution" result={aiRunResult} />
      </div>
    </div>
  );
}

export default App;
