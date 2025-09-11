

"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Sparkles, FileText, ShoppingCart, Headset, CornerDownLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { onSnapshot, collection, query, orderBy, addDoc, doc, deleteDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";

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
import { db } from "@/lib/firebase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"


const templates: (AgentTemplate & { category: string })[] = [
  { name: 'Sales Agent', description: 'Handles inbound sales inquiries and qualifies leads.', icon: ShoppingCart, prompt: 'An AI agent that acts as a friendly and knowledgeable sales representative for a software company.', category: 'Sales' },
  { name: 'Support Agent', description: 'Provides customer support and answers FAQs.', icon: Headset, prompt: 'An AI agent that provides technical support for a popular mobile application, guiding users through troubleshooting steps.', category: 'Customer Experience' },
  { name: 'General Purpose', description: 'A flexible agent for various custom tasks.', icon: FileText, prompt: 'A general purpose AI agent.', category: 'Business' },
  { name: 'Lead Qualification', description: 'Qualifies website leads automatically.', icon: Icons.bot, prompt: 'An AI agent that asks website visitors a series of questions to determine if they are a qualified lead for the sales team.', category: 'Sales' },
  { name: 'Appointment Booker', description: 'Schedules appointments with clients.', icon: Icons.calendar, prompt: 'An AI agent that integrates with a calendar to book appointments, check for availability, and send confirmations.', category: 'Business' },
  { name: 'FAQ Bot', description: 'Answers frequently asked questions from a knowledge base.', icon: Icons.book, prompt: 'An AI agent that uses a provided set of documents to answer common user questions instantly.', category: 'Customer Experience' },
]

export default function AgentBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [draftAgents, setDraftAgents] = useLocalStorage<Agent[]>("agents", [])
  const [publishedAgents, setPublishedAgents] = useState<Agent[]>([]);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isEnhancing, startEnhanceTransition] = useTransition()
  const [isCreating, startCreateTransition] = useTransition()
  
  const [prompt, setPrompt] = useState("")
  const [activeFilter, setActiveFilter] = useState("Popular")

  useEffect(() => {
    const q = query(collection(db, "agents"), orderBy("lastEdited", "desc"));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        setFirestoreError(null);
        const agentsFromFirestore: Agent[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          agentsFromFirestore.push({
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            lastEdited: (data.lastEdited as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          } as Agent);
        });
        setPublishedAgents(agentsFromFirestore);
      },
      (error) => {
        console.error("Firestore snapshot error:", error);
        if (error.code === 'permission-denied') {
          setFirestoreError("Permission Denied: Please check your Firestore security rules to allow read access to the 'agents' collection for authenticated users.");
        } else {
          setFirestoreError(`An error occurred: ${error.message}`);
        }
      }
    );

    return () => unsubscribe();
  }, []);


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
          lastEdited: new Date().toISOString(),
          avatar: `https://picsum.photos/seed/${Math.random()}/100`,
          ...result,
          conversationFlow: Array.isArray(result.conversationFlow) ? result.conversationFlow : [],
        }
        setDraftAgents(prev => [...prev, newAgent])
        toast({ title: "Agent Created", description: `Draft for "${newAgent.name}" has been saved.` })
        setPrompt("")
        router.push(`/dashboard/agent-editor/${newAgent.id}`)
      } catch (error) {
        toast({ title: "Creation Failed", description: "Could not create the agent. Please try again.", variant: "destructive" })
      }
    })
  }
  
  const handleDeleteAgent = async (agent: Agent) => {
    if (agent.status === 'draft') {
      setDraftAgents(prev => prev.filter(a => a.id !== agent.id));
      toast({ title: "Draft Deleted", description: `"${agent.name}" has been removed.` });
    } else {
      try {
        await deleteDoc(doc(db, "agents", agent.id));
        toast({ title: "Agent Deleted", description: `Published agent "${agent.name}" has been deleted.` });
      } catch (error) {
        toast({ title: "Deletion Failed", description: "Could not delete the published agent.", variant: "destructive" });
      }
    }
  };

  const myAgents = [...draftAgents, ...publishedAgents].sort((a, b) => 
    new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
  );

  const filteredTemplates = activeFilter === 'Popular' 
    ? templates.slice(0, 3) 
    : templates.filter(t => t.category === activeFilter);


  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <div className="grid gap-2">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Voice AI Assistants</h1>
            <p className="text-muted-foreground">Create and manage your voice AI assistants</p>
        </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <Card className="flex flex-col h-full">
                 <CardHeader>
                    <CardTitle className="font-headline">Create a New Voice AI Assistant</CardTitle>
                    <CardDescription>Describe the agent you want to create, or select a template to get started.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="relative flex-1">
                        <Textarea 
                            id="prompt" 
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)} 
                            placeholder="e.g., Create an AI agent for a real estate company that can schedule property viewings." 
                            className="h-48 resize-none"
                        />
                    </div>
                     <div className="flex items-center gap-2">
                       <Button variant="outline" size="sm" onClick={handleEnhancePrompt} disabled={isEnhancing}>
                            <Sparkles className="mr-2 h-4 w-4" /> {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
                        </Button>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {["Popular", "Sales", "Customer Experience", "Business"].map(filter => (
                                <Button 
                                    key={filter} 
                                    variant={activeFilter === filter ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => (
                                <Card key={template.name} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setPrompt(template.prompt)}>
                                  <CardHeader>
                                    <template.icon className="h-6 w-6 text-primary mb-2" />
                                    <CardTitle className="text-base font-headline">{template.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                                  </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button onClick={handleCreateAgent} disabled={isCreating} className="w-full">
                        {isCreating ? 'Creating Agent...' : 'Create Voice AI Assistant'} <CornerDownLeft className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Agents</CardTitle>
                    <CardDescription>A list of your draft and published agents.</CardDescription>
                </CardHeader>
                <CardContent>
                   {firestoreError && (
                      <Alert variant="destructive" className="mb-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Firestore Error</AlertTitle>
                        <AlertDescription>
                          {firestoreError}
                        </AlertDescription>
                      </Alert>
                    )}
                   <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Edited</TableHead>
                          <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myAgents.length > 0 ? myAgents.map(agent => (
                            <TableRow key={agent.id}>
                                <TableCell className="font-medium">
                                    <div className="font-semibold">{agent.name}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">{agent.description}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={agent.status === 'draft' ? 'secondary' : 'default'} className={agent.status === 'published' ? 'bg-green-500/20 text-green-400 border-transparent hover:bg-green-500/30' : ''}>
                                        {agent.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(agent.lastEdited).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => router.push(`/dashboard/agent-editor/${agent.id}`)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleDeleteAgent(agent)} className="text-red-500">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    {firestoreError ? "Could not load agents." : "No agents created yet."}
                                </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

    
    