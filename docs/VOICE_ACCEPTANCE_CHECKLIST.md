# Voice Feature Acceptance Checklist

## Business Agent
- [x] Agent creation remains intact
- [x] Existing knowledge workflow remains intact
- [x] Browser voice test mode
- [x] No phone number during free test
- [x] Ready-to-launch state
- [ ] Razorpay verified webhook → telephony fulfillment
- [ ] Exotel number provisioning in production
- [ ] Attach provisioned number to selected agent

## AI Call Assistant
- [x] Separate dashboard mode
- [x] Reuse existing agent/knowledge concept
- [x] Existing-number/forwarding mode in product UX
- [x] Dedicated virtual-number mode in product UX
- [ ] Production forwarding setup per carrier/provider
- [ ] Production inbound call stream/SIP bridge
- [ ] Call recording/transcript persistence
- [ ] Caller intent classification
- [ ] Post-call summary and action items
- [ ] Human takeover/escalation
- [ ] Caller allow/block/routing rules

## GPT-Live-1
- [x] Voice layer configuration set to gpt-live-1
- [x] Secure server-side session endpoint
- [ ] Production backend delegation for knowledge retrieval
- [ ] Production tool schema for knowledge search
- [ ] Tool result injection into live session
- [ ] Telephony transport integration

## Important implementation rule
Do not replace Firebase or the existing knowledge pipeline. Build the retrieval/tool layer around it so GPT-Live-1 can access company-specific knowledge at runtime.
