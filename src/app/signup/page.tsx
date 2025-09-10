
"use client";

import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { Icons } from "@/components/icons"
import { signInWithGoogle, signInWithGitHub } from "@/lib/auth"; // Assuming you will create these
import { useToast } from "@/hooks/use-toast";

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // This is a placeholder for a full email/password signup flow
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Feature not implemented",
        description: "Email/Password signup is coming soon. Please use Google or GitHub.",
        variant: "destructive"
    });
  }

  const handleOAuthSignIn = async (provider: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await provider();
      toast({ title: "Sign Up Successful", description: "Redirecting to your dashboard..." });
      router.push("/dashboard");
    } catch (error: any) {
       let errorMessage = "An unexpected error occurred.";
       if (error.code === 'auth/popup-closed-by-user') {
         errorMessage = 'Sign up process was cancelled.';
       } else if (error.message) {
         errorMessage = error.message;
       }
       toast({ title: "Sign Up Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" placeholder="Teai User" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                 disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              Create an account
            </Button>
            </form>
             <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleOAuthSignIn(signInWithGitHub)}>
                    <Icons.github className="mr-2 h-4 w-4" />
                    GitHub
                </Button>
                <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleOAuthSignIn(signInWithGoogle)}>
                    <Icons.google className="mr-2 h-4 w-4" />
                    Google
                </Button>
            </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
