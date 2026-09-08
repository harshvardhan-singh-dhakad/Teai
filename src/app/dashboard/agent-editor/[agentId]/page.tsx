"use client"

import React, { useEffect, useState, useRef, useTransition, useCallback } from "react"
import { notFound, useRouter, useParams } from 'next/navigation'
import { ArrowLeft, HardDriveUpload, FlaskConical, UploadCloud, FileText, Trash2, Eye, Languages, Mic, BrainCircuit, PhoneForwarded, Voicemail, Bot, Smile, Info, Plus, GripVertical, Phone, Calendar, Slack, Zap, Briefcase, Play, BookText, MessageSquare, BarChart, FileJson, Globe, Database, LoaderCircle, Send, Volume2, PhoneOff, Settings, Check, Square, Circle, Archive } from "lucide-react"
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc, collection, addDoc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
import { trainFromWebsiteAction, getAssistantResponse } from "@/app/actions"
import { runAgent } from '@/ai/flows/run-agent-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons";

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
  return <Droppable {...props} ignoreContainerClipping={true}>{children}</Droppable>;
};

export default function AgentEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const agentId = params.agentId as string;
  const agentRef = useRef(doc(db, "agents", agentId));

  useEffect(() => {
    if (!agentId) return;
    
    setIsLoading(true);
    const unsubscribe = onSnapshot(agentRef.current, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const agentData = {
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          lastEdited: (data.lastEdited as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
           conversationFlow: Array.isArray(data.conversationFlow) ? data.conversationFlow.map((step, index) => ({
                ...step,
                id: step.id || `${Date.now()}-${index}`
            })) : [],
        } as Agent
        setAgent(agentData);
        setHasUnpublishedChanges(false);
      } else {
        notFound();
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching agent:", error);
        toast({ title: "Error", description: "Failed to load agent data.", variant: "destructive"});
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [agentId, toast]);

  const updateAgent = useCallback(async (updatedFields: Partial<Agent>) => {
    try {
      await updateDoc(agentRef.current, {
        ...updatedFields,
        lastEdited: serverTimestamp()
      });
      setAgent(prev => prev ? ({ ...prev, ...updatedFields, lastEdited: new Date().toISOString() }) : null);
      if(agent?.status === 'published') {
          setHasUnpublishedChanges(true);
      }
    } catch (error) {
        console.error("Error updating agent:", error);
        toast({ title: "Update Failed", description: "Could not save changes to Firestore.", variant: "destructive" });
    }
  }, [agent?.status, toast]);
  
  const updateAgentConfig = (configSection: keyof NonNullable<Agent['configurations']>, key: string, value: any) => {
    if (!agent) return;
    const updatedConfig = {
      ...(agent.configurations || {}),
      [configSection]: {
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

  const handlePublish = async () => {
    if (!agent) return
    await updateAgent({ status: 'published' });
    setHasUnpublishedChanges(false);
    toast({ title: "Agent Published!", description: `"${agent.name}" is now live.` })
  }
  
  const handleUnpublish = async () => {
    if (!agent) return;
    await updateAgent({ status: 'draft' });
    setHasUnpublishedChanges(false);
    toast({ title: "Agent Unpublished", description: `"${agent.name}" is now a draft.`, variant: 'destructive' });
  };

  if (isLoading || !agent) {
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
                 <Button className="bg-green-600 hover:bg-green-700 text-white">
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
                  <CardDescription>Review recent call logs for this agent. Coming soon.</CardDescription>
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
       <div className="lg:col-span-1 flex flex-col gap-4">
        <AssistantChatbot />
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
          <CardDescription>Define the core identity of your agent.</CardDescription>
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
                        <Switch id="dynamic-mode" checked={agent.isDynamic} onCheckedChange={(checked) => updateAgent({ isDynamic: checked })} />
                        <Label htmlFor="dynamic-mode">Dynamic</Label>
                    </div>
                    <Button variant="outline" onClick={addStep}><Plus className="h-4 w-4 mr-2" />Add Step</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <DragDropContext onDragEnd={onDragEnd}>
                    <StrictModeDroppable droppableId="conversation-flow">
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
  }, [documents]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setFilesToUpload(Array.from(event.target.files))
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files) setFilesToUpload(Array.from(event.dataTransfer.files))
  }

  const handleUpload = () => {
    if (filesToUpload.length === 0) return
    const newDocs: Document[] = filesToUpload.map(f => ({
        id: `doc-${Date.now()}-${Math.random()}`,
        name: f.name,
        type: 'file',
        source: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        status: "Active",
        createdAt: new Date().toISOString(),
        content: `Simulated content for ${f.name}`
    }));
    setDocuments(prev => [...prev, ...newDocs]);
    setFilesToUpload([]);
    toast({ title: "Upload Successful" });
  }

  const handleFetchAndTrain = async () => {
    if(!websiteUrl) return
    setIsTraining(true);
     try {
        const { title, charCount, content } = await trainFromWebsiteAction({ url: websiteUrl });
        const newDoc: Document = {
            id: `doc-${Date.now()}`,
            name: title,
            type: 'website',
            source: websiteUrl,
            size: `${(charCount / 1024).toFixed(2)} KB`,
            status: "Active",
            createdAt: new Date().toISOString(),
            content: content,
        }
        setDocuments(prev => [newDoc, ...prev]);
        setWebsiteUrl("");
        toast({ title: "Training Complete" });
    } catch (error) {
        toast({ title: "Scraping Failed", variant: "destructive" })
    } finally {
        setIsTraining(false);
    }
  }

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId))
  }

  return (
    <div className="grid gap-6">
       <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
             <Tabs defaultValue="file-upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file-upload">Upload File</TabsTrigger>
                    <TabsTrigger value="website-import">Website</TabsTrigger>
                </TabsList>
                <TabsContent value="file-upload">
                    <Card className="mt-4">
                      <CardHeader><CardTitle className="text-lg">Upload Documents</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('file-upload-input')?.click()}
                        >
                          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-center text-muted-foreground text-sm">Drag & drop, or click to browse</p>
                          <input id="file-upload-input" type="file" className="hidden" multiple accept=".pdf,.docx,.txt" onChange={handleFileChange} />
                        </div>
                        {filesToUpload.length > 0 && (
                          <div className="text-sm text-muted-foreground">Selected: {filesToUpload.map(f => f.name).join(", ")}</div>
                        )}
                        <Button className="w-full" onClick={handleUpload} disabled={filesToUpload.length === 0}>Upload</Button>
                      </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="website-import">
                    <Card className="mt-4">
                        <CardHeader><CardTitle className="text-lg">Website</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} disabled={isTraining} />
                            <Button className="w-full" onClick={handleFetchAndTrain} disabled={isTraining}>
                                {isTraining ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : "Fetch & Train"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
             </Tabs>
          </div>
          <div className="lg:col-span-2">
             <Card>
                <CardHeader><CardTitle className="text-lg">Knowledge Sources</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
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
                           <TableCell>{doc.type}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell className="flex gap-1">
                             <Button variant="ghost" size="icon" onClick={() => setViewingDocument(doc)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
          </div>
        </div>
        {viewingDocument && (
            <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader><DialogTitle>{viewingDocument.name}</DialogTitle></DialogHeader>
                    <ScrollArea className="max-h-[60vh] my-4 pr-4"><pre className="text-sm whitespace-pre-wrap">{viewingDocument.content}</pre></ScrollArea>
                </DialogContent>
            </Dialog>
        )}
    </div>
  )
}

