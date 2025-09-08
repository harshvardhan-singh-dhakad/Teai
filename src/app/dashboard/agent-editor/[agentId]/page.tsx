
"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, Copy, ExternalLink, HardDriveUpload, Settings, Share, Webhook, PlusCircle, MessageSquare, Mic, GitBranch, FlaskConical } from "lucide-react"

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
import type { Agent, ConversationStep } from "@/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { AssistantChatbot } from "@/components/assistant-chatbot"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

const languages = [
    { value: "en-US", label: "English (US)" },
    { value: "hi-IN", label: "Hindi" },
    { value: "es-ES", label: "Spanish" },
]

const llmModels = [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gpt-4", label: "GPT-4" },
]

const sttModels = [
    { value: "google-standard", label: "Google Standard" },
    { value: "whisper-1", label: "Whisper" },
]

const ttsModels = {
    "google": [
        { value: "google-hi-1", label: "Hindi Female 1" },
        { value: "google-en-1", label: "English Male 1" },
    ],
    "eleven-labs": [
        { value: "eleven-adam", label: "Adam (English)" },
        { value: "eleven-rachel", label: "Rachel (English)" },
    ]
}


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
  
  const updateAgentConfiguration = (key: keyof NonNullable<Agent['configurations']>, value: string) => {
    if (!agent) return;
    updateAgent({
      configurations: {
        ...agent.configurations,
        [key]: value,
      },
    });
  };

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
  
  const handleTest = () => {
    if (!agent) return;
    router.push(`/dashboard/testing?agentId=${agent.id}`)
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

  const renderNode = (step: ConversationStep, index: number) => {
    switch (step.type) {
        case 'aiMessage':
            return (
                <Card key={index} className="w-80 mx-auto shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <div className="text-left">
                                <p className="font-medium">{step.title}</p>
                                <p className="text-sm text-muted-foreground">"{step.content}"</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        case 'userListen':
            return (
                <Card key={index} className="w-80 mx-auto shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Mic className="h-5 w-5 text-primary" />
                            <div className="text-left">
                                <p className="font-medium">{step.title}</p>
                                <p className="text-sm text-muted-foreground">{step.content}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        case 'condition':
            return (
                <Card key={index} className="w-96 mx-auto shadow-lg bg-card">
                    <CardHeader className="p-4 border-b">
                        <div className="flex items-center gap-3">
                            <GitBranch className="h-5 w-5 text-primary" />
                            <p className="font-medium">{step.title}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex">
                            {step.branches?.map((branch, i) => (
                                <div key={i} className={`flex-1 p-4 ${i === 0 ? 'border-r' : ''}`}>
                                    <p className={`text-xs font-semibold mb-2 ${branch.condition === 'If True' ? 'text-green-400' : 'text-red-400'}`}>{branch.condition.toUpperCase()}</p>
                                    <Card className="w-full">
                                        <CardContent className="p-3 text-left">
                                            <p className="font-medium text-sm">{branch.action}</p>
                                            <p className="text-xs text-muted-foreground">"{branch.content}"</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            );
        default:
            return null;
    }
  };


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
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleTest}>
              <FlaskConical className="h-4 w-4 mr-2" />
              Test Agent
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
                    <Label>Conversation Flow</Label>
                     <div className="p-4 border-2 border-dashed rounded-lg min-h-[500px] flex flex-col items-center justify-start text-center bg-secondary/30 relative overflow-auto">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col space-y-4 w-[90%]">
                            
                            {Array.isArray(agent.conversationFlow) && agent.conversationFlow.map((step, index) => (
                                <>
                                    {renderNode(step, index)}
                                    {index < agent.conversationFlow.length - 1 && (
                                        <div className="h-10 w-px bg-border"/>
                                    )}
                                </>
                            ))}
                           
                           <Button variant="outline" size="sm" className="shadow-md mt-4">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Step
                           </Button>
                        </div>
                    </div>
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
                <CardHeader>
                  <CardTitle>Configurations</CardTitle>
                  <CardDescription>
                    Customize the AI models, voice, and language for your agent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Voice &amp; Language</CardTitle>
                      <CardDescription>Select the language and voice for your agent.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={agent.configurations?.language} onValueChange={(value) => updateAgentConfiguration('language', value)}>
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map(lang => (
                              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                       <div className="grid gap-2">
                        <Label htmlFor="tts-model">Text-to-Speech (TTS) Voice</Label>
                        <Select value={agent.configurations?.ttsModel} onValueChange={(value) => updateAgentConfiguration('ttsModel', value)}>
                          <SelectTrigger id="tts-model">
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Google</SelectLabel>
                              {ttsModels.google.map(model => (
                                <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Eleven Labs</SelectLabel>
                              {ttsModels['eleven-labs'].map(model => (
                                <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">AI Models</CardTitle>
                      <CardDescription>Choose the models for language understanding and transcription.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="llm-model">Language Model (LLM)</Label>
                        <Select value={agent.configurations?.llmModel} onValueChange={(value) => updateAgentConfiguration('llmModel', value)}>
                          <SelectTrigger id="llm-model">
                            <SelectValue placeholder="Select an LLM" />
                          </SelectTrigger>
                          <SelectContent>
                            {llmModels.map(model => (
                              <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stt-model">Speech-to-Text (STT)</Label>
                        <Select value={agent.configurations?.sttModel} onValueChange={(value) => updateAgentConfiguration('sttModel', value)}>
                          <SelectTrigger id="stt-model">
                            <SelectValue placeholder="Select an STT model" />
                          </SelectTrigger>
                          <SelectContent>
                            {sttModels.map(model => (
                              <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="post-call">
              <Card>
                <CardHeader>
                  <CardTitle>Post-Call Actions</CardTitle>
                  <CardDescription>
                    Configure what happens after a call ends.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="webhook-url" className="flex items-center gap-2">
                      <Webhook className="h-4 w-4" />
                      Webhook URL
                    </Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-service.com/webhook"
                      value={agent.postCall?.webhookUrl}
                      onChange={e => updateAgent({ postCall: { ...agent.postCall, webhookUrl: e.target.value } })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
       <div className="hidden lg:block">
        <AssistantChatbot />
      </div>
    </div>
  )
}
