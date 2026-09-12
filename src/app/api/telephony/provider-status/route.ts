import { NextResponse } from "next/server";

export async function GET() {
  const provider = (process.env.TELEPHONY_PROVIDER || "exotel").toLowerCase();
  const configured =
    provider === "exotel"
      ? Boolean(process.env.EXOTEL_SID && process.env.EXOTEL_TOKEN)
      : Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

  return NextResponse.json({
    provider,
    configured,
    capabilities: {
      dedicatedNumberProvisioning: configured,
      inboundCalling: configured,
      outboundCalling: configured,
      usageMetering: configured,
      existingNumberForwarding: configured,
    },
  });
}
