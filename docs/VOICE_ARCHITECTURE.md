# Teai Voice Architecture

## Product modes

### 1. Business AI Agent
Create agent → add website/files/company knowledge → free browser voice test → Ready to Launch → choose paid plan → Razorpay verification → telephony activation → live.

### 2. AI Call Assistant (Equal-style)
Connect an existing phone number through supported forwarding/telephony configuration. The assistant can:
- answer and screen incoming calls
- identify caller intent
- use the company's/person's approved knowledge
- provide call transcript and summary
- capture follow-up/action items
- allow human takeover/escalation
- apply caller/routing rules
- keep call history and usage

Equal AI's public product flow uses call forwarding and provides caller intent, call capture, summaries/action follow-up, and takeover-style assistant behavior. This repository implements the product concept without copying Equal's proprietary implementation.

## Voice architecture

GPT-Live-1 is the real-time voice layer. It handles full-duplex listening/speaking, interruptions, turn detection and telephony. Deeper reasoning and tools remain in the backend.

```
Telephone/Browser
      ↓
Exotel / supported telephony
      ↓
GPT-Live-1
      ↓
Teai Agent
      ↓
Knowledge Retrieval Tool
      ↓
Firebase/Firestore + existing knowledge pipeline
      ↓
Relevant company knowledge
      ↓
GPT-Live-1
      ↓
Spoken response
```

The Knowledge Base is mandatory for company-specific answers. GPT-Live-1 must not invent company facts. When a question requires company/product/service information, the agent should retrieve relevant knowledge and answer only from retrieved/approved context. If retrieval has no answer, the agent should say it does not have enough information and follow the configured fallback/escalation policy.

## Phone activation

No virtual number is provisioned during free testing.

Paid launch:
1. Razorpay payment is created and verified server-side.
2. Only after verified payment does telephony provisioning start.
3. Dedicated-number mode provisions/configures an Exotel number.
4. Existing-number mode configures the supported forwarding/telephony route.
5. The selected agent is attached to the phone route.
6. Usage, calls, transcripts and billing are recorded.

## Provider abstraction

Keep telephony behind an adapter so India can use Exotel and other regions can add Twilio or another compliant provider without changing the agent UI.

## Security

- Never expose OpenAI, Razorpay, Exotel or Twilio secrets to the browser.
- Never trust a client-side payment success state; use server-side verification/webhooks.
- Scope agents, knowledge and calls by authenticated workspace/user.
- Do not provision paid telephony from the client.