function IntegrationsTab({ agent, onIntegrationChange }: { agent: Agent, onIntegrationChange: (id: keyof NonNullable<Agent['integrations']>, connected: boolean, creds?: any) => void }) {
  const allIntegrations: (Integration & { usage: 'During call' | 'Post-call' })[] = [
    { id: "twilio", name: "Twilio", description: "Connect for voice and SMS.", icon: Phone, group: 'calling', usage: 'During call', credentials: [{ id: 'accountSid', label: 'Account SID' }, { id: 'authToken', label: 'Auth Token' }] },
    { id: "slack", name: "Slack", description: "Send data to channels.", icon: Slack, group: 'other', usage: 'Post-call', credentials: [{id: 'webhookUrl', label: 'Webhook URL'}] },
    { id: "zapier", name: "Zapier", description: "Connect to thousands of apps.", icon: Zap, group: 'other', usage: 'Post-call', credentials: [] },
  ];

  const handleConnect = (id: keyof NonNullable<Agent['integrations']>, creds?: any) => onIntegrationChange(id, true, creds);
  const handleDisconnect = (id: keyof NonNullable<Agent['integrations']>) => onIntegrationChange(id, false, {});

  return (
    <div className="grid gap-6">
        {allIntegrations.map(integration => {
            const isConnected = agent.integrations?.[integration.id as keyof Agent['integrations']]?.connected || false;
            return (
                 <Card key={integration.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <integration.icon className="h-8 w-8 text-primary" />
                            <div><CardTitle>{integration.name}</CardTitle><CardDescription>{integration.description}</CardDescription></div>
                        </div>
                        <IntegrationButton integration={integration} isConnected={isConnected} onConnect={handleConnect} onDisconnect={handleDisconnect} />
                    </CardHeader>
                </Card>
            )
        })}
    </div>
  )
}

function IntegrationButton({ integration, isConnected, onConnect, onDisconnect }: { integration: Integration; isConnected: boolean; onConnect: (id: any, creds?: any) => void; onDisconnect: (id: any) => void; }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creds, setCreds] = useState<Record<string, string>>({});
  const handleSave = () => { onConnect(integration.id, creds); setDialogOpen(false); }
  if (isConnected) return <Button variant="destructive" onClick={() => onDisconnect(integration.id)}>Disconnect</Button>
  if (!integration.credentials || integration.credentials.length === 0) return <Button onClick={() => onConnect(integration.id)}>Connect</Button>
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild><Button>Connect</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Connect to {integration.name}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          {integration.credentials.map(cred => (
            <div key={cred.id} className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{cred.label}</Label>
              <Input className="col-span-3" onChange={e => setCreds(prev => ({ ...prev, [cred.id]: e.target.value }))} />
            </div>
          ))}
        </div>
        <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfigurationTab({ agent, onConfigChange }: { agent: Agent; onConfigChange: (section: keyof NonNullable<Agent['configurations']>, key: string, value: any) => void; }) {
  const cfg = agent.configurations || {};
  return (
      <Card className="h-full">
          <CardHeader><CardTitle>Configurations</CardTitle></CardHeader>
          <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                  <Accordion type="multiple" defaultValue={['models', 'voice']} className="w-full">
                      <AccordionItem value="models">
                          <AccordionTrigger className="text-base font-semibold">Models</AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-6">
                              <Card>
                                  <CardHeader><h4 className="font-medium flex items-center gap-2"><Mic className="h-4 w-4" /> STT</h4></CardHeader>
                                  <CardContent className="space-y-4">
                                      <Select value={cfg.stt?.language || 'en-US'} onValueChange={v => onConfigChange('stt', 'language', v)}>
                                          <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="en-US">English (US)</SelectItem>
                                              <SelectItem value="hi-IN">Hindi</SelectItem>
                                          </SelectContent>
                                      </Select>
                                       <div className="space-y-2">
                                            <Label>Silence Timeout: {cfg.stt?.silenceTimeout || 1.0}s</Label>
                                            <Slider defaultValue={[cfg.stt?.silenceTimeout || 1.0]} max={5} step={0.1} onValueChange={([v]) => onConfigChange('stt', 'silenceTimeout', v)} />
                                        </div>
                                  </CardContent>
                              </Card>
                          </AccordionContent>
                      </AccordionItem>
                       <AccordionItem value="voice">
                          <AccordionTrigger className="text-base font-semibold">Voice (ElevenLabs)</AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                                <Select value={cfg.voice?.voiceId || 'Rachel'} onValueChange={v => onConfigChange('voice', 'voiceId', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Voice" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Rachel">Rachel</SelectItem>
                                        <SelectItem value="Domi">Domi</SelectItem>
                                        <SelectItem value="Bella">Bella</SelectItem>
                                        <SelectItem value="Antoni">Antoni</SelectItem>
                                    </SelectContent>
                                </Select>
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
              </ScrollArea>
          </CardContent>
      </Card>
  )
}

function PostCallTab({ agent, updateAgent }: { agent: Agent, updateAgent: (data: Partial<Agent>) => void }) {
  return <Card><CardHeader><CardTitle>Post-Call Delivery</CardTitle><CardDescription>Coming Soon</CardDescription></CardHeader></Card>
}

function TestAgentDialog({ agent }: { agent: Agent }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline"><FlaskConical className="h-4 w-4 mr-2" />Test Agent</Button></DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader><DialogTitle>Test: {agent.name}</DialogTitle></DialogHeader>
        <Tabs defaultValue={"chat"} className="w-full">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="chat">Chat</TabsTrigger><TabsTrigger value="web-call">Web Call</TabsTrigger></TabsList>
            <TabsContent value="chat"><ChatTab agent={agent} /></TabsContent>
            <TabsContent value="web-call"><WebCallTab agent={agent} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function ChatTab({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput("");
    setIsThinking(true);
    try {
        const { answer, audio } = await runAgent({ agent, messages: newMessages });
        setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        if (audioRef.current) { audioRef.current.src = audio; audioRef.current.play(); }
    } catch (error) { console.error(error); } finally { setIsThinking(false); }
  };

  return (
    <Card className="mt-4">
        <CardContent className="h-72 overflow-auto p-4 space-y-2">
            {messages.map((m, i) => (
                <div key={i} className={cn("p-2 rounded max-w-[80%]", m.role === 'user' ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary")}>{m.content}</div>
            ))}
            {isThinking && <div className="text-xs animate-pulse">Thinking...</div>}
        </CardContent>
        <CardFooter className="gap-2"><Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} /><Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button></CardFooter>
        <audio ref={audioRef} className="hidden" />
    </Card>
  )
}

function WebCallTab({ agent }: { agent: Agent }) {
    return <Card className="mt-4 p-8 text-center"><Mic className="h-12 w-12 mx-auto mb-4" /><p>Web Call Simulator Interface Coming Soon.</p></Card>
}
