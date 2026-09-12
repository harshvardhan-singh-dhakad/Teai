import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured on the server." }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-1.5";
    const instructions = typeof body.instructions === "string" ? body.instructions : undefined;

    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          ...(instructions ? { instructions } : {}),
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Unable to create realtime session." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      clientSecret: data?.value || data?.client_secret?.value || data?.client_secret,
      expiresAt: data?.expires_at,
      model,
    });
  } catch (error) {
    console.error("Realtime session error:", error);
    return NextResponse.json({ error: "Failed to initialize realtime voice session." }, { status: 500 });
  }
}
