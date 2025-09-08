
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Sparkles, FileText, ShoppingCart, Headset, CornerDownLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { enhancePromptAction, createAgentAction } from "@/app/actions"
import type { Agent, AgentTemplate } from "@/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

const templates: AgentTemplate[] = [
  { name: 'Sales Agent', description: 'Handles inbound sales inquiries and qualifies leads.', icon: ShoppingCart, prompt: 'An AI agent that acts as a friendly and knowledgeable sales representative for a software company.' },
  { name: 'Support Agent', description: 'Provides customer support and answers FAQs.', icon: Headset, prompt: 'An AI agent that provides technical support for a popular mobile application, guiding users through troubleshooting steps.' },
  { name: 'General Purpose', description: 'A flexible agent for various custom tasks.', icon: FileText, prompt: 'A general purpose AI agent.' },
]

export default function AgentBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [agents, setAgents] = useLocalStorage<Agent[]>("agents", [])
  const [isEnhancing, startEnhanceTransition] = useTransition()
  const [isCreating, startCreateTransition] = useTransition()
  
  const [prompt, setPrompt] = useState("")

  const handleEnhancePrompt = () => {
    startEnhanceTransition(async () => {
      if (!prompt) {
        toast({ title: "Prompt is empty", description: "Please enter a prompt to enhance.", variant: "destructive" })
        return
      }
      try {
        const { enhancedPrompt } = await enhancePromptAction({ userPrompt: prompt })
        setPrompt(enhancedPrompt)
        toast({ title: "Prompt Enhanced", description: "Your prompt has been enhanced by AI." })
      } catch (error) {
        toast({ title: "Enhancement Failed", description: "Could not enhance the prompt. Please try again.", variant: "destructive" })
      }
    })
  }
  
  const handleCreateAgent = () => {
    startCreateTransition(async () => {
      if (!prompt) {
        toast({ title: "Prompt is empty", description: "Please enter a prompt to create an agent.", variant: "destructive" })
        return
      }
      try {
        const result = await createAgentAction({ prompt })
        const newAgent: Agent = {
          id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          status: 'draft',
          createdAt: new Date().toISOString(),
          avatar: `https://picsum.photos/seed/${Math.random()}/100`,
          ...result
        }
        setAgents(prev => [...prev, newAgent])
        toast({ title: "Agent Created", description: `Draft for "${newAgent.name}" has been saved.` })
        setPrompt("")
        router.push(`/dashboard/agent-editor/${newAgent.id}`)
      } catch (error) {
        toast({ title: "Creation Failed", description: "Could not create the agent. Please try again.", variant: "destructive" })
      }
    })
  }

  const drafts = agents.filter(a => a.status === 'draft');
  const published = agents.filter(a => a.status === 'published');


  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="flex flex-col h-full">
                 <CardHeader>
                    <CardTitle className="font-headline">Create a new agent</CardTitle>
                    <CardDescription>Describe the agent you want to create in the box below.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="relative flex-1">
                        <Textarea 
                            id="prompt" 
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)} 
                            placeholder="e.g., Create an AI agent in one click for a real estate company." 
                            className="h-full resize-none"
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                           <Button variant="ghost" size="sm" onClick={handleEnhancePrompt} disabled={isEnhancing}>
                                <Sparkles className="mr-2 h-4 w-4" /> {isEnhancing ? 'Enhancing...' : 'Enhance'}
                            </Button>
                            <Button onClick={handleCreateAgent} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Agent'} <CornerDownLeft className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4">
          {templates.slice(0, 2).map((template) => (
            <Card key={template.name}>
              <CardHeader>
                <template.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg font-headline">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{template.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => setPrompt(template.prompt)}>Use Template</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All ({agents.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({published.length})</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all">
          <AgentList agents={agents} />
        </TabsContent>
        <TabsContent value="drafts">
          <AgentList agents={drafts} />
        </TabsContent>
        <TabsContent value="published">
          <AgentList agents={published} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


function AgentList({ agents }: { agents: Agent[] }) {
  const router = useRouter();

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-12">
            <h3 className="text-lg font-semibold">No Agents Yet</h3>
            <p className="mt-2">Create your first agent to see it listed here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <Card key={agent.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => router.push(`/dashboard/agent-editor/${agent.id}`)}>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-headline">{agent.name}</CardTitle>
                 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${agent.status === 'draft' ? 'bg-secondary text-secondary-foreground' : 'bg-green-500/20 text-green-400'}`}>
                  {agent.status}
                </span>
            </div>
            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Created {new Date(agent.createdAt).toLocaleDateString()}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
