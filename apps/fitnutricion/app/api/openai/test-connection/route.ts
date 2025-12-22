import { NextResponse } from "next/server";
import { getOpenAIClient } from "../../../../../lib/openai";

export async function POST() {
  try {
    const client = await getOpenAIClient();
    const models = await client.models.list({ limit: 1 });
    return NextResponse.json({ ok: true, sample: models.data[0]?.id });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message });
  }
}
