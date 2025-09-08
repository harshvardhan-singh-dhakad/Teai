import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Phone, Send } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

export default function TestingPage() {
  const usage = 85 // Example usage percentage

  return (
    <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Calling Simulator</CardTitle>
                <CardDescription>Test your AI agents in a simulated call environment.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="flex-1 border rounded-lg p-4 bg-secondary/30 space-y-4 overflow-y-auto">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-primary-foreground font-bold text-sm">AI</div>
                        <div className="bg-background rounded-lg p-3 text-sm max-w-[80%]">
                            <p>Hello! This is the sales department. How can I help you today?</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 flex-row-reverse">
                         <div className="bg-muted-foreground rounded-full h-8 w-8 flex items-center justify-center text-primary-foreground font-bold text-sm">You</div>
                        <div className="bg-primary/80 text-primary-foreground rounded-lg p-3 text-sm max-w-[80%]">
                           <p>Hi, I was interested in learning more about your enterprise software solution.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-primary-foreground font-bold text-sm">AI</div>
                        <div className="bg-background rounded-lg p-3 text-sm max-w-[80%]">
                            <p>Excellent! I can certainly help with that. Are you looking for a solution for a specific industry?</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Input placeholder="Type your response..." />
                    <Button size="icon" aria-label="Send message">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
                <Button>
                <Phone className="mr-2 h-4 w-4" />
                Start Call
                </Button>
            </CardFooter>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Usage Limit</CardTitle>
                    <CardDescription>Your monthly testing minutes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="usage-progress" className="text-sm">{usage}% Used</Label>
                        <Progress id="usage-progress" value={usage} aria-label={`${usage}% of testing minutes used`} />
                        <p className="text-xs text-muted-foreground">425 / 500 minutes used.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">Upgrade Plan</Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Select Agent</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Choose an agent to test.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
