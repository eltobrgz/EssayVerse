import Link from 'next/link';
import { ArrowUpRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { mockUser, mockEssays, mockCommunityPosts } from '@/lib/data';
import { OverallProgressChart } from '@/components/progress-charts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Dashboard() {
  const user = mockUser;
  const recentEssays = mockEssays.slice(0, 2);
  const recentPosts = mockCommunityPosts.slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">Welcome back, {user.name.split(' ')[0]}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button size="sm" className="w-full" asChild>
              <Link href="/submit-essay">Submit New Essay</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Essays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEssays.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 submitted this month
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.5</div>
             <p className="text-xs text-muted-foreground">
              +3.2 points from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Community Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#12</div>
            <p className="text-xs text-muted-foreground">
              Top 10% of users
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Essays</CardTitle>
            <CardDescription>
              Check out your latest scored essays.
            </CardDescription>
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
                {recentEssays.map((essay) => (
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
             <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
                <Link href="/essays">View All <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
             <CardDescription>Your average score improvement over the last months.</CardDescription>
          </CardHeader>
          <CardContent>
            <OverallProgressChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
