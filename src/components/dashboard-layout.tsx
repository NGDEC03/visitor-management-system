"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { redirect, usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  CalendarClock,
  CheckSquare,
  ClipboardCheck,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Settings,
  UserPlus,
  Users,
  UserSearch,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { UserRole } from "@/generated/prisma"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import UnauthenticatedPage from "./un-authenticated"
import UnAuthorized from "./unAuthorized"
import { useToast } from "@/hooks/use-toast"

const adminNavigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Visitor Registration",
    href: "/admin/visitor-registration",
    icon: UserPlus,
  },
  {
    title: "Visitor Details",
    href: "/admin/visitor-details",
    icon: UserSearch,
  },
  {
    title: "Approval Workflow",
    href: "/admin/approval-workflow",
    icon: ClipboardCheck,
  },
]

const employeeNavigationItems = [
  {
    title: "Dashboard",
    href: "/employee",
    icon: BarChart3,
  },
  {
    title: "Pre-Approval",
    href: "/employee/pre-approval",
    icon: CalendarClock,
  },
  {
    title: "Approval Workflow",
    href: "/employee/approval-workflow",
    icon: ClipboardCheck
  }
]

const securityNavigationItems = [
  {
    title: "Dashboard",
    href: "/security",
    icon: BarChart3,
  },
  {
    title: "Visitor Registration",
    href: "/security/visitor-registration",
    icon: UserPlus,
  },
  {
    title: "Visitor Details",
    href: "/security/visitor-details",
    icon: UserSearch,
  },
  {
    title: "Check-In/Out",
    href: "/security/check-in-out",
    icon: CheckSquare,
  },
]

export function DashboardLayout({ children, role }: { children: React.ReactNode, role: UserRole }) {
  const router = useRouter()
  const { toast } = useToast()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activeItem, setActiveItem] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      toast({
        title: "Unauthorized",
        description: "You are not authorized to access this page",
      })
     setTimeout(() => {
      router.push("/auth/signin")
     }, 150)
    }
  }, [status, router])

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [pathname])

  if (status === "loading") {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }
  const combinedNavigationItems=[...adminNavigationItems,...employeeNavigationItems,...securityNavigationItems]
  const containsPath = combinedNavigationItems.some(item => item.href===pathname)

console.log(containsPath);

  if (!role || role.toLocaleLowerCase() !== session?.user?.role?.toLocaleLowerCase() || !containsPath) {
    return <UnAuthorized />
  }

  const getNavigationItems = () => {
    switch (role) {
      case 'admin':
        return adminNavigationItems
      case 'employee':
        return employeeNavigationItems
      case 'security':
        return securityNavigationItems
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
    {/* Mobile Navigation */}
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Main navigation menu for the dashboard</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="px-4 py-2 flex items-center border-b">
            <Users className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold">VMS</h2>
          </div>
          <div className="px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <SidebarProvider>
      <Sidebar className="hidden md:flex">
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 px-2 py-4">
            <Users className="h-6 w-6" />
            <span className="font-semibold text-lg">VMS</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                  <Link href={item.href} onClick={() => setActiveItem(item.href)}>
                    <item.icon />
                    <span>{item.title}</span>
                    {activeItem === item.href && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 ">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 w-full">
          <SidebarTrigger className="hidden md:flex" />
          <div className="ml-auto flex items-center gap-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (session?.user) {
                  signOut({redirect:false});
                }
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4">
  <div className="mx-auto w-full max-w-7xl">

    {children}
  </div>
</main>
      </div>
    </SidebarProvider>
  </div>
 )
}
