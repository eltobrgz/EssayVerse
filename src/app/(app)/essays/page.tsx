import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EssaysPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: essays, error } = await supabase
    .from('essays')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching essays:', error);
    // Optionally render an error state for the user
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Essays</CardTitle>
          <CardDescription>
            A record of all your submitted work.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/submit-essay">
            <PlusCircle className="mr-2 h-4 w-4" /> Submit New Essay
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {essays && essays.length > 0 ? (
              essays.map(essay => (
                <TableRow key={essay.id}>
                  <TableCell>
                    <Link
                      href={`/essay/${essay.id}`}
                      className="font-medium hover:underline"
                    >
                      {essay.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{essay.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(essay.created_at), 'MMMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {essay.score}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No essays submitted yet. Start by submitting one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
