import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Code } from "lucide-react"

export default function DeploymentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Deployment</CardTitle>
        <CardDescription>Configure an embeddable widget for your websites.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <Code className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold font-headline">Coming Soon</h3>
          <p className="text-muted-foreground mt-2">
            Our embeddable widget feature is currently in development.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
