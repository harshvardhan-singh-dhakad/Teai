
"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter, useParams } from 'next/navigation'
import { ArrowLeft, HardDriveUpload, FlaskConical, Webhook } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
    const agentId = params.agentId as string;
    if (agentId && agents.length > 0) {
      const currentAgent = agents.find(a => a.id === agentId)
      if (currentAgent) {
        setAgent(currentAgent)
      } else {
        notFound()
      }
    }
  }, [params.agentId, agents])

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
    
    updateAgent({ status: 'published' });
    toast({
      title: "Agent Published!",
      description: `"${agent.name}" is now live.`,
    })
  }
  
  const handleSaveChanges = () => {
    if(!agent) return;
     // The useLocalStorage hook already saves on every change,
     // but we can add an explicit save confirmation.
     toast({
        title: "Changes Saved",
        description: "Your agent details have been updated.",
     })
  }

  const handleTest = () => {
    if (!agent) return;
    router.push(`/dashboard/testing?agentId=${agent.id}`)
  }

  if (!agent) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading agent...</div>
        </div>
    )
  }

  const isPublished = agent.status === 'published';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Column: AI Assistant */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="flex items-center gap-2 overflow-hidden">
                <Avatar>
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline truncate">
                        {agent.name}
                    </h1>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${agent.status === 'draft' ? 'bg-secondary text-secondary-foreground' : 'bg-green-500/20 text-green-400'}`}>
                      {agent.status}
                    </span>
                </div>
            </div>
        </div>
        <AssistantChatbot />
      </div>

      {/* Right Column: Configuration */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleTest}>
              <FlaskConical className="h-4 w-4 mr-2" />
              Test Agent
            </Button>
            <Button onClick={handlePublish} disabled={isPublished}>
              <HardDriveUpload className="h-4 w-4 mr-2" />
              {isPublished ? 'Published' : 'Publish'}
            </Button>
            <Button onClick={handleSaveChanges}>
                Save Changes
            </Button>
        </div>
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="post-call">Post-Call</TabsTrigger>
            <TabsTrigger value="recent-calls">Recent Calls</TabsTrigger>
          </TabsList>
          <div className="mt-4 flex-1">
            <TabsContent value="details" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Agent Details</CardTitle>
                  <CardDescription>
                    Define the core identity of your agent. The conversation flow will be managed here.
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
                        <Label>Conversation Flow</Label>
                        <div className="p-4 border-2 border-dashed rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center bg-secondary/30">
                            <p className="text-muted-foreground">Drag-and-drop conversation builder coming soon!</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="integrations">
                <Card>
                    <CardHeader>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>Connect your agent to external services. Coming soon.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="p-4 border-2 border-dashed rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center bg-secondary/30">
                           <p className="text-muted-foreground">Integration options will be available here.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="configurations">
                <Card>
                    <CardHeader>
                        <CardTitle>Configurations</CardTitle>
                        <CardDescription>Customize the AI models, voice, and language. Coming soon.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="p-4 border-2 border-dashed rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center bg-secondary/30">
                           <p className="text-muted-foreground">Advanced configuration options will be available here.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="post-call">
              <Card>
                <CardHeader>
                  <CardTitle>Post-Call Actions</CardTitle>
                  <CardDescription>
                    Configure what happens after a call ends. Coming soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border-2 border-dashed rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center bg-secondary/30">
                       <p className="text-muted-foreground">Post-call actions will be configured here.</p>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="recent-calls">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Calls</CardTitle>
                  <CardDescription>
                    Review recent call logs for this agent. Coming soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border-2 border-dashed rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center bg-secondary/30">
                       <p className="text-muted-foreground">A list of recent calls will appear here.</p>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
