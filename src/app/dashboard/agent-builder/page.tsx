"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Sparkles, FileText, ShoppingCart, Headset } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  const [isDialogOpen, setDialogOpen] = useState(false)

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
        setDialogOpen(false)
        setPrompt("")
        router.push(`/dashboard/agent-editor/${newAgent.id}`)
      } catch (error) {
        toast({ title: "Creation Failed", description: "Could not create the agent. Please try again.", variant: "destructive" })
      }
    })
  }

  const createFromTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    setDialogOpen(true);
  }

  const drafts = agents.filter(a => a.status === 'draft');
  const published = agents.filter(a => a.status === 'published');


  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="font-headline">Your Agents</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Manage, edit, and test your draft and published AI voice agents.
            </CardDescription>
          </CardHeader>
          <CardFooter>
             <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Create Agent</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-headline">Create New Agent</DialogTitle>
                  <DialogDescription>
                    Describe the agent you want to create. You can start simple.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="prompt">Agent Prompt</Label>
                  <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A friendly sales agent for a real estate company." className="min-h-[120px]" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleEnhancePrompt} disabled={isEnhancing}>
                    <Sparkles className="mr-2 h-4 w-4" /> {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
                  </Button>
                  <Button onClick={handleCreateAgent} disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Agent'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        {templates.slice(0, 2).map((template) => (
          <Card key={template.name}>
            <CardHeader>
              <template.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg font-headline">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={() => createFromTemplate(template.prompt)}>Use Template</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
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
          <div className="text-center text-muted-foreground">
            No agents found.
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
