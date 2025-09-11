

"use client"

import React, { useEffect, useState, useRef, useTransition } from "react"
import { notFound, useRouter, useParams } from 'next/navigation'
import { ArrowLeft, HardDriveUpload, FlaskConical, UploadCloud, FileText, Trash2, Eye, Languages, Mic, BrainCircuit, PhoneForwarded, Voicemail, Bot, Smile, Info, Plus, GripVertical, Phone, Calendar, Slack, Zap, Briefcase, Play, BookText, MessageSquare, BarChart, FileJson, Globe, Database, LoaderCircle, Send, Volume2, PhoneOff, Settings, Check, Square, Circle, Archive } from "lucide-react"
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { Agent, Document, ConversationStep, Integration, Voice, PostCallConfig, ExtractedVariable, ChatMessage } from "@/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { AssistantChatbot } from "@/components/assistant-chatbot"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { trainFromWebsiteAction, getAssistantResponse, textToSpeechAction, speechToTextAction, runAgentAction } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


// Helper component to avoid "can't find node" error with react-beautiful-dnd in React 18 strict mode
const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};


export default function AgentEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [agents, setAgents] = useLocalStorage<Agent[]>("agents", [])
  const [agent, setAgent] = useState<Agent | undefined>(undefined)
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);


  useEffect(() => {
    const agentId = params.agentId as string;
    if (agentId && agents.length > 0) {
      const currentAgent = agents.find(a => a.id === agentId)
      if (currentAgent) {
        // Ensure conversationFlow is an array and has unique ids
        if (typeof currentAgent.conversationFlow === 'string' || !currentAgent.conversationFlow) {
            currentAgent.conversationFlow = [];
        }
        if (Array.isArray(currentAgent.conversationFlow)) {
            currentAgent.conversationFlow = currentAgent.conversationFlow.map((step, index) => ({
                ...step,
                id: step.id || `${Date.now()}-${index}`
            }));
        }
        setAgent(currentAgent)
        if (currentAgent.status === 'published') {
            setHasUnpublishedChanges(false);
        }
      } else {
        notFound()
      }
    }
  }, [params.agentId, agents])

  const updateAgent = (updatedFields: Partial<Agent>) => {
    if (!agent) return;
    const updatedAgent = { ...agent, ...updatedFields, lastEdited: new Date().toISOString() };
    setAgent(updatedAgent);
    setAgents(prevAgents => 
      prevAgents.map(a => a.id === agent.id ? updatedAgent : a)
    );
     if (agent.status === 'published') {
      setHasUnpublishedChanges(true);
    }
  }
  
  const updateAgentConfig = (configSection: keyof NonNullable<Agent['configurations']>, key: string, value: any) => {
    if (!agent) return;
    const updatedConfig = {
      ...(agent.configurations || {}),
      [configSection]: {
        // @ts-ignore
        ...(agent.configurations?.[configSection] || {}),
        [key]: value,
      },
    };
    updateAgent({ configurations: updatedConfig });
  };
  
  const updateAgentIntegration = (integrationId: keyof NonNullable<Agent['integrations']>, isConnected: boolean, creds?: any) => {
    if (!agent) return;
    const updatedIntegrations = {
      ...(agent.integrations || {}),
      [integrationId]: {
        ...creds,
        connected: isConnected,
      },
    };
    updateAgent({ integrations: updatedIntegrations });
  }


  const handlePublish = () => {
    if (!agent) return
    
    updateAgent({ status: 'published' });
    setHasUnpublishedChanges(false);
    toast({
      title: "Agent Published!",
      description: `"${agent.name}" is now live.`,
    })
  }
  
  const handleUnpublish = () => {
    if (!agent) return;
    updateAgent({ status: 'draft' });
    setHasUnpublishedChanges(false); // Reset changes status
    toast({
      title: "Agent Unpublished",
      description: `"${agent.name}" is now a draft.`,
      variant: 'destructive'
    });
  };
  
  const handleSaveChanges = () => {
    if(!agent) return;
     // The useLocalStorage hook already saves on every change,
     // but we can add an explicit save confirmation.
     toast({
        title: "Changes Saved",
        description: "Your agent details have been updated.",
     })
  }

  if (!agent) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading agent...</div>
        </div>
    )
  }

  const isPublished = agent.status === 'published' && !hasUnpublishedChanges;
  const lastSavedTime = new Date(agent.lastEdited).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Right Column: AI Assistant */}
       <div className="lg:col-span-1 flex flex-col gap-4">
        <AssistantChatbot />
      </div>

      {/* Left Column: Configuration */}
      <div className="lg:col-span-2 flex flex-col gap-4">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.push('/dashboard/agent-builder')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="flex items-center gap-2 overflow-hidden">
                <Avatar>
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight font-headline truncate">
                        {agent.name}
                    </h1>
                </div>
            </div>
             <div className="flex items-center justify-end gap-2 ml-auto">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${agent.status === 'draft' ? 'bg-secondary text-secondary-foreground' : 'bg-green-500/20 text-green-400'}`}>
                  {agent.status}
                </span>
                <TestAgentDialog agent={agent} />
                {isPublished ? (
                  <Button onClick={handleUnpublish} variant="outline">
                    <Archive className="h-4 w-4 mr-2" />
                    Unpublish
                  </Button>
                ) : (
                  <Button onClick={handlePublish}>
                    <HardDriveUpload className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}
                 <Button>
                    Saved on {lastSavedTime}
                </Button>
            </div>
        </div>
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="post-call">Post-Call</TabsTrigger>
            <TabsTrigger value="recent-calls">Recent Calls</TabsTrigger>
          </TabsList>
          <div className="mt-4 flex-1">
            <TabsContent value="details" className="h-full">
                <DetailsTab agent={agent} updateAgent={updateAgent} />
            </TabsContent>
            <TabsContent value="knowledge-base" className="h-full">
                <KnowledgeBaseTab agent={agent} updateAgent={updateAgent} />
            </TabsContent>
            <TabsContent value="integrations" className="h-full">
                <IntegrationsTab agent={agent} onIntegrationChange={updateAgentIntegration} />
            </TabsContent>
             <TabsContent value="configurations" className="h-full">
                <ConfigurationTab agent={agent} onConfigChange={updateAgentConfig} />
            </TabsContent>
            <TabsContent value="post-call" className="h-full">
               <PostCallTab agent={agent} updateAgent={updateAgent} />
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

function DetailsTab({ agent, updateAgent }: { agent: Agent; updateAgent: (data: Partial<Agent>) => void; }) {
  
  const conversationFlow = (Array.isArray(agent.conversationFlow) ? agent.conversationFlow : []).map((step, index) => ({
    ...step,
    id: step.id || `${Date.now()}-${index}`,
  }));

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(conversationFlow);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateAgent({ conversationFlow: items });
  };
  
  const addStep = () => {
    const newStep: ConversationStep = {
        id: `step-${Date.now()}`,
        type: 'aiMessage',
        title: `New Step ${conversationFlow.length + 1}`,
        content: ''
    };
    updateAgent({ conversationFlow: [...conversationFlow, newStep] });
  };

  const removeStep = (index: number) => {
    const newFlow = [...conversationFlow];
    newFlow.splice(index, 1);
    updateAgent({ conversationFlow: newFlow });
  };
  
  const updateStep = (index: number, updatedStep: Partial<ConversationStep>) => {
    const newFlow = [...conversationFlow];
    newFlow[index] = { ...newFlow[index], ...updatedStep };
    updateAgent({ conversationFlow: newFlow });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
          <CardDescription>
            Define the core identity of your agent.
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Conversational Flow</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                        <Info className="h-4 w-4" />
                        Assistant's Instructions
                    </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center space-x-2">
                        <Switch id="dynamic-mode" />
                        <Label htmlFor="dynamic-mode">Dynamic</Label>
                    </div>
                    <Button variant="outline" onClick={addStep}><Plus className="h-4 w-4 mr-2" />Add Step</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <DragDropContext onDragEnd={onDragEnd}>
                    <StrictModeDroppable droppableId="conversation-flow" isDropDisabled={false} isCombineEnabled={false}>
                        {(provided) => (
                             <Accordion type="multiple" className="w-full" {...provided.droppableProps} ref={provided.innerRef}>
                                {conversationFlow.map((step, index) => (
                                     <Draggable key={step.id} draggableId={step.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} >
                                                <AccordionItem value={`item-${index}`} className="group border rounded-md px-3">
                                                    <div className="flex items-center justify-between w-full p-0">
                                                        <AccordionTrigger className="flex-1 p-0 hover:no-underline py-3">
                                                            <div className="flex items-center gap-4 flex-1" {...provided.dragHandleProps}>
                                                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                                <span className="font-semibold truncate" title={step.title}>{index + 1}. {step.title}</span>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <div className="flex items-center gap-2 pl-4">
                                                            <Switch checked={true} />
                                                            <Button size="icon" variant="ghost" onClick={() => removeStep(index)} className="h-8 w-8">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <AccordionContent className="p-4 pt-0 pl-12">
                                                        <Textarea 
                                                          placeholder="Enter step content or instructions..." 
                                                          value={step.content} 
                                                          onChange={(e) => updateStep(index, { content: e.target.value })}
                                                          className="min-h-[120px]"
                                                        />
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Accordion>
                        )}
                    </StrictModeDroppable>
                </DragDropContext>
            </div>
             {conversationFlow.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No conversation steps yet. Click "Add Step" to begin.</p>
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  )
}

function KnowledgeBaseTab({ agent, updateAgent }: { agent: Agent; updateAgent: (data: Partial<Agent>) => void; }) {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>(agent.knowledgeBase || []);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isTraining, setIsTraining] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);


  useEffect(() => {
    updateAgent({ knowledgeBase: documents });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFilesToUpload(Array.from(event.target.files))
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files) {
      setFilesToUpload(Array.from(event.dataTransfer.files))
    }
  }

  const handleUpload = () => {
    if (filesToUpload.length === 0) {
      toast({ title: "No files selected", description: "Please select files to upload.", variant: "destructive" })
      return
    }

    const newDocuments: Document[] = filesToUpload.map(file => ({
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: 'file',
        source: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "Active",
        createdAt: new Date().toISOString(),
        content: `Simulated content for ${file.name}`
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    setFilesToUpload([])
    toast({ title: "Upload Successful", description: `${filesToUpload.length} document(s) have been added.` })
  }

  const handleFetchAndTrain = async () => {
    if(!websiteUrl) {
        toast({ title: "URL is empty", description: "Please enter a website URL to fetch.", variant: "destructive" })
        return
    }
    setIsTraining(true);
     try {
        const { title, charCount, content } = await trainFromWebsiteAction({ url: websiteUrl });
        
        const newDocument: Document = {
            id: `doc-${Date.now()}`,
            name: title,
            type: 'website',
            source: websiteUrl,
            size: `${(charCount / 1024).toFixed(2)} KB`,
            status: "Active",
            createdAt: new Date().toISOString(),
            content: content,
        }

        setDocuments(prev => [newDocument, ...prev]);
        setWebsiteUrl("");
        toast({ title: "Training Complete", description: `Website "${title}" has been added to the knowledge base.` });

    } catch (error) {
        toast({ title: "Scraping Failed", description: `Could not fetch data from ${websiteUrl}. Please check the URL.`, variant: "destructive" })
    } finally {
        setIsTraining(false);
    }
  }

  const handleDelete = (docId: string) => {
    const docToDelete = documents.find(doc => doc.id === docId);
    setDocuments(documents.filter(doc => doc.id !== docId))
     toast({ title: "Source Deleted", description: `"${docToDelete?.name}" has been removed from the knowledge base.` })
  }

  return (
    <div className="grid gap-6">
       <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
             <Tabs defaultValue="file-upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file-upload">Upload File</TabsTrigger>
                    <TabsTrigger value="website-import">From Website</TabsTrigger>
                </TabsList>
                <TabsContent value="file-upload">
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Upload Documents</CardTitle>
                        <CardDescription>Upload PDF, DOCX, or TXT files.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('file-upload-input')?.click()}
                        >
                          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-center text-muted-foreground text-sm">
                            Drag & drop, or click to browse
                          </p>
                          <input
                            id="file-upload-input"
                            type="file"
                            className="hidden"
                            multiple
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                          />
                        </div>

                        {filesToUpload.length > 0 && (
                          <div className="space-y-2">
                              <p className="font-medium text-sm">Selected files:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {filesToUpload.map((file, i) => <li key={i}>{file.name}</li>)}
                              </ul>
                          </div>
                        )}
                        <Button className="w-full" onClick={handleUpload} disabled={filesToUpload.length === 0}>
                          Upload Documents
                        </Button>
                      </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="website-import">
                    <Card className="mt-4">
                        <CardHeader>
                           <CardTitle className="text-lg">Import from Website</CardTitle>
                           <CardDescription>Enter a URL to fetch and train the agent on its content.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="website-url">Website URL</label>
                                <Input 
                                    id="website-url"
                                    placeholder="https://example.com"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    disabled={isTraining}
                                />
                            </div>
                            <Button className="w-full" onClick={handleFetchAndTrain} disabled={isTraining}>
                                {isTraining && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isTraining ? "Training..." : "Fetch & Train"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
             </Tabs>
          </div>
          <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Knowledge Sources for {agent.name}</CardTitle>
                  <CardDescription>All uploaded sources are automatically available to this agent.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center gap-2 truncate">
                            {doc.type === 'file' ? <FileText className="h-4 w-4 text-muted-foreground" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                            <span className="truncate">{doc.name}</span>
                          </TableCell>
                           <TableCell>{doc.type === 'file' ? 'File' : 'Website'}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>
                            <Badge
                              variant={doc.status === "Active" ? "outline" : "secondary"}
                              className={cn(
                                  doc.status === 'Active' ? 'text-green-400 border-green-400' : '',
                                  doc.status === 'Training' ? 'text-amber-400 border-amber-400' : '',
                                )}
                            >
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-1">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingDocument(doc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(doc.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {documents.length === 0 && (
                     <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[200px] bg-secondary/30">
                        <Database className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No Knowledge Sources</h3>
                        <p className="text-muted-foreground mt-2">
                          Use the controls on the left to add knowledge sources to this agent.
                        </p>
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>

        {viewingDocument && (
            <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>View Document: {viewingDocument.name}</DialogTitle>
                        <DialogDescription>
                           Source: {viewingDocument.source}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] my-4 pr-4">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                            {viewingDocument.content}
                        </pre>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingDocument(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
  )
}


function IntegrationsTab({ agent, onIntegrationChange }: { agent: Agent, onIntegrationChange: (id: keyof NonNullable<Agent['integrations']>, connected: boolean, creds?: any) => void }) {
  const { toast } = useToast()

  const allIntegrations: Integration[] = [
    { id: "twilio", name: "Twilio", description: "Connect for programmable voice and SMS.", icon: Phone, group: 'calling', credentials: [{ id: 'accountSid', label: 'Account SID' }, { id: 'authToken', label: 'Auth Token' }] },
    { id: "vonage", name: "Vonage", description: "APIs for voice, messaging, and video.", icon: Phone, group: 'calling', credentials: [{ id: 'apiKey', label: 'API Key' }, { id: 'apiSecret', label: 'API Secret' }] },
    { id: "exotel", name: "Exotel", description: "Cloud telephony for businesses in India.", icon: Phone, group: 'calling', credentials: [{ id: 'accountSid', label: 'Account SID' }, { id: 'apiToken', label: 'API Token' }] },
    { id: "googleCalendar", name: "Google Calendar", description: "Automate scheduling and manage events.", icon: Calendar, group: 'other', credentials: [{id: 'apiKey', label: 'API Key'}] },
    { id: "slack", name: "Slack", description: "Send notifications and data to channels.", icon: Slack, group: 'other', credentials: [{id: 'webhookUrl', label: 'Webhook URL'}] },
    { id: "zapier", name: "Zapier", description: "Connect your agent to thousands of apps.", icon: Zap, group: 'other', credentials: [] },
  ];

  const handleConnect = (id: keyof NonNullable<Agent['integrations']>, newCredentials?: Record<string, string>) => {
    onIntegrationChange(id, true, newCredentials);
    toast({ title: `Successfully connected to ${allIntegrations.find(i=>i.id === id)?.name}!` })
  }

  const handleDisconnect = (id: keyof NonNullable<Agent['integrations']>) => {
    onIntegrationChange(id, false, {});
    toast({ title: `Disconnected from ${allIntegrations.find(i=>i.id === id)?.name}.`, variant: "destructive" })
  }

  const callingProviders = allIntegrations.filter(int => int.group === 'calling');
  const otherIntegrations = allIntegrations.filter(int => int.group !== 'calling');
  
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5"/>
                    <CardTitle className="text-xl font-headline">Calling Providers</CardTitle>
                </div>
                <CardDescription>Connect a telephony provider to enable live calls for your agents.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-border">
                    {callingProviders.map(integration => {
                        const isConnected = agent.integrations?.[integration.id as keyof Agent['integrations']]?.connected || false;
                        return (
                             <div key={integration.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <integration.icon className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-semibold">{integration.name}</h3>
                                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                                    </div>
                                </div>
                                <IntegrationButton 
                                  integration={integration} 
                                  isConnected={isConnected}
                                  onConnect={handleConnect} 
                                  onDisconnect={handleDisconnect} />
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherIntegrations.map(integration => {
               const isConnected = agent.integrations?.[integration.id as keyof Agent['integrations']]?.connected || false;
                return (
                    <Card key={integration.id}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <integration.icon className="h-8 w-8 text-primary" />
                                <CardTitle>{integration.name}</CardTitle>
                            </div>
                            <CardDescription>{integration.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <IntegrationButton 
                              integration={integration} 
                              isConnected={isConnected}
                              onConnect={handleConnect} 
                              onDisconnect={handleDisconnect} />
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
  )
}

function IntegrationButton({ integration, isConnected, onConnect, onDisconnect }: { integration: Integration; isConnected: boolean; onConnect: (id: any, creds?: any) => void; onDisconnect: (id: any) => void; }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creds, setCreds] = useState<Record<string, string>>({});
  
  const handleSave = () => {
    onConnect(integration.id, creds);
    setDialogOpen(false);
  }

  if (isConnected) {
    return <Button variant="destructive" onClick={() => onDisconnect(integration.id)}>Disconnect</Button>
  }

  if (!integration.credentials || integration.credentials.length === 0) {
    return <Button onClick={() => onConnect(integration.id)}>Connect</Button>
  }
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Connect</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to {integration.name}</DialogTitle>
          <DialogDescription>
            Please provide your credentials to connect your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {integration.credentials.map(cred => (
            <div key={cred.id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={cred.id} className="text-right">
                {cred.label}
              </Label>
              <Input id={cred.id} className="col-span-3" onChange={e => setCreds(prev => ({ ...prev, [cred.id]: e.target.value }))} />
            </div>
          ))}
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Connection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


function ConfigurationTab({ agent, onConfigChange }: { agent: Agent; onConfigChange: (section: keyof NonNullable<Agent['configurations']>, key: string, value: any) => void; }) {
  const cfg = agent.configurations || {};
  const { toast } = useToast();

  const handlePreviewVoice = (voice: Voice) => {
    toast({
        title: "Playing Voice Preview",
        description: `Playing preview for ${voice.name}. This is a placeholder action.`
    })
    // In a real implementation, you would call the textToSpeech Genkit flow here.
    // e.g., textToSpeechAction({ text: "Hello, this is a preview of my voice.", voice: voice.id })
  };

  const fillerPhrases = cfg.behavior?.fillerPhrases || [];
  const handleAddFillerPhrase = () => {
    // Placeholder function to add a new phrase
    const newPhrase = "Umm...";
    onConfigChange('behavior', 'fillerPhrases', [...fillerPhrases, newPhrase]);
  };
  const handleRemoveFillerPhrase = (index: number) => {
     const newPhrases = [...fillerPhrases];
     newPhrases.splice(index, 1);
     onConfigChange('behavior', 'fillerPhrases', newPhrases);
  };


  const availableVoices: Voice[] = [
    { id: 'algenib-1', name: 'Algenib', gender: 'Female', accent: 'American', provider: 'Google', quality: 'High', engine: 'Standard' },
    { id: 'achernar-1', name: 'Achernar', gender: 'Male', accent: 'British', provider: 'Google', quality: 'High', engine: 'Standard' },
    { id: 'eleven-sarah', name: 'Sarah', gender: 'Female', accent: 'American', provider: 'Eleven Labs', quality: 'Very High', engine: 'v2' },
     { id: 'eleven-arnold', name: 'Arnold', gender: 'Male', accent: 'American', provider: 'Eleven Labs', quality: 'Very High', engine: 'v2' },
  ];

  return (
      <Card className="h-full">
          <CardHeader>
              <CardTitle>Configurations</CardTitle>
              <CardDescription>
                  Fine-tune the technical aspects of your AI agent.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                  <Accordion type="multiple" defaultValue={['models', 'voice', 'behavior', 'call-transfer', 'call-ending']} className="w-full">
                      
                      <AccordionItem value="models">
                          <AccordionTrigger className="text-base font-semibold">
                            <div className="flex items-center gap-3">
                              <BrainCircuit className="h-5 w-5 text-primary" /> Models
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-6">
                              <Card>
                                  <CardHeader>
                                    <h4 className="font-medium flex items-center gap-2"><Mic className="h-4 w-4" /> Speech-to-Text (STT)</h4>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                              <Label>Provider</Label>
                                              <Select value={cfg.stt?.provider || 'google'} onValueChange={v => onConfigChange('stt', 'provider', v)}>
                                                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="google">Google</SelectItem>
                                                      <SelectItem value="whisper">Whisper</SelectItem>
                                                      <SelectItem value="azure">Azure</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="space-y-2">
                                              <Label>Language</Label>
                                              <Select value={cfg.stt?.language || 'en-US'} onValueChange={v => onConfigChange('stt', 'language', v)}>
                                                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="en-US">English (US)</SelectItem>
                                                      <SelectItem value="hi-IN">Hindi</SelectItem>
                                                      <SelectItem value="gu-IN">Gujarati</SelectItem>
                                                      <SelectItem value="mr-IN">Marathi</SelectItem>
                                                      <SelectItem value="pa-IN">Punjabi</SelectItem>
                                                      <SelectItem value="bn-IN">Bengali</SelectItem>
                                                      <SelectItem value="ta-IN">Tamil</SelectItem>
                                                      <SelectItem value="te-IN">Telugu</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                      </div>
                                       <div className="space-y-2">
                                            <Label>Silence Timeout: {cfg.stt?.silenceTimeout || 1.0}s</Label>
                                            <Slider defaultValue={[cfg.stt?.silenceTimeout || 1.0]} max={5} step={0.1} onValueChange={([v]) => onConfigChange('stt', 'silenceTimeout', v)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Interruption Sensitivity: {cfg.stt?.interruptionSensitivity || 0.8}</Label>
                                            <Slider defaultValue={[cfg.stt?.interruptionSensitivity || 0.8]} max={1} step={0.1} onValueChange={([v]) => onConfigChange('stt', 'interruptionSensitivity', v)} />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <Label>Noise Reducer</Label>
                                            <Switch checked={cfg.stt?.enableNoiseReducer} onCheckedChange={v => onConfigChange('stt', 'enableNoiseReducer', v)} />
                                        </div>
                                  </CardContent>
                              </Card>
                              <Card>
                                  <CardHeader>
                                    <h4 className="font-medium flex items-center gap-2"><Bot className="h-4 w-4" /> Language Model (LLM)</h4>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                      <div className="grid grid-cols-1 gap-4">
                                          <div className="space-y-2">
                                              <Label>Model Provider</Label>
                                              <Select value={cfg.llm?.provider || 'gemini-2.5-flash'} onValueChange={v => onConfigChange('llm', 'provider', v)}>
                                                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                                                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                                      <SelectItem value="llama3">Llama 3</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                           <div className="space-y-2">
                                              <Label>Temperature: {cfg.llm?.temperature || 0.7}</Label>
                                              <Slider defaultValue={[cfg.llm?.temperature || 0.7]} max={1} step={0.1} onValueChange={([v]) => onConfigChange('llm', 'temperature', v)} />
                                          </div>
                                      </div>
                                       <div className="flex items-center justify-between pt-2">
                                            <Label>Streaming</Label>
                                            <Switch checked={cfg.llm?.enableStreaming} onCheckedChange={v => onConfigChange('llm', 'enableStreaming', v)} />
                                        </div>
                                  </CardContent>
                              </Card>
                          </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="voice">
                          <AccordionTrigger className="text-base font-semibold">
                            <div className="flex items-center gap-3">
                              <Languages className="h-5 w-5 text-primary" /> Voice
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Voice Library</CardTitle>
                                        <CardDescription>Select and preview voices for your agent.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Input placeholder="Search by name or language..." className="md:col-span-1" />
                                            <Select>
                                                <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Providers</SelectItem>
                                                    <SelectItem value="google">Google</SelectItem>
                                                    <SelectItem value="eleven-labs">Eleven Labs</SelectItem>
                                                </SelectContent>
                                            </Select>
                                             <RadioGroup defaultValue="all" className="flex items-center gap-4">
                                                <Label>Gender:</Label>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="all" id="gender-all" />
                                                    <Label htmlFor="gender-all">All</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="male" id="gender-male" />
                                                    <Label htmlFor="gender-male">Male</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="female" id="gender-female" />
                                                    <Label htmlFor="gender-female">Female</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                            {availableVoices.map((voice) => (
                                                <Card key={voice.id} className={cn("flex flex-col", cfg.voice?.voiceId === voice.id && "border-primary")}>
                                                    <CardHeader>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <CardTitle className="text-base">{voice.name}</CardTitle>
                                                                <CardDescription>{voice.gender} &bull; {voice.accent}</CardDescription>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Badge variant="outline">{voice.provider}</Badge>
                                                                <Badge variant="secondary">{voice.engine}</Badge>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardFooter className="mt-auto flex justify-between items-center">
                                                        <Button variant="outline" size="sm" onClick={() => handlePreviewVoice(voice)}><Play className="mr-2 h-4 w-4" /> Preview</Button>
                                                        <Button size="sm" onClick={() => onConfigChange('voice', 'voiceId', voice.id)} disabled={cfg.voice?.voiceId === voice.id}>
                                                            {cfg.voice?.voiceId === voice.id ? "Selected" : "Select"}
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                          </AccordionContent>
                      </AccordionItem>
                      
                       <AccordionItem value="behavior">
                          <AccordionTrigger className="text-base font-semibold">
                            <div className="flex items-center gap-3">
                               <Smile className="h-5 w-5 text-primary" /> Behavior
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 grid md:grid-cols-2 gap-6">
                               <Card>
                                   <CardHeader>
                                        <CardTitle className="text-lg">Filler Phrases</CardTitle>
                                        <div className="flex items-center justify-between pt-2">
                                            <Label htmlFor="enable-filler-phrases">Enable Filler Phrases</Label>
                                            <Switch id="enable-filler-phrases" checked={cfg.behavior?.enableFillerPhrases} onCheckedChange={v => onConfigChange('behavior', 'enableFillerPhrases', v)} />
                                        </div>
                                   </CardHeader>
                                   <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Delay</Label>
                                            <Select defaultValue="medium">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="short">Short</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="long">Long</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Phrases</Label>
                                            <div className="space-y-2 mt-2">
                                                {fillerPhrases.map((phrase, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input value={phrase} readOnly className="bg-secondary" />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveFillerPhrase(index)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                             <Button variant="outline" size="sm" className="mt-2" onClick={handleAddFillerPhrase}><Plus className="mr-2 h-4 w-4"/> Add Phrase</Button>
                                        </div>
                                   </CardContent>
                               </Card>
                               <Card>
                                   <CardHeader>
                                       <CardTitle className="text-lg">Personality</CardTitle>
                                   </CardHeader>
                                   <CardContent className="space-y-4">
                                       <div className="space-y-2">
                                           <Label>Tone of Voice</Label>
                                           <Select value={cfg.behavior?.toneOfVoice} onValueChange={v => onConfigChange('behavior', 'toneOfVoice', v)}>
                                               <SelectTrigger><SelectValue placeholder="Select a tone" /></SelectTrigger>
                                               <SelectContent>
                                                   <SelectItem value="professional">Professional</SelectItem>
                                                   <SelectItem value="friendly">Friendly</SelectItem>
                                                   <SelectItem value="empathetic">Empathetic</SelectItem>
                                               </SelectContent>
                                           </Select>
                                       </div>
                                       <div className="space-y-2">
                                           <Label>Assistant Style</Label>
                                           <Textarea value={cfg.behavior?.assistantStyle} onChange={e => onConfigChange('behavior', 'assistantStyle', e.target.value)} placeholder="e.g., A helpful and curious assistant..." />
                                       </div>
                                   </CardContent>
                               </Card>
                          </AccordionContent>
                      </AccordionItem>


                      <AccordionItem value="call-transfer">
                          <AccordionTrigger className="text-base font-semibold">
                             <div className="flex items-center gap-3">
                              <PhoneForwarded className="h-5 w-5 text-primary" /> Call Transfer
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                               <div className="flex items-center justify-between p-4 border rounded-lg">
                                  <Label htmlFor="enable-call-transfer">Enable Call Transfer</Label>
                                  <Switch id="enable-call-transfer" checked={cfg.callTransfer?.enabled} onCheckedChange={v => onConfigChange('callTransfer', 'enabled', v)} />
                              </div>
                              {cfg.callTransfer?.enabled && (
                                <Card>
                                  <CardContent className="pt-6 space-y-4">
                                      <div className="space-y-2">
                                          <Label>Transfer Phone Number</Label>
                                          <Input value={cfg.callTransfer?.phoneNumber} onChange={e => onConfigChange('callTransfer', 'phoneNumber', e.target.value)} placeholder="+1 (555) 123-4567" />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Transfer Condition</Label>
                                           <Textarea value={cfg.callTransfer?.condition} onChange={e => onConfigChange('callTransfer', 'condition', e.target.value)} placeholder="e.g., If user says 'speak to a human'" />
                                      </div>
                                       <div className="space-y-2">
                                          <Label>Transfer Message</Label>
                                           <Textarea value={cfg.callTransfer?.transferMessage} onChange={e => onConfigChange('callTransfer', 'transferMessage', e.target.value)} placeholder="e.g., Please wait while I connect you to a human representative." />
                                      </div>
                                  </CardContent>
                                </Card>
                              )}
                          </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="call-ending">
                          <AccordionTrigger className="text-base font-semibold">
                             <div className="flex items-center gap-3">
                                <Voicemail className="h-5 w-5 text-primary" /> Call Ending
                              </div>
                          </AccordionTrigger>
                           <AccordionContent className="pt-4 space-y-4">
                               <div className="flex items-center justify-between p-4 border rounded-lg">
                                  <Label htmlFor="enable-auto-end">Enable Automatic Call Ending</Label>
                                  <Switch id="enable-auto-end" checked={cfg.callEnding?.enableAutoEnding} onCheckedChange={v => onConfigChange('callEnding', 'enableAutoEnding', v)} />
                              </div>
                              {cfg.callEnding?.enableAutoEnding && (
                                 <Card>
                                    <CardContent className="pt-6 space-y-4">
                                      <div className="space-y-2">
                                          <Label>End Call Condition</Label>
                                          <Textarea value={cfg.callEnding?.endCallCondition} onChange={e => onConfigChange('callEnding', 'endCallCondition', e.target.value)} placeholder="e.g., If user says 'goodbye'" />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>End Call Message</Label>
                                          <Textarea value={cfg.callEnding?.endCallMessage} onChange={e => onConfigChange('callEnding', 'endCallMessage', e.target.value)} placeholder="e.g., Thank you for calling. Goodbye." />
                                      </div>
                                   </CardContent>
                                 </Card>
                              )}
                           </AccordionContent>
                      </AccordionItem>

                  </Accordion>
              </ScrollArea>
          </CardContent>
      </Card>
  )
}

function PostCallTab({ agent, updateAgent }: { agent: Agent, updateAgent: (data: Partial<Agent>) => void }) {
  const [configs, setConfigs] = useState<PostCallConfig[]>(agent.postCallConfigs || []);

  const handleUpdate = (updatedConfigs: PostCallConfig[]) => {
    setConfigs(updatedConfigs);
    updateAgent({ postCallConfigs: updatedConfigs });
  };

  const addConfig = () => {
    const newConfig: PostCallConfig = {
      id: `config-${Date.now()}`,
      deliveryMethod: 'webhook',
      include: {
        callSummary: true,
        fullConversation: false,
        sentimentAnalysis: false,
        extractedInformation: true,
      },
      extractedVariables: [],
    };
    handleUpdate([...configs, newConfig]);
  };

  const removeConfig = (id: string) => {
    handleUpdate(configs.filter(c => c.id !== id));
  };
  
  const updateConfig = (id: string, newConfig: Partial<PostCallConfig>) => {
    handleUpdate(configs.map(c => c.id === id ? { ...c, ...newConfig } : c));
  }
  
  const addVariable = (configId: string) => {
    const newVariable: ExtractedVariable = {
        id: `var-${Date.now()}`,
        name: '',
        description: ''
    };
    const config = configs.find(c => c.id === configId);
    if(config) {
        updateConfig(configId, { extractedVariables: [...(config.extractedVariables || []), newVariable] });
    }
  }
  
  const removeVariable = (configId: string, varId: string) => {
      const config = configs.find(c => c.id === configId);
      if(config) {
        updateConfig(configId, { extractedVariables: config.extractedVariables?.filter(v => v.id !== varId) });
      }
  }
  
  const updateVariable = (configId: string, varId: string, updatedVar: Partial<ExtractedVariable>) => {
      const config = configs.find(c => c.id === configId);
      if(config) {
          const updatedVars = config.extractedVariables?.map(v => v.id === varId ? {...v, ...updatedVar} : v);
          updateConfig(configId, { extractedVariables: updatedVars });
      }
  }


  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Post-Call Delivery Settings</CardTitle>
          <CardDescription>Configure where call data is sent after completion.</CardDescription>
        </div>
        <Button onClick={addConfig}><Plus className="mr-2 h-4 w-4" />Add Configuration</Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-350px)] pr-4">
          {configs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-secondary/30">
              <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Post-Call Configurations</h3>
              <p className="text-muted-foreground mt-2">Click 'Add Configuration' to set up data delivery.</p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={configs.map(c => c.id)} className="w-full space-y-4">
              {configs.map((config, index) => (
                <AccordionItem key={config.id} value={config.id} className="border rounded-lg">
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-t-lg">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline flex-1">
                       <span>Configuration #{index + 1}</span>
                    </AccordionTrigger>
                     <Button size="icon" variant="ghost" onClick={() => removeConfig(config.id)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                  <AccordionContent className="p-4 pt-0 space-y-6">
                    <div className="space-y-2">
                       <Label>Delivery Method</Label>
                       <Select 
                         value={config.deliveryMethod}
                         onValueChange={(value) => updateConfig(config.id, { deliveryMethod: value as any })}
                       >
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="webhook">Webhook</SelectItem>
                           <SelectItem value="email">Email</SelectItem>
                           <SelectItem value="crm">CRM Integration</SelectItem>
                           <SelectItem value="google-sheets">Google Sheets</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Data to Include</Label>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <div className="flex items-center space-x-2">
                             <Checkbox id={`summary-${config.id}`} checked={config.include.callSummary} onCheckedChange={(checked) => updateConfig(config.id, { include: {...config.include, callSummary: !!checked} })} />
                             <Label htmlFor={`summary-${config.id}`} className="flex items-center gap-2"><BookText className="h-4 w-4"/> Call Summary</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Checkbox id={`convo-${config.id}`} checked={config.include.fullConversation} onCheckedChange={(checked) => updateConfig(config.id, { include: {...config.include, fullConversation: !!checked} })}/>
                             <Label htmlFor={`convo-${config.id}`} className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/> Full Conversation</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Checkbox id={`sentiment-${config.id}`} checked={config.include.sentimentAnalysis} onCheckedChange={(checked) => updateConfig(config.id, { include: {...config.include, sentimentAnalysis: !!checked} })}/>
                             <Label htmlFor={`sentiment-${config.id}`} className="flex items-center gap-2"><BarChart className="h-4 w-4"/> Sentiment Analysis</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Checkbox id={`info-${config.id}`} checked={config.include.extractedInformation} onCheckedChange={(checked) => updateConfig(config.id, { include: {...config.include, extractedInformation: !!checked} })}/>
                             <Label htmlFor={`info-${config.id}`} className="flex items-center gap-2"><FileJson className="h-4 w-4"/> Extracted Information</Label>
                           </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <Label>Extracted Variables</Label>
                            <Button variant="outline" size="sm" onClick={() => addVariable(config.id)}><Plus className="mr-2 h-4 w-4"/>Add Variable</Button>
                         </div>
                         <div className="space-y-2 pt-2">
                            {config.extractedVariables?.map(variable => (
                                <div key={variable.id} className="grid grid-cols-10 gap-2 items-center">
                                    <Input 
                                      placeholder="Variable Name" 
                                      className="col-span-4" 
                                      value={variable.name}
                                      onChange={(e) => updateVariable(config.id, variable.id, { name: e.target.value })}
                                    />
                                    <Input 
                                      placeholder="Description" 
                                      className="col-span-5"
                                      value={variable.description}
                                      onChange={(e) => updateVariable(config.id, variable.id, { description: e.target.value })}
                                    />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeVariable(config.id, variable.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                         </div>
                    </div>

                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


function TestAgentDialog({ agent }: { agent: Agent }) {
  const { toast } = useToast()
  const [agents] = useLocalStorage<Agent[]>("agents", [])
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(agent.id)
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agent;

  return (
    <Dialog>
      <DialogTrigger asChild>
         <Button variant="outline">
            <FlaskConical className="h-4 w-4 mr-2" />
            Test Agent
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Test your Agent</DialogTitle>
          <DialogDescription>
            Interact with your agent using different channels to test its responses and integrations.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
            <Label htmlFor="select-agent-test">Select Agent</Label>
            <Select onValueChange={setSelectedAgentId} value={selectedAgentId}>
                <SelectTrigger id="select-agent-test">
                    <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                    {agents.length > 0 ? (
                        agents.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-agent" disabled>No agents found</SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>

        <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="web-call">Web Call</TabsTrigger>
                <TabsTrigger value="phone-call">Phone Call</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
                <ChatTab agent={selectedAgent} />
            </TabsContent>
            <TabsContent value="web-call">
                <WebCallTab agent={selectedAgent} />
            </TabsContent>
            <TabsContent value="phone-call">
                <PhoneCallTab agent={selectedAgent} />
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function ChatTab({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isThinking, startTransition] = useTransition()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  useEffect(() => {
    let initialMessageContent = "Hello! I am ready to start the conversation.";
    const firstAiMessage = agent?.conversationFlow?.find(step => step.type === 'aiMessage');
    if (firstAiMessage?.content) {
        initialMessageContent = firstAiMessage.content;
    }
    setMessages([{ role: 'assistant', content: initialMessageContent }]);
  }, [agent])

  const handleSendMessage = () => {
    if (!input.trim() || !agent) return

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    const currentInput = input;
    setInput("")

    startTransition(async () => {
      try {
        const serializableAgent = {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            conversationFlow: agent.conversationFlow || [],
            status: agent.status,
            avatar: agent.avatar,
            createdAt: agent.createdAt,
            lastEdited: agent.lastEdited,
            configurations: agent.configurations,
        };

        const { answer } = await runAgentAction({ agent: serializableAgent, messages: newMessages });
        setMessages(prev => [...prev, { role: 'assistant', content: answer }]);

        const { audio } = await textToSpeechAction({ text: answer, voice: agent.configurations?.voice?.voiceId });
        
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

  return (
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>Chat with Agent</CardTitle>
            <CardDescription>Test your assistant in a text-based conversation.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-72 w-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                     {messages.map((message, index) => (
                         <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{message.role === 'assistant' ? agent.name.substring(0,2).toUpperCase() : 'You'}</AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg p-3 text-sm max-w-[80%] ${message.role === 'assistant' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}
                     {isThinking && (
                      <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                              <AvatarFallback>{agent.name.substring(0,2).toUpperCase()}</AvatarFallback>
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
                    placeholder="Type your response..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isThinking}
                />
                <Button size="icon" aria-label="Send message" onClick={handleSendMessage} disabled={isThinking}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </CardFooter>
        <audio ref={audioRef} className="hidden" />
    </Card>
  )
}

function WebCallTab({ agent }: { agent: Agent }) {
    const { toast } = useToast();
    const [isCallActive, setIsCallActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<ChatMessage[]>([]);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const addMessageToTranscript = (message: ChatMessage) => {
        setTranscript(prev => [...prev, message]);
    }

    const processAudio = async (audioBlob: Blob) => {
        setIsListening(false);
        setIsThinking(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                
                // 1. Speech to Text
                const { text: userText } = await speechToTextAction({ audio: base64Audio, language: agent.configurations?.stt?.language });
                addMessageToTranscript({ role: 'user', content: userText });
                
                const currentTranscript = [...transcript, { role: 'user', content: userText }];

                // 2. Get AI Response
                // @ts-ignore
                const { answer: aiText } = await runAgentAction({ agent, messages: currentTranscript });
                addMessageToTranscript({ role: 'assistant', content: aiText });
                
                // 3. Text to Speech
                setIsThinking(false);
                setIsSpeaking(true);
                const { audio: aiAudio } = await textToSpeechAction({ text: aiText, voice: agent.configurations?.voice?.voiceId });
                
                if (audioRef.current) {
                    audioRef.current.src = aiAudio;
                    audioRef.current.play();
                    audioRef.current.onended = () => {
                        setIsSpeaking(false);
                        if (isCallActive) {
                           startListening(); // Listen for the next user input
                        }
                    };
                }
            };
        } catch (error) {
            console.error("Error processing audio:", error);
            toast({ title: "Error", description: "Could not process audio. Please try again.", variant: "destructive" });
            setIsThinking(false);
            setIsSpeaking(false);
        }
    };
    
    const startListening = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                     if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                    }
                     silenceTimeoutRef.current = setTimeout(() => {
                        if (mediaRecorderRef.current?.state === 'recording') {
                            mediaRecorderRef.current.stop();
                        }
                    }, 1500); // Stop after 1.5s of silence
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    if (audioBlob.size > 1000) { // Only process if there is some audio
                      processAudio(audioBlob);
                    } else {
                       // If no audio, just start listening again if the call is active
                       if(isCallActive) startListening();
                    }
                };
                
                mediaRecorderRef.current.start();
                setIsListening(true);
            })
            .catch(err => {
                console.error("Mic access denied:", err);
                toast({ title: "Microphone Access Denied", description: "Please allow microphone access to use this feature.", variant: "destructive"});
                setIsCallActive(false);
            });
    };

    const handleStartCall = () => {
        setIsCallActive(true);
        setTranscript([]);
        let initialMessageContent = "Hello, I am your agent. How can I help you today?";
        if (agent?.conversationFlow && agent.conversationFlow.length > 0) {
            const firstAiMessage = agent.conversationFlow.find(step => step.type === 'aiMessage');
            if (firstAiMessage && firstAiMessage.content) {
                initialMessageContent = firstAiMessage.content;
            }
        }
        addMessageToTranscript({ role: 'assistant', content: initialMessageContent });

        setIsSpeaking(true);
        textToSpeechAction({ text: initialMessageContent, voice: agent.configurations?.voice?.voiceId }).then(({audio}) => {
            if (audioRef.current) {
                audioRef.current.src = audio;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    setIsSpeaking(false);
                    startListening();
                };
            }
        });
    };

    const handleStopCall = () => {
        setIsCallActive(false);
        setIsListening(false);
        setIsThinking(false);
        setIsSpeaking(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
             // Clean up the stream tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
         if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    };
    
    useEffect(() => {
        return () => { // Cleanup on component unmount
            handleStopCall();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


   return (
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>Web Call with Agent</CardTitle>
            <CardDescription>Start an in-browser call with your agent using your microphone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                   Your free plan includes 12 minutes of web call time.
                </AlertDescription>
            </Alert>
            <div className="p-4 border-2 border-dashed rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center bg-secondary/30 space-y-4">
                 <div className="flex items-center gap-4 text-sm font-medium">
                     <div className={cn("flex items-center gap-2", isListening ? "text-primary" : "text-muted-foreground")}>
                        {isListening ? <LoaderCircle className="animate-spin h-4 w-4"/> : <Circle className="h-3 w-3 fill-current"/> }
                        Listening
                     </div>
                      <div className={cn("flex items-center gap-2", isThinking ? "text-primary" : "text-muted-foreground")}>
                        {isThinking ? <LoaderCircle className="animate-spin h-4 w-4"/> : <Circle className="h-3 w-3 fill-current"/> }
                        Thinking
                     </div>
                      <div className={cn("flex items-center gap-2", isSpeaking ? "text-primary" : "text-muted-foreground")}>
                        {isSpeaking ? <LoaderCircle className="animate-spin h-4 w-4"/> : <Circle className="h-3 w-3 fill-current"/> }
                        Speaking
                     </div>
                 </div>

                <ScrollArea className="h-48 w-full bg-background rounded-md p-2 text-left">
                    {transcript.map((msg, i) => (
                        <div key={i} className="text-sm">
                           <span className={cn("font-bold", msg.role === 'user' ? 'text-blue-400' : 'text-purple-400')}>{msg.role === 'user' ? "You" : "Agent"}:</span> {msg.content}
                        </div>
                    ))}
                    {transcript.length === 0 && <p className="text-muted-foreground">Live transcription will appear here...</p>}
                </ScrollArea>
                
                {!isCallActive ? (
                    <Button onClick={handleStartCall}><Mic className="mr-2" /> Start Web Call</Button>
                ) : (
                    <Button onClick={handleStopCall} variant="destructive"><PhoneOff className="mr-2" /> Stop Call</Button>
                )}
            </div>
        </CardContent>
         <audio ref={audioRef} className="hidden" />
    </Card>
   )
}

function PhoneCallTab({ agent }: { agent: Agent }) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Phone Call with Agent</CardTitle>
                <CardDescription>Receive a call on your phone to test the agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Select defaultValue="+91">
                        <SelectTrigger className="w-[80px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="+91">IN +91</SelectItem>
                            <SelectItem value="+1">US +1</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Your phone number" />
                </div>
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Upgrade Required</AlertTitle>
                    <AlertDescription>
                       Free plan: Max 2 calls, 2 minutes each.
                       <Button variant="link" className="p-0 h-auto ml-1">Upgrade Now.</Button>
                    </AlertDescription>
                </Alert>
                <div className="p-4 border-2 border-dashed rounded-lg min-h-[150px] flex flex-col items-center justify-center text-center bg-secondary/30">
                    <p className="text-muted-foreground mb-4">Call logs will appear here...</p>
                    <Button><Phone className="mr-2" /> Start Phone Call</Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">You should receive the call within 2 minutes.</p>
            </CardContent>
        </Card>
    )
}
