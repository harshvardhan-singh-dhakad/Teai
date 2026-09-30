"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Bot, Mic, MicOff, Phone, PhoneCall, PhoneForwarded, ShieldCheck, Square, WandSparkles } from "lucide-react";
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
  const [starting, setStarting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("Ready to test");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTest = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    dataChannelRef.current = null;
    micRef.current?.getTracks().forEach(track => track.stop());
    micRef.current = null;
    const pc = pcRef.current;
    pcRef.current = null;
    pc?.close();
    if (audioRef.current) audioRef.current.srcObject = null;
    setRunning(false);
    setStarting(false);
    setMuted(false);
    setStatus("Ready to test");
  }, []);

  useEffect(() => {
    let unsubscribeAgents: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      unsubscribeAgents?.();
      unsubscribeAgents = undefined;
      setAgents([]);
      setSelectedId("");
      if (!user) {
        stopTest();
        return;
      }

      const q = query(collection(db, "agents"), where("userId", "==", user.uid));
      unsubscribeAgents = onSnapshot(q, snap => {
        const next = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AgentOption, "id">) }));
        setAgents(next);
        setSelectedId(current => current && next.some(a => a.id === current) ? current : next[0]?.id || "");
      }, error => {
        console.error("Could not load agents:", error);
        setStatus("Could not load your agents. Please refresh and try again.");
      });
    });

    return () => {
      unsubscribeAgents?.();
      unsubscribeAuth();
    };
  }, [stopTest]);

  useEffect(() => () => stopTest(), [stopTest]);

  const agent = useMemo(() => agents.find(a => a.id === selectedId), [agents, selectedId]);

  async function startTest() {
    if (!agent || starting || running) return;
    setStarting(true);
    try {
      setStatus("Requesting microphone access...");
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in again before starting a voice test.");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = event => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
          audioRef.current.play().catch(() => undefined);
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") stopTest();
      };

      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      dc.onmessage = event => {
        let message: { type?: string; error?: { message?: string } };
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }

        if (message.type === "session.started") {
          dc.send(JSON.stringify({
            type: "session.instructions.append",
            event_id: crypto.randomUUID(),
            delegation_id: null,
            content: "Greet the user briefly in the configured language, introduce yourself, and then listen for their first question.",
          }));
          setStarting(false);
          setRunning(true);
          setStatus("Live test running — speak naturally.");
        } else if (message.type === "session.closed") {
          stopTest();
        } else if (message.type === "error") {
          setStatus(message.error?.message || "The voice session reported an error.");
        }
      };
      dc.onclose = () => {
        if (pcRef.current === pc) stopTest();
      };
      dc.onopen = () => setStatus("Connected. Starting your assistant...");

      setStatus("Preparing secure WebRTC connection...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (pc.iceGatheringState !== "complete") {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            pc.removeEventListener("icegatheringstatechange", onIceGathering);
            reject(new Error("Could not finish preparing the WebRTC connection. Please try again."));
          }, 15000);
          const onIceGathering = () => {
            if (pc.iceGatheringState === "complete") {
              clearTimeout(timeout);
              pc.removeEventListener("icegatheringstatechange", onIceGathering);
              resolve();
            }
          };
          pc.addEventListener("icegatheringstatechange", onIceGathering);
          onIceGathering();
        });
      }

      const idToken = await user.getIdToken();
      setStatus("Starting the secure voice session...");
      const sessionResponse = await fetch("/api/realtime/session", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId: agent.id, sdp: pc.localDescription?.sdp || "" }),
      });
      const sessionData = await sessionResponse.json().catch(() => ({}));
      if (!sessionResponse.ok || typeof sessionData?.transport?.sdp !== "string") {
        throw new Error(sessionData.error || "Could not start the voice session.");
      }

      await pc.setRemoteDescription({ type: "answer", sdp: sessionData.transport.sdp });
      setStatus("Connected. Starting your assistant...");
    } catch (error) {
      console.error(error);
      stopTest();
      setStatus(error instanceof Error ? error.message : "Voice test failed.");
    }
  }

  function endTest() {
    const dc = dataChannelRef.current;
    if (dc?.readyState === "open") {
      setStatus("Ending voice test...");
      try {
        dc.send(JSON.stringify({ type: "session.close" }));
        closeTimeoutRef.current = setTimeout(stopTest, 10000);
        return;
      } catch {
        // Fall through to local cleanup if the channel has already closed.
      }
    }
    stopTest();
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
                  <Button onClick={startTest} disabled={!agent || starting}>
                    <Mic className="mr-2 h-4 w-4" />{starting ? "Connecting..." : "Start voice test"}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={toggleMute}>{muted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}{muted ? "Unmute" : "Mute"}</Button>
                    <Button variant="destructive" onClick={endTest}><Square className="mr-2 h-4 w-4" />End test</Button>
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
