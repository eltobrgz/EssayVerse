
'use client'

import Link from 'next/link';
import { ArrowUpRight, ClipboardCheck, Users, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Profile } from '@/lib/definitions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeacherDashboardProps {
  profile: Profile;
  stats: {
    studentCount: number | null;
    pendingSubmissionsCount: number | null;
    recentSubmissions: {
        id: string;
        title: string;
        created_at: string;
        profiles: {
            full_name: string;
        } | null;
    }[] | null;
  } | null;
}

export function TeacherDashboard({ profile, stats }: TeacherDashboardProps) {
  const userName = profile?.full_name?.split(' ')[0] || 'Professor(a)';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Bem-vindo(a), {userName}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alunos Conectados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.studentCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Correções Pendentes</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingSubmissionsCount || 0}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recursos Criados</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* This would require another query, so we can add it later */}
            <div className="text-2xl font-bold">N/A</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Envios Recentes para Correção</CardTitle>
            <CardDescription>
                As últimas redações com imagem enviadas por seus alunos.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Enviado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                  stats.recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.profiles?.full_name || 'Anônimo'}
                      </TableCell>
                      <TableCell>
                        <Link href={`/teacher/submissions/${submission.id}`} className="font-medium hover:underline">
                          {submission.title}
                        </Link>
                      </TableCell>
                       <TableCell>
                        {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true, locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">Nenhuma redação para corrigir.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
             <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
                <Link href="/teacher/submissions">Ver Todas as Avaliações <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
