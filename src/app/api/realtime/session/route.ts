import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asText(value: unknown, maxLength = 4000): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function buildInstructions(agent: Record<string, unknown>): string {
  const config = asRecord(agent.configurations);
  const behavior = asRecord(config.behavior);
  const stt = asRecord(config.stt);
  const knowledge = (Array.isArray(agent.knowledgeBase) ? agent.knowledgeBase : [])
    .map(item => asText(asRecord(item).content, 24000))
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 24000);

  return [
    `You are ${asText(agent.name, 120) || "the business"}'s voice assistant.`,
    asText(agent.description),
    `Language: ${asText(stt.language, 80) || "en-US"}. Respond naturally in the user's language.`,
    `Tone: ${asText(behavior.toneOfVoice, 120) || "professional"}.`,
    `Style: ${asText(behavior.assistantStyle, 240) || "helpful and concise"}.`,
    "Use the supplied company knowledge as the source of truth. If the answer is not present, say that you do not have enough information instead of inventing facts.",
    knowledge ? `COMPANY KNOWLEDGE:\n${knowledge}` : "",
  ].filter(Boolean).join("\n\n");
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const bearer = authorization.match(/^Bearer\s+(.+)$/i);
    if (!bearer) {
      return NextResponse.json({ error: "Sign in to start a voice test." }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(bearer[1]);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Your sign-in has expired. Please sign in again." }, { status: 401 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 220_000) {
      return NextResponse.json({ error: "The voice session request is too large." }, { status: 413 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid voice session request." }, { status: 400 });
    }

    const agentId = typeof body.agentId === "string" ? body.agentId.trim() : "";
    const sdp = typeof body.sdp === "string" ? body.sdp : "";
    if (!agentId || agentId.length > 256 || agentId.includes("/") || !sdp || sdp.length > 200_000) {
      return NextResponse.json({ error: "A valid agent and WebRTC offer are required." }, { status: 400 });
    }

    const agentSnapshot = await adminDb.collection("agents").doc(agentId).get();
    if (!agentSnapshot.exists) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const agent = agentSnapshot.data() as Record<string, unknown>;
    const ownerId = typeof agent.userId === "string" ? agent.userId : agent.ownerId;
    if (ownerId !== uid) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured on the server." }, { status: 503 });
    }

    const model = process.env.OPENAI_LIVE_MODEL || "gpt-live-1";
    const upstream = await fetch("https://api.openai.com/v1/live/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: { model, instructions: buildInstructions(agent) },
        transport: { type: "webrtc", sdp },
      }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      console.error("GPT-Live session creation failed:", upstream.status);
      return NextResponse.json(
        { error: "Could not create the voice session. Check the server API key and model settings." },
        { status: 502 }
      );
    }

    const session = asRecord(asRecord(data).session);
    const transport = asRecord(asRecord(data).transport);
    if (typeof session.id !== "string" || typeof transport.sdp !== "string") {
      console.error("GPT-Live returned an unexpected session response.");
      return NextResponse.json({ error: "The voice provider returned an invalid session response." }, { status: 502 });
    }

    return NextResponse.json(
      { sessionId: session.id, transport: { sdp: transport.sdp } },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Voice session setup failed:", error);
    return NextResponse.json({ error: "Failed to initialize the voice session." }, { status: 500 });
  }
}
