
"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter, useParams } from 'next/navigation'
import { ArrowLeft, HardDriveUpload, FlaskConical, Webhook, UploadCloud, FileText, Trash2, Eye, Languages, Mic, BrainCircuit, PhoneForwarded, Voicemail, Bot, Smile } from "lucide-react"

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
import type { Agent, Document } from "@/types"
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
  
  const updateAgentConfig = (configSection: keyof Agent['configurations'], key: string, value: any) => {
    if (!agent) return;
    const updatedConfig = {
      ...agent.configurations,
      [configSection]: {
        // @ts-ignore
        ...agent.configurations?.[configSection],
        [key]: value,
      },
    };
    updateAgent({ configurations: updatedConfig });
  };


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
            <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
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
             <TabsContent value="knowledge-base" className="h-full">
                <KnowledgeBaseTab agent={agent} updateAgent={updateAgent} />
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
             <TabsContent value="configurations" className="h-full">
                <ConfigurationTab agent={agent} onConfigChange={updateAgentConfig} />
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


function KnowledgeBaseTab({ agent, updateAgent }: { agent: Agent, updateAgent: (data: Partial<Agent>) => void }) {
  const { toast } = useToast()
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const documents = agent.knowledgeBase || [];

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
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          
          const newDocuments: Document[] = filesToUpload.map(file => ({
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            date: new Date().toISOString().split('T')[0],
            status: "Active" as const
          }));

          const updatedDocs = [...documents, ...newDocuments];
          updateAgent({ knowledgeBase: updatedDocs });

          setFilesToUpload([])
          
          toast({
            title: "Upload Successful",
            description: `${filesToUpload.length} document(s) have been added to the knowledge base.`,
          })
          
          return 100
        }
        return prev + 20
      })
    }, 500)
  }

  const handleDelete = (docName: string) => {
    const updatedDocs = documents.filter(doc => doc.name !== docName);
    updateAgent({ knowledgeBase: updatedDocs });
    toast({
        title: "Document Deleted",
        description: `"${docName}" has been removed from the knowledge base.`
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Knowledge Base</CardTitle>
        <CardDescription>
          Manage the knowledge sources for this agent. Uploaded documents will be used to answer user questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Upload Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground text-sm">
                    Drag & drop, or click to browse
                  </p>
                  <input
                    id="file-upload"
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

                {isUploading && (
                  <div className="space-y-2 pt-2">
                      <Label htmlFor="upload-progress">Uploading...</Label>
                      <Progress id="upload-progress" value={uploadProgress} />
                  </div>
                )}

                <Button className="w-full" onClick={handleUpload} disabled={isUploading || filesToUpload.length === 0}>
                  {isUploading ? "Uploading..." : "Upload Documents"}
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.name}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>{doc.date}</TableCell>
                          <TableCell>
                            <Badge
                              variant={doc.status === "Active" ? "outline" : "secondary"}
                              className={doc.status === 'Active' ? 'text-green-400 border-green-400' : ''}
                            >
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(doc.name)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {documents.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No documents uploaded for this agent yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConfigurationTab({ agent, onConfigChange }: { agent: Agent, onConfigChange: (section: keyof Agent['configurations'], key: string, value: any) => void }) {
  const cfg = agent.configurations || {};

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
                  <Accordion type="multiple" defaultValue={['models', 'voice', 'behavior']} className="w-full">
                      
                      <AccordionItem value="models">
                          <AccordionTrigger className="text-base font-semibold">
                            <div className="flex items-center gap-3">
                              <BrainCircuit className="h-5 w-5 text-primary" /> Models
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-6">
                              <div className="p-4 border rounded-lg space-y-4">
                                  <h4 className="font-medium flex items-center gap-2"><Mic className="h-4 w-4" /> Speech-to-Text (STT)</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                          <Label>Provider</Label>
                                          <Select value={cfg.stt?.provider} onValueChange={v => onConfigChange('stt', 'provider', v)}>
                                              <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="google">Google</SelectItem>
                                                  <SelectItem value="whisper">Whisper</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Language</Label>
                                          <Select value={cfg.stt?.language} onValueChange={v => onConfigChange('stt', 'language', v)}>
                                              <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="en-US">English (US)</SelectItem>
                                                  <SelectItem value="hi-IN">Hindi</SelectItem>
                                                  <SelectItem value="es-ES">Spanish</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                  </div>
                                   <div className="space-y-2">
                                        <Label>Silence Timeout: {cfg.stt?.silenceTimeout || 1.0}s</Label>
                                        <Slider defaultValue={[cfg.stt?.silenceTimeout || 1.0]} max={5} step={0.1} onValueChange={([v]) => onConfigChange('stt', 'silenceTimeout', v)} />
                                    </div>
                              </div>
                              <div className="p-4 border rounded-lg space-y-4">
                                  <h4 className="font-medium flex items-center gap-2"><Bot className="h-4 w-4" /> Language Model (LLM)</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                          <Label>Model</Label>
                                          <Select value={cfg.llm?.model} onValueChange={v => onConfigChange('llm', 'model', v)}>
                                              <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                       <div className="space-y-2">
                                          <Label>Temperature: {cfg.llm?.temperature || 0.7}</Label>
                                          <Slider defaultValue={[cfg.llm?.temperature || 0.7]} max={1} step={0.1} onValueChange={([v]) => onConfigChange('llm', 'temperature', v)} />
                                      </div>
                                  </div>
                              </div>
                          </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="voice">
                          <AccordionTrigger className="text-base font-semibold">
                            <div className="flex items-center gap-3">
                              <Languages className="h-5 w-5 text-primary" /> Voice
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Voice</Label>
                                    <Select value={cfg.voice?.voiceId} onValueChange={v => onConfigChange('voice', 'voiceId', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Algenib">Algenib (Female)</SelectItem>
                                            <SelectItem value="Achernar">Achernar (Male)</SelectItem>
                                             <SelectItem value="hi-IN-Standard-A">Hindi (Female)</SelectItem>
                                            <SelectItem value="hi-IN-Standard-B">Hindi (Male)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Speaking Rate: {cfg.voice?.speed || 1.0}x</Label>
                                    <Slider defaultValue={[cfg.voice?.speed || 1.0]} max={2} step={0.1} onValueChange={([v]) => onConfigChange('voice', 'speed', v)} />
                                </div>
                          </AccordionContent>
                      </AccordionItem>
                      
                       <AccordionItem value="behavior">
                          <AccordionTrigger className="text-base font-semibold">
                            <div className="flex items-center gap-3">
                               <Smile className="h-5 w-5 text-primary" /> Behavior
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                               <div className="flex items-center justify-between p-4 border rounded-lg">
                                  <div>
                                    <Label>Filler Words</Label>
                                    <p className="text-sm text-muted-foreground">Use filler words like 'umm' to sound more human.</p>
                                  </div>
                                  <Switch checked={cfg.behavior?.useFillerWords} onCheckedChange={v => onConfigChange('behavior', 'useFillerWords', v)} />
                              </div>
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
                                  <Label>Enable Call Transfer</Label>
                                  <Switch checked={cfg.callTransfer?.enabled} onCheckedChange={v => onConfigChange('callTransfer', 'enabled', v)} />
                              </div>
                              {cfg.callTransfer?.enabled && (
                                <div className="p-4 border rounded-lg space-y-4">
                                    <div className="space-y-2">
                                        <Label>Transfer Phone Number</Label>
                                        <Input value={cfg.callTransfer?.phoneNumber} onChange={e => onConfigChange('callTransfer', 'phoneNumber', e.target.value)} placeholder="+1 (555) 123-4567" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Transfer Condition</Label>
                                         <Textarea value={cfg.callTransfer?.condition} onChange={e => onConfigChange('callTransfer', 'condition', e.target.value)} placeholder="e.g., If user says 'speak to a human'" />
                                    </div>
                                </div>
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
                                  <Label>Enable Voicemail</Label>
                                  <Switch checked={cfg.callEnding?.enableVoicemail} onCheckedChange={v => onConfigChange('callEnding', 'enableVoicemail', v)} />
                              </div>
                              {cfg.callEnding?.enableVoicemail && (
                                 <div className="p-4 border rounded-lg space-y-2">
                                    <Label>Voicemail Message</Label>
                                    <Textarea value={cfg.callEnding?.voicemailMessage} onChange={e => onConfigChange('callEnding', 'voicemailMessage', e.target.value)} placeholder="Please leave a message after the beep." />
                                </div>
                              )}
                           </AccordionContent>
                      </AccordionItem>

                  </Accordion>
              </ScrollArea>
          </CardContent>
      </Card>
  )
}

    
    