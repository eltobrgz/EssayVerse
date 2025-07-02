
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ElementType } from 'react';
import {
  BarChart2,
  BarChart3,
  Bell,
  FileText,
  Home,
  LayoutDashboard,
  Library,
  PanelLeft,
  PlusCircle,
  PlusSquare,
  School,
  Search,
  Users,
  User as UserIcon,
  ClipboardCheck,
  UserPlus,
  UserCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import type { Profile } from '@/lib/definitions';
import { ChatTutor } from '@/components/chat-tutor';
import type { User } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/theme-toggle';

export function AppLayoutClient({
  children,
  user,
  profile,
}: {
  children: React.ReactNode;
  user: User | null;
  profile: Profile;
}) {
  const pathname = usePathname();

  let navItems: { href: string; icon: ElementType; label: string }[] = [];
  let mobileNavItems: { href: string; icon: ElementType; label: string }[] = [];

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  if (profile.role === 'student') {
    navItems = [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
      { href: '/essays', icon: FileText, label: 'Minhas Redações' },
      { href: '/submit-essay', icon: PlusCircle, label: 'Enviar Redação' },
      { href: '/progress', icon: BarChart2, label: 'Meu Progresso' },
      { href: '/my-teachers', icon: UserPlus, label: 'Meus Professores' },
      { href: '/resources', icon: Library, label: 'Recursos' },
      { href: '/community', icon: Users, label: 'Comunidade' },
      { href: '/profile', icon: UserIcon, label: 'Meu Perfil' },
    ];
    mobileNavItems = [
      { href: '/dashboard', icon: Home, label: 'Início' },
      { href: '/submit-essay', icon: PlusSquare, label: 'Enviar' },
      { href: '/progress', icon: BarChart3, label: 'Progresso' },
      { href: '/profile', icon: UserCircle, label: 'Perfil' },
    ];
  } else if (profile.role === 'teacher') {
    navItems = [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
      { href: '/teacher/my-students', icon: Users, label: 'Meus Alunos' },
      { href: '/teacher/submissions', icon: ClipboardCheck, label: 'Avaliações' },
      { href: '/teacher/resources', icon: School, label: 'Meus Recursos' },
      { href: '/resources', icon: Library, label: 'Recursos' },
      { href: '/community', icon: Users, label: 'Comunidade' },
      { href: '/profile', icon: UserIcon, label: 'Meu Perfil' },
    ];
    mobileNavItems = [
      { href: '/dashboard', icon: Home, label: 'Início' },
      { href: '/teacher/submissions', icon: ClipboardCheck, label: 'Avaliações' },
      { href: '/teacher/resources', icon: School, label: 'Recursos' },
      { href: '/profile', icon: UserCircle, label: 'Perfil' },
    ];
  }

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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
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
                  <span className="sr-only">Alternar menu de navegação</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Logo />
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary'
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
            <ThemeToggle />
            <UserNav user={user} profile={profile} />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/50 pb-20 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
        <div className="grid h-16 max-w-lg grid-cols-4 mx-auto font-medium">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-2 py-1 group ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <ChatTutor />
    </>
  );
}
