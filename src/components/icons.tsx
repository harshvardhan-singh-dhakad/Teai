
import type { SVGProps } from "react";
import { Bot, Globe, BarChart, CreditCard, Shield, Settings, FlaskConical, Github, Zap, Webhook, Database, Calendar, BookOpen } from 'lucide-react';

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
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-4.82 2.25-3.44 0-6.5-2.85-6.5-6.5s2.86-6.5 6.5-6.5c1.95 0 3.35.75 4.3 1.65l2.75-2.75C19.43 1.82 16.47 0 12.48 0 5.88 0 0 5.88 0 12.5s5.88 12.5 12.48 12.5c7.25 0 12.13-4.88 12.13-12.25 0-.8-.13-1.48-.32-2.13H12.48z" fill="currentColor"/>
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
  calendar: Calendar,
  book: BookOpen,
};

    