"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { db, auth } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"
import { Shield, BookOpen, Key } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        loadSettings(currentUser.uid)
      }
    })
    return () => unsubscribe()
  }, [])

  const loadSettings = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid, 'settings', 'elevenlabs');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setApiKey(docSnap.data().apiKey || "")
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'elevenlabs'), {
        apiKey: apiKey,
        updatedAt: new Date().toISOString()
      })
      toast({ title: "Settings Saved", description: "Your ElevenLabs API key has been updated." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Settings</CardTitle>
          <CardDescription>Manage your account settings, security, and external API integrations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                ElevenLabs Integration
              </CardTitle>
              <CardDescription>Enter your personal ElevenLabs API key to use your own credits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  placeholder="Enter your ElevenLabs API Key" 
                />
                <p className="text-xs text-muted-foreground">If left empty, the platform's default key will be used.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save API Key"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
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
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Documentation
              </CardTitle>
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
    </div>
  )
}
