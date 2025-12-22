import { AiRequestBody, RunRequestBody, SandboxResponse, StructuredAiOutput } from "@ai-playground/shared";

export async function runCode(payload: RunRequestBody): Promise<SandboxResponse> {
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error?.message ?? "Failed to run code");
  }

  return res.json();
}

export async function requestAi(
  payload: AiRequestBody,
  onChunk?: (text: string) => void
): Promise<StructuredAiOutput> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(payload),
  });

  if (payload.stream) {
    if (!res.body) throw new Error("Streaming not supported by browser");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalPayload: StructuredAiOutput | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const [eventLine, ...rest] = event.split("\n");
        const dataLine = rest.find((line) => line.startsWith("data:")) ?? "";
        const eventName = eventLine.replace("event: ", "").trim();
        const data = dataLine.replace("data: ", "");

        if (eventName === "chunk") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) onChunk?.(parsed.text);
          } catch (error) {
            console.error("Failed to parse chunk", error);
          }
        }

        if (eventName === "final") {
          finalPayload = JSON.parse(data) as StructuredAiOutput;
        }
      }
    }

    if (!finalPayload) {
      throw new Error("No final payload received from stream");
    }

    return finalPayload;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error?.message ?? "AI request failed");
  }

  return res.json();
}
