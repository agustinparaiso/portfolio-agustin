import vm from "node:vm";
import { performance } from "node:perf_hooks";
import { RunRequestBody, SandboxResponse, SandboxTestResult } from "@ai-playground/shared";

const SANDBOX_TIMEOUT_MS = 1000;
const MAX_CODE_SIZE = 20_000;

export class SandboxError extends Error {
  code: string;
  constructor(message: string, code = "SANDBOX_ERROR") {
    super(message);
    this.code = code;
  }
}

export function runInSandbox({ code, tests = [] }: RunRequestBody): SandboxResponse {
  if (code.length > MAX_CODE_SIZE) {
    throw new SandboxError("Code payload too large", "CODE_TOO_LARGE");
  }

  const stdout: string[] = [];
  const stderr: string[] = [];

  const consoleMock = {
    log: (...args: unknown[]) => stdout.push(args.map(String).join(" ")),
    error: (...args: unknown[]) => stderr.push(args.map(String).join(" ")),
    assert: (condition: unknown, ...args: unknown[]) => {
      if (!condition) {
        throw new Error(`Assertion failed${args.length > 0 ? ": " + args.map(String).join(" ") : ""}`);
      }
    },
  };

  const sandbox: Record<string, unknown> = {
    console: consoleMock,
    assert: consoleMock.assert, // Provide as global too
    setTimeout,
    clearTimeout,
  };

  const context = vm.createContext(sandbox, { name: "playground" });

  const script = new vm.Script(code, { displayErrors: true });

  const start = performance.now();
  try {
    script.runInContext(context, { timeout: SANDBOX_TIMEOUT_MS });
  } catch (error: any) {
    stderr.push(String(error?.message ?? error));
    return {
      stdout: stdout.join("\n"),
      stderr: stderr.join("\n"),
      tests: [],
      runtimeMs: Math.round(performance.now() - start),
    };
  }

  const results: SandboxTestResult[] = [];

  for (const test of tests) {
    const testName = test.slice(0, 60) || "test";
    try {
      const testScript = new vm.Script(test, { displayErrors: true });
      testScript.runInContext(context, { timeout: SANDBOX_TIMEOUT_MS });
      results.push({ name: testName, passed: true, error: null });
    } catch (error: any) {
      results.push({
        name: testName,
        passed: false,
        error: error?.message ?? String(error),
      });
    }
  }

  const runtimeMs = Math.round(performance.now() - start);

  return {
    stdout: stdout.join("\n"),
    stderr: stderr.join("\n"),
    tests: results,
    runtimeMs,
  };
}
