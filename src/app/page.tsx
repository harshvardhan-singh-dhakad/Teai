import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Github } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <Icons.logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">Teai</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-headline tracking-tight text-foreground">
              Build, Manage, and Deploy AI Voice Agents
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              Welcome to Teai, the ultimate platform for creating powerful and intelligent voice AI agents. Turn your ideas into reality with our intuitive builder and robust deployment tools.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg">Get Started for Free</Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  <Github className="mr-2" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </section>
        <section className="bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <h2 className="text-3xl font-bold font-headline text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-lg">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Icons.zap className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">Instant Agent Creation</h3>
                <p className="text-muted-foreground">Go from a simple text prompt to a fully functional AI agent in minutes with our GenAI-powered builder.</p>
              </div>
              <div className="p-6 rounded-lg">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Icons.settings className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">Powerful Integrations</h3>
                <p className="text-muted-foreground">Connect your agents to tools like Twilio, Google Calendar, and more to automate complex workflows.</p>
              </div>
              <div className="p-6 rounded-lg">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Icons.flask className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">Test and Deploy</h3>
                <p className="text-muted-foreground">Use our built-in simulator to test your agents' conversational flows before deploying them to your website or app.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Teai. All rights reserved.</p>
      </footer>
    </div>
  );
}
