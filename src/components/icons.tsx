
import type { SVGProps } from "react";
import { Bot, Globe, BarChart, CreditCard, Shield, Settings, FlaskConical, Github, Zap, Webhook, Database, Calendar, BookOpen, Mail, Sheet, FileText } from 'lucide-react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  ),
  google: (props: SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 48 48" 
      width="48px" 
      height="48px"
      {...props}
    >
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.356-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z"/>
      // 
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.626,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  ),
  bot: Bot,
  globe: Globe,
  barChart: BarChart,
  creditCard: CreditCard,
  shield: Shield,
  settings: Settings,
  flask: FlaskConical,
  github: Github,
  zap: Zap,
  webhook: Webhook,
  database: Database,
  book: BookOpen,
  gmail: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M22 5.5H2V8.5L12 15L22 8.5V5.5Z" fill="#EA4335"/>
        <path d="M2 18.5V8.5L12 15L22 8.5V18.5H2Z" fill="#C5221F"/>
        <path d="M22 5.5L12 12.5L2 5.5H22Z" fill="#4285F4"/>
        <path d="M2 5.5V18.5H6L12 12.5L2 5.5Z" fill="#34A853"/>
        <path d="M22 5.5V18.5H18L12 12.5L22 5.5Z" fill="#FBBC04"/>
    </svg>
  ),
  calendar: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 4H3C2.44772 4 2 4.44772 2 5V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V5C22 4.44772 21.5523 4 21 4Z" fill="#4285F4"/>
      <path d="M21 4H3C2.44772 4 2 4.44772 2 5V10H22V5C22 4.44772 21.5523 4 21 4Z" fill="#34A853"/>
      <path d="M7 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  googleDocs: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H14L21 9V21C21 21.5523 20.5523 22 20 22Z" fill="#4285F4"/>
      <path d="M21 9H14V2L21 9Z" fill="#8AB4F8"/>
      <path d="M17 14H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 18H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 10H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  googleSheets: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H14L21 9V21C21 21.5523 20.5523 22 20 22Z" fill="#34A853"/>
      <path d="M21 9H14V2L21 9Z" fill="#81C995"/>
      <path d="M7 13H17" stroke="white" strokeWidth="2"/>
      <path d="M7 17H17" stroke="white" strokeWidth="2"/>
      <path d="M12 11V19" stroke="white" strokeWidth="2"/>
    </svg>
  ),
};
