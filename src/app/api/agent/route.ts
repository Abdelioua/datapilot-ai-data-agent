import { NextResponse } from "next/server";
import { runAgent as runMockAgent } from "@/lib/agent/mock-agent";
import { AgentExecutionError, hasRealAgentConfig, runRealAgent } from "@/lib/agent/real-agent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { question?: unknown };
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question || question.length > 500) return NextResponse.json({ error: "Please provide a question under 500 characters." }, { status: 400 });

    if (hasRealAgentConfig()) return NextResponse.json(await runRealAgent(question));
    return NextResponse.json(await runMockAgent(question));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The agent could not complete this request.";
    const safeMessage = message.includes("provider") || message.includes("configured") || message.includes("validation") || message.includes("query") || message.includes("rows") ? message : "The agent could not complete this request. Check the server configuration and try again.";
    return NextResponse.json({ error: safeMessage, steps: error instanceof AgentExecutionError ? error.steps : undefined }, { status: 502 });
  }
}
