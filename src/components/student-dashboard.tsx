
'use client'

import Link from 'next/link';
import { ArrowUpRight, PlusCircle, Flame, FileText, Star, Trophy } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Essay, Profile } from '@/lib/definitions';

interface StudentDashboardProps {
  profile: Profile;
  essays: Essay[];
  stats: {
    total_essays: number;
    average_score: number;
  } | null;
}

export function StudentDashboard({ profile, essays, stats }: StudentDashboardProps) {
  const userName = profile?.full_name?.split(' ')[0] || 'Escritor(a)';
  const xpForNextLevel = 100;
  const xpProgress = profile ? (profile.points % xpForNextLevel) : 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Bem-vindo(a) de volta, {userName}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Redações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_essays || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_score?.toFixed(1) || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nível {profile?.level || 1}</div>
            <Progress value={xpProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{profile?.points % xpForNextLevel} / {xpForNextLevel} XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sequência de Login</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.current_streak || 0} dias</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-7">
          <CardHeader>
            <CardTitle>Redações Recentes</CardTitle>
            <div className="flex items-center justify-between">
              <CardDescription>
                Confira suas últimas redações corrigidas.
              </CardDescription>
              <Button size="sm" asChild>
                <Link href="/submit-essay"><PlusCircle className="mr-2 h-4 w-4" />Enviar Nova Redação</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {essays && essays.length > 0 ? (
                  essays.map((essay) => (
                    <TableRow key={essay.id}>
                      <TableCell>
                        <Link href={`/essay/${essay.id}`} className="font-medium hover:underline">
                          {essay.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{essay.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{essay.score}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">Nenhuma redação enviada ainda.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
             <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
                <Link href="/essays">Ver Todas <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
