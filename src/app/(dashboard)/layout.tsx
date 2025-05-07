'use client';

import Link from 'next/link';
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { BookOpen, PlusCircle, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Navigation items
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
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 z-20 flex h-full w-64 flex-col border-r bg-primary">
        <div className="p-6">
          <div className="flex items-center gap-2 text-white mb-8">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-bold">Course Creator</h1>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-secondary/80",
                    pathname === item.href ? "bg-secondary" : ""
                  )}
                >
                  {item.icon}
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64 w-full">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  );
}