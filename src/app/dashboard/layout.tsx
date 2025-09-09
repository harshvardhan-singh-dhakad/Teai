import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav } from "@/components/dashboard-nav";

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardNav />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 h-screen">
        <DashboardHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
