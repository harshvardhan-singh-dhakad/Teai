"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Mic, MicOff, Phone, PhoneCall, PhoneForwarded, ShieldCheck, Square, WandSparkles } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AgentOption = {
  id: string;
  name: string;
  description?: string;
  knowledgeBase?: Array<{ content?: string; name?: string; type?: string; source?: string }>;
  configurations?: {
    behavior?: { toneOfVoice?: string; assistantStyle?: string };
    stt?: { language?: string };
  };
};

export default function CallAssistantPage() {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("Ready to test");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, "agents"), where("userId", "==", user.uid));
    return onSnapshot(q, snap => {
      const next = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AgentOption, "id">) }));
      setAgents(next);
      if (!selectedId && next[0]) setSelectedId(next[0].id);
    });
  }, [selectedId]);

  const agent = useMemo(() => agents.find(a => a.id === selectedId), [agents, selectedId]);

  const instructions = useMemo(() => {
    if (!agent) return "";
    const knowledge = (agent.knowledgeBase || [])
      .map(d => d.content || "")
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 24000);
    return [
      `You are ${agent.name}, a business voice assistant.`,
      agent.description || "",
      `Language: ${agent.configurations?.stt?.language || "en-US"}. Respond naturally in the user's language.`,
      `Tone: ${agent.configurations?.behavior?.toneOfVoice || "professional"}.`,
      `Style: ${agent.configurations?.behavior?.assistantStyle || "helpful and concise"}.`,
      "Use the supplied company knowledge as the source of truth. If the answer is not present, say that you do not have enough information instead of inventing facts.",
      knowledge ? `COMPANY KNOWLEDGE:\n${knowledge}` : "",
    ].filter(Boolean).join("\n\n");
  }, [agent]);

  async function startTest() {
    try {
      setStatus("Requesting secure voice session...");
      const tokenResponse = await fetch("/api/realtime/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions }),
      });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.clientSecret) throw new Error(tokenData.error || "Realtime session failed.");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = event => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
          audioRef.current.play().catch(() => undefined);
        }
      };
      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) stopTest();
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dc.onopen = () => {
        dc.send(JSON.stringify({
          type: "response.create",
          response: { instructions: "Greet the user and wait for their first question." }
        }));
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(tokenData.model)}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Authorization": `Bearer ${tokenData.clientSecret}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdpResponse.ok) throw new Error("Could not connect the realtime voice session.");
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpResponse.text() });

      setRunning(true);
      setStatus("Live test running — speak naturally.");
    } catch (error) {
      console.error(error);
      stopTest();
      setStatus(error instanceof Error ? error.message : "Voice test failed.");
    }
  }

  function stopTest() {
    micRef.current?.getTracks().forEach(track => track.stop());
    micRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setRunning(false);
    setMuted(false);
    setStatus("Ready to test");
  }

  function toggleMute() {
    const next = !muted;
    micRef.current?.getAudioTracks().forEach(track => { track.enabled = !next; });
    setMuted(next);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><PhoneCall className="h-5 w-5 text-primary" /></div>
            <div>
              <CardTitle className="font-headline">AI Call Assistant</CardTitle>
              <CardDescription>Test the same agent you will use on phone calls — without buying a number first.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Free voice test</CardTitle>
            <CardDescription>Use your microphone to test tone, knowledge and conversation quality before launch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Select an agent" /></SelectTrigger>
              <SelectContent>{agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>

            <div className="rounded-xl border bg-muted/30 p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <Badge variant={running ? "default" : "outline"}>{running ? "LIVE TEST" : "TEST MODE"}</Badge>
              <p className="mt-3 text-sm text-muted-foreground">{status}</p>
              <div className="mt-5 flex justify-center gap-2">
                {!running ? (
                  <Button onClick={startTest} disabled={!agent}><Mic className="mr-2 h-4 w-4" />Start voice test</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={toggleMute}>{muted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}{muted ? "Unmute" : "Mute"}</Button>
                    <Button variant="destructive" onClick={stopTest}><Square className="mr-2 h-4 w-4" />End test</Button>
                  </>
                )}
              </div>
            </div>
            <audio ref={audioRef} autoPlay />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Before launch</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2"><ShieldCheck className="h-4 w-4 text-primary mt-0.5" />Knowledge is reused from your selected agent.</div>
              <div className="flex gap-2"><WandSparkles className="h-4 w-4 text-primary mt-0.5" />No virtual number is provisioned during testing.</div>
              <div className="flex gap-2"><Phone className="h-4 w-4 text-primary mt-0.5" />Phone activation happens after a paid launch.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Launch options</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline"><PhoneForwarded className="mr-2 h-4 w-4" />Connect existing number</Button>
              <Button className="w-full"><Phone className="mr-2 h-4 w-4" />Get dedicated virtual number</Button>
              <p className="text-xs text-muted-foreground">These actions are intentionally gated for the paid launch flow. Provider provisioning is handled server-side.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
