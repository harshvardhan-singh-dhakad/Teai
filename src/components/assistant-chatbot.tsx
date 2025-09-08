"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Bot, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
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
    setInput("")

    startTransition(async () => {
      const { answer } = await getAssistantResponse({ question: input })
      setMessages([...newMessages, { role: 'assistant', content: answer }])
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
          <Bot className="h-7 w-7" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI App Prototyper
          </SheetTitle>
          <SheetDescription>
            Your AI coding partner for building agents.
          </SheetDescription>
        </SheetHeader>
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
        <SheetFooter>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
