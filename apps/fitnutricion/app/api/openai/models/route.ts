import { NextResponse } from "next/server";
import { getOpenAIClient } from "../../../../lib/openai";

let cache: { data: string[]; expires: number } | null = null;

export async function GET() {
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json({ models: cache.data, cached: true });
  }
  try {
    const client = await getOpenAIClient();
    const list = await client.models.list();
    const models = list.data.map((m: any) => m.id).filter((id: string) => id.toLowerCase().includes("gpt"));
    cache = { data: models, expires: Date.now() + 10 * 60 * 1000 };
    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json({ models: ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini"], error: error?.message }, { status: 200 });
  }
}
