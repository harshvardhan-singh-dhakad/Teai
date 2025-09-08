"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, Copy, ExternalLink, HardDriveUpload, Settings, Share, Webhook } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { Agent } from "@/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { AssistantChatbot } from "@/components/assistant-chatbot"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AgentEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [agents, setAgents] = useLocalStorage<Agent[]>("agents", [])
  const [agent, setAgent] = useState<Agent | undefined>(undefined)

  useEffect(() => {
    const { agentId } = params;
    if (agentId && agents.length > 0) {
      const currentAgent = agents.find(a => a.id === agentId)
      if (currentAgent) {
        setAgent(currentAgent)
      } else {
        notFound()
      }
    }
  }, [params, agents])

  const updateAgent = (updatedFields: Partial<Agent>) => {
    if (!agent) return;
    const updatedAgent = { ...agent, ...updatedFields };
    setAgent(updatedAgent);
    setAgents(prevAgents => 
      prevAgents.map(a => a.id === agent.id ? updatedAgent : a)
    );
  }

  const handlePublish = () => {
    if (!agent) return
    const isIntegrated = agent.integrations?.twilio?.accountSid;

    if (!isIntegrated) {
      toast({
        title: "Integration Required",
        description: "Please integrate at least one calling provider (e.g., Twilio) before publishing.",
        variant: "destructive",
      })
      return
    }

    updateAgent({ status: 'published' });
    toast({
      title: "Agent Published!",
      description: `"${agent.name}" is now live.`,
    })
  }

  if (!agent) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading agent...</div>
        </div>
    )
  }

  const isPublished = agent.status === 'published';
  const isIntegrated = agent.integrations?.twilio?.accountSid;

  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
                {agent.name}
            </h1>
          </div>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" disabled={isPublished}>
              Share
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={isPublished || !isIntegrated}>
              <HardDriveUpload className="h-4 w-4 mr-2" />
              {isPublished ? 'Published' : 'Publish'}
            </Button>
          </div>
        </div>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="post-call">Post-Call</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Details</CardTitle>
                  <CardDescription>
                    Define the core identity and conversational abilities of your agent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input id="agent-name" value={agent.name} onChange={e => updateAgent({ name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="agent-description">Description</Label>
                    <Textarea id="agent-description" value={agent.description} onChange={e => updateAgent({ description: e.target.value })} />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="agent-flow">Conversation Flow</Label>
                    <Textarea id="agent-flow" className="min-h-64 font-code" value={agent.conversationFlow} onChange={e => updateAgent({ conversationFlow: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="integrations">
                <Card>
                    <CardHeader>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>Connect your agent to external services.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1.5">
                                    <CardTitle className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="currentColor"><path d="M8.00118 0C12.4194 0 16 3.58065 16 8.00118C16 12.4194 12.4194 16 8.00118 16C3.58065 16 0 12.4194 0 8.00118C0 3.58065 3.58065 0 8.00118 0ZM8.00118 1.4547C4.38671 1.4547 1.4547 4.38671 1.4547 8.00118C1.4547 11.6133 4.38671 14.5453 8.00118 14.5453C11.6133 14.5453 14.5453 11.6133 14.5453 8.00118C14.5453 4.38671 11.6133 1.4547 8.00118 1.4547ZM5.81882 5.81882C5.39417 5.81882 5.0459 6.16709 5.0459 6.59174V9.40826C5.0459 9.83291 5.39417 10.1812 5.81882 10.1812H10.1812C10.6058 10.1812 10.9541 9.83291 10.9541 9.40826V6.59174C10.9541 6.16709 10.6058 5.81882 10.1812 5.81882H5.81882Z"></path></svg>
                                        Twilio
                                    </CardTitle>
                                    <CardDescription>Handle voice calls via Twilio.</CardDescription>
                                </div>
                                <Button variant={isIntegrated ? 'secondary' : 'default'}>{isIntegrated ? 'Connected' : 'Connect'}</Button>
                            </CardHeader>
                             {isIntegrated && (
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label>Account SID</Label>
                                        <Input value={agent.integrations?.twilio?.accountSid} readOnly/>
                                        <Label>Phone Number</Label>
                                        <Input value={agent.integrations?.twilio?.phoneNumber} readOnly/>
                                    </div>
                                </CardContent>
                             )}
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="configurations">
              <Card>
                <CardHeader><CardTitle>Configurations</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground p-12">
                  <Settings className="mx-auto h-12 w-12" />
                  <p className="mt-4">Model and voice configurations coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="post-call">
              <Card>
                <CardHeader><CardTitle>Post-Call Actions</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground p-12">
                  <Webhook className="mx-auto h-12 w-12" />
                  <p className="mt-4">Webhook configurations coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
       <AssistantChatbot />
    </div>
  )
}
