
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard/agent-builder", icon: Icons.bot, label: "Agent Builder" },
  { href: "/dashboard/call-assistant", icon: Icons.phone, label: "AI Call Assistant" },
  { href: "/dashboard/integrations", icon: Icons.webhook, label: "Integrations" },
  { href: "/dashboard/deployment", icon: Icons.globe, label: "Deployment" },
  { href: "/dashboard/analytics", icon: Icons.barChart, label: "Analytics" },
  { href: "/dashboard/billing", icon: Icons.creditCard, label: "Billing" },
  { href: "/dashboard/admin", icon: Icons.shield, label: "Admin" },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Teai</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith("/dashboard/settings") && "bg-accent text-accent-foreground"
                )}
              >
                <Icons.settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
