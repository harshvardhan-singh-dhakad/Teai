import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Settings</CardTitle>
        <CardDescription>Manage your account settings, security, and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Security</CardTitle>
                <CardDescription>Review and manage your security settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Change your password, set up two-factor authentication, and review your active sessions.</p>
            </CardContent>
            <CardFooter>
                 <Button variant="outline">Manage Security</Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Documentation</CardTitle>
                <CardDescription>Access our comprehensive documentation.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Find guides, API references, and tutorials to get the most out of Teai.</p>
            </CardContent>
            <CardFooter>
                 <Link href="#" passHref><Button variant="outline">Read Docs</Button></Link>
            </CardFooter>
        </Card>
      </CardContent>
    </Card>
  )
}
