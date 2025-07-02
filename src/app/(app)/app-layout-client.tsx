'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Bell,
  FileText,
  LayoutDashboard,
  Library,
  PanelLeft,
  PlusCircle,
  School,
  Search,
  Users,
  User as UserIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import type { Profile } from '@/lib/definitions';
import { ChatTutor } from '@/components/chat-tutor';

export function AppLayoutClient({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: Profile;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/essays', icon: FileText, label: 'My Essays' },
    { href: '/submit-essay', icon: PlusCircle, label: 'Submit Essay' },
    { href: '/resources', icon: Library, label: 'Resources' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/progress', icon: BarChart2, label: 'Progress' },
    { href: '/profile', icon: UserIcon, label: 'My Profile' },
  ];

  const teacherNavItems = [
    { href: '/teacher/resources', icon: School, label: 'Teacher Area' },
  ];

  const allNavItems = profile.role === 'teacher' ? [...navItems, ...teacherNavItems] : navItems;

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Logo />
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {allNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      pathname.startsWith(item.href) && !(item.href === '/dashboard' && pathname !== '/dashboard')
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Logo />
                  {allNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                        pathname.startsWith(item.href) && !(item.href === '/dashboard' && pathname !== '/dashboard')
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              {/* Search can be implemented later */}
            </div>
            <UserNav />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
      <ChatTutor />
    </>
  );
}
