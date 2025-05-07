'use client';

import Link from 'next/link';
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { BookOpen, PlusCircle, LayoutDashboard, UserCircle, Bell, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Navigation items with improved organization
  const navItems = [
    {
      name: "My Courses",
      href: "/courses",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
    },
    {
      name: "Create Course",
      href: "/courses/new",
      icon: <PlusCircle className="mr-2 h-4 w-4" />,
    }
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with improved styling */}
      <aside className="fixed inset-y-0 z-20 flex h-full w-64 flex-col border-r border-border bg-primary shadow-sm">
        {/* Logo area */}
        <div className="flex h-16 items-center border-b border-primary-foreground/10 px-6">
          <Link href="/courses" className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-black" />
            <span className="text-xl font-bold text-black">Course Creator</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  
                  className={cn(
                    "w-full justify-start text-black hover:bg-primary-foreground/10",
                    pathname === item.href ? "bg-secondary font-medium" : ""
                  )}
                >
                  {item.icon}
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User menu area */}
        <div className="mt-auto border-t border-primary-foreground/10 p-4">
          <div className="flex items-center justify-between rounded-md bg-primary-foreground/10 p-2 text-black">
            <div className="flex items-center gap-2">
              <UserCircle className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Ashwin S</span>
                <span className="text-xs opacity-75">ashwin_s@srmap.edu.in</span>
              </div>
            </div>
            <Button  size="icon" className="h-8 w-8 rounded-full text-black">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content with proper spacing and layout */}
      <main className="flex-1 pl-64 ">
        {/* Header bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border bg-white px-6 shadow-sm">
          <div className="ml-auto flex items-center gap-4">
            <Button  size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Button  size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        {/* Page content with consistent padding */}
        <div className="container py-8 p-10">
          {children}
        </div>
      </main>
    </div>
  );
}