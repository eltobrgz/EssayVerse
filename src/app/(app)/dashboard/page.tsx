import Link from 'next/link';
import { ArrowUpRight, PlusCircle, Flame } from 'lucide-react';
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
import { createClient } from '@/lib/supabase/server';
import { updateUserStreak } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function Dashboard() {
  await updateUserStreak();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: essays } = await supabase
    .from('essays')
    .select('id, title, type, score')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: stats } = await supabase
    .rpc('get_user_stats', { p_user_id: user.id })
    .single();

  const userName = profile?.full_name?.split(' ')[0] || 'Writer';
  const xpForNextLevel = 100;
  const xpProgress = profile ? (profile.points % xpForNextLevel) : 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Welcome back, {userName}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Essays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_essays || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_score?.toFixed(1) || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {profile?.level || 1}</div>
            <Progress value={xpProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{profile?.points % xpForNextLevel} / {xpForNextLevel} XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.current_streak || 0} days</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-7">
          <CardHeader>
            <CardTitle>Recent Essays</CardTitle>
            <div className="flex items-center justify-between">
              <CardDescription>
                Check out your latest scored essays.
              </CardDescription>
              <Button size="sm" asChild>
                <Link href="/submit-essay"><PlusCircle className="mr-2 h-4 w-4" />Submit New Essay</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Score</TableHead>
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
                    <TableCell colSpan={3} className="h-24 text-center">No essays submitted yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
             <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
                <Link href="/essays">View All <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
