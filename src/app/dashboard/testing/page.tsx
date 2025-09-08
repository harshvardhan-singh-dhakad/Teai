
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Phone, Send } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Agent, ChatMessage } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TestingPage() {
  const [agents] = useLocalStorage<Agent[]>("agents", [])
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(agents[0]?.id)
  const [messages, setMessages] = useState<ChatMessage[]>([
     { role: 'assistant', content: "Hello! This is the sales department. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const usage = 85 // Example usage percentage

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  const handleSendMessage = () => {
    if (!input.trim()) return

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput("")

    // Simulate AI response after a short delay
    setTimeout(() => {
        // TODO: Replace this with a real call to the agent's logic
        const aiResponse = "I am processing your request. This is a simulated response.";
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    }, 1000)
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
                </div>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Type your response..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="icon" aria-label="Send message" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
                <Button disabled={!selectedAgent}>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Call
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
                     <Select onValueChange={setSelectedAgentId} defaultValue={selectedAgentId}>
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
    </div>
  )
}
