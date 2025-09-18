import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google'
import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: 'Teai: AI Voice Agent Platform',
  description: 'Create, manage, and deploy AI voice agents.',
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeadline = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontHeadline.variable
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
