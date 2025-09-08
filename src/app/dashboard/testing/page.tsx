
"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Phone, Send, Volume2, PhoneOff, Mic } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Agent, ChatMessage } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAssistantResponse, textToSpeechAction, speechToTextAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

export default function TestingPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [agents] = useLocalStorage<Agent[]>("agents", [])
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isThinking, startTransition] = useTransition()
  const [isRecording, setIsRecording] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  const usage = 85 // Example usage percentage
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  useEffect(() => {
    const agentIdFromUrl = searchParams.get('agentId')
    if (agentIdFromUrl) {
      setSelectedAgentId(agentIdFromUrl)
    } else if (agents.length > 0) {
      setSelectedAgentId(agents[0].id)
    }
  }, [searchParams, agents])
  
  useEffect(() => {
    if (selectedAgent) {
        if (Array.isArray(selectedAgent.conversationFlow)) {
            const initialMessage = selectedAgent.conversationFlow.find(step => step.type === 'aiMessage');
            if (initialMessage && initialMessage.content) {
                setMessages([{ role: 'assistant', content: initialMessage.content }]);
            } else {
                 setMessages([{ role: 'assistant', content: "Hello! I am ready to start the conversation." }])
            }
        } else {
            setMessages([{ role: 'assistant', content: "Hello! This is your selected agent. How can I help?" }])
        }
    } else {
         setMessages([])
    }
  }, [selectedAgent])

  const processAudio = async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        startTransition(async () => {
            try {
                // 1. Speech-to-Text
                const { text: transcribedText } = await speechToTextAction({ audio: base64Audio, model: selectedAgent?.configurations?.sttModel || 'default' });
                setMessages(prev => [...prev, { role: 'user', content: transcribedText }]);

                // 2. Get AI response
                const { answer } = await getAssistantResponse({ question: transcribedText });
                setMessages(prev => [...prev, { role: 'assistant', content: answer }]);

                // 3. Text-to-Speech
                const { audio: audioResponse } = await textToSpeechAction({ text: answer, voice: selectedAgent?.configurations?.ttsModel });
                
                if (audioRef.current) {
                  audioRef.current.src = audioResponse;
                  audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
                }

            } catch (error) {
                console.error("Error in conversation cycle:", error);
                toast({ title: "Error", description: "An error occurred during the conversation.", variant: "destructive" });
            }
        });
    };
  }

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = event => {
              audioChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              processAudio(audioBlob);
              stream.getTracks().forEach(track => track.stop()); // Stop microphone access
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
          toast({ title: "Recording Started", description: "Speak now, the agent is listening." });
      } catch (err) {
          toast({ title: "Microphone Error", description: "Could not access the microphone. Please check permissions.", variant: "destructive" });
          console.error("Microphone access error:", err);
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          toast({ title: "Recording Stopped", description: "Processing your response..." });
      }
  };

  const handleCallButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }


  const handleSendMessage = () => {
    if (!input.trim() || !selectedAgent) return

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    const currentInput = input;
    setInput("")

    startTransition(async () => {
      try {
        const { answer } = await getAssistantResponse({ question: currentInput });
        setMessages(prev => [...prev, { role: 'assistant', content: answer }]);

        const { audio } = await textToSpeechAction({ text: answer, voice: selectedAgent.configurations?.ttsModel });
        
        if (audioRef.current) {
          audioRef.current.src = audio;
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }

      } catch (error) {
        console.error("Error in conversation:", error);
        toast({
          title: "Error",
          description: "Failed to get response from the agent. Please try again.",
          variant: "destructive"
        })
      }
    })
  }
  
  const playLastAgentMessage = async () => {
    const lastAgentMessage = messages.filter(m => m.role === 'assistant').pop();
    if (lastAgentMessage && selectedAgent) {
        try {
            const { audio } = await textToSpeechAction({ text: lastAgentMessage.content, voice: selectedAgent.configurations?.ttsModel });
            if (audioRef.current) {
              audioRef.current.src = audio;
              audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            }
        } catch (error) {
            toast({
              title: "Audio Error",
              description: "Failed to generate audio for the message.",
              variant: "destructive"
            })
        }
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Calling Simulator</CardTitle>
                <CardDescription>Test your AI agents in a simulated call environment.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="flex-1 border rounded-lg p-4 bg-secondary/30 space-y-4 overflow-y-auto h-[400px]">
                    {messages.map((message, index) => (
                         <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{message.role === 'assistant' ? 'AI' : 'You'}</AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg p-3 text-sm max-w-[80%] ${message.role === 'assistant' ? 'bg-background' : 'bg-primary text-primary-foreground'}`}>
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {(isThinking || isRecording) && (
                      <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                              <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg p-3 text-sm bg-background ${isThinking ? 'animate-pulse' : ''}`}>
                              {isRecording ? <div className="flex items-center gap-2 text-red-500"><Mic className="h-4 w-4 animate-pulse" /> Listening...</div> : 'Thinking...'}
                          </div>
                      </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Type your response..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={!selectedAgent || isThinking || isRecording}
                    />
                    <Button size="icon" aria-label="Send message" onClick={handleSendMessage} disabled={!selectedAgent || isThinking || isRecording}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex items-center justify-between">
                <Button onClick={handleCallButtonClick} disabled={!selectedAgent || isThinking} variant={isRecording ? 'destructive' : 'default'}>
                    {isRecording ? <><PhoneOff className="mr-2 h-4 w-4" />Stop Call</> : <><Phone className="mr-2 h-4 w-4" />Start Call</>}
                </Button>
                <Button variant="outline" size="icon" onClick={playLastAgentMessage} disabled={isThinking || isRecording || messages.filter(m => m.role === 'assistant').length === 0}>
                    <Volume2 className="h-4 w-4" />
                    <span className="sr-only">Play last message</span>
                </Button>
            </CardFooter>
            </Card>
        </div>
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Select Agent</CardTitle>
                    <CardDescription>Choose an agent to test from your drafts or published agents.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Select onValueChange={setSelectedAgentId} value={selectedAgentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.length > 0 ? (
                            agents.map(agent => (
                                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                            ))
                        ) : (
                            <SelectItem value="no-agent" disabled>No agents found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Usage Limit</CardTitle>
                    <CardDescription>Your monthly testing minutes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="usage-progress" className="text-sm">{usage}% Used</Label>
                        <Progress id="usage-progress" value={usage} aria-label={`${usage}% of testing minutes used`} />
                        <p className="text-xs text-muted-foreground">425 / 500 minutes used.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">Upgrade Plan</Button>
                </CardFooter>
            </Card>
        </div>
        <audio ref={audioRef} className="hidden" />
    </div>
  )
}
