"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Bot, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAssistantResponse } from "@/app/actions"
import type { ChatMessage } from "@/types"
import { Avatar, AvatarFallback } from "./ui/avatar"

export function AssistantChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "I am your AI coding partner. How can I help you build your agent today? Feel free to ask for code, or guidance on best practices." }
  ])
  const [input, setInput] = useState("")
  const [isThinking, startTransition] = useTransition()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    const currentInput = input;
    setInput("")

    startTransition(async () => {
      const { answer } = await getAssistantResponse({ question: currentInput })
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    })
  }

  return (
    <Card className="flex flex-col h-full">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Assistant
            </CardTitle>
            <CardDescription>
                Your AI coding partner for building agents.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 my-4 pr-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{message.role === 'assistant' ? 'AI' : 'You'}</AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg p-3 text-sm max-w-[80%] ${message.role === 'assistant' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-secondary animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <div className="flex w-full items-center gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isThinking}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isThinking}>
                  <Send className="h-4 w-4" />
                </Button>
            </div>
        </CardFooter>
    </Card>
  )
}
