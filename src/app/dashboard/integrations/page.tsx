
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Phone, Calendar, Slack, Zap, Briefcase } from "lucide-react"

type Integration = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  connected: boolean
  credentials?: { id: string; label: string }[]
}

const initialIntegrations: Record<string, Integration> = {
  twilio: { id: "twilio", name: "Twilio", description: "Connect for programmable voice and SMS.", icon: Phone, connected: false, credentials: [{ id: 'accountSid', label: 'Account SID' }, { id: 'authToken', label: 'Auth Token' }] },
  vonage: { id: "vonage", name: "Vonage", description: "APIs for voice, messaging, and video.", icon: Phone, connected: false, credentials: [{ id: 'apiKey', label: 'API Key' }, { id: 'apiSecret', label: 'API Secret' }] },
  exotel: { id: "exotel", name: "Exotel", description: "Cloud telephony for businesses in India.", icon: Phone, connected: false, credentials: [{ id: 'accountSid', label: 'Account SID' }, { id: 'apiToken', label: 'API Token' }] },
  googleCalendar: { id: "googleCalendar", name: "Google Calendar", description: "Automate scheduling and manage events.", icon: Calendar, connected: false, credentials: [{id: 'apiKey', label: 'API Key'}] },
  slack: { id: "slack", name: "Slack", description: "Send notifications and data to channels.", icon: Slack, connected: false, credentials: [{id: 'webhookUrl', label: 'Webhook URL'}] },
  zapier: { id: "zapier", name: "Zapier", description: "Connect your agent to thousands of apps.", icon: Zap, connected: true, credentials: [] },
}

export default function IntegrationsPage() {
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState(initialIntegrations)

  const handleConnect = (id: string, newCredentials?: Record<string, string>) => {
    setIntegrations(prev => ({
      ...prev,
      [id]: { ...prev[id], connected: true },
    }))
    toast({
      title: `Successfully connected to ${integrations[id].name}!`,
    })
  }

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => ({
      ...prev,
      [id]: { ...prev[id], connected: false },
    }))
    toast({
      title: `Disconnected from ${integrations[id].name}.`,
      variant: "destructive",
    })
  }
  
  const callingProviders = ['twilio', 'vonage', 'exotel'];
  const otherIntegrations = Object.values(integrations).filter(int => !callingProviders.includes(int.id));


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Integrations</CardTitle>
          <CardDescription>
            Connect your agents to external tools and services.
          </CardDescription>
        </CardHeader>
      </Card>
      
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
                    {callingProviders.map(id => {
                        const integration = integrations[id];
                        return (
                             <div key={integration.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <integration.icon className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-semibold">{integration.name}</h3>
                                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                                    </div>
                                </div>
                                <IntegrationButton integration={integration} onConnect={handleConnect} onDisconnect={handleDisconnect} />
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherIntegrations.map(integration => (
                <Card key={integration.id}>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <integration.icon className="h-8 w-8 text-primary" />
                            <CardTitle>{integration.name}</CardTitle>
                        </div>
                        <CardDescription>{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <IntegrationButton integration={integration} onConnect={handleConnect} onDisconnect={handleDisconnect} />
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  )
}


function IntegrationButton({ integration, onConnect, onDisconnect }: { integration: Integration; onConnect: (id: string, creds?: any) => void; onDisconnect: (id: string) => void; }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creds, setCreds] = useState<Record<string, string>>({});
  
  const handleSave = () => {
    onConnect(integration.id, creds);
    setDialogOpen(false);
  }

  if (integration.connected) {
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
