import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { notFound } from 'next/navigation';
import { CheckCircle, Lightbulb, MessageSquareQuote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';

export default async function EssayPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: essay, error } = await supabase
    .from('essays')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id) // Security: Ensures user can only see their own essay
    .single();

  if (error || !essay) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{essay.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">{essay.type}</Badge>
              <span>Submitted on {format(new Date(essay.created_at), 'MMMM d, yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">
              {essay.content}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
            <CardDescription>Your AI-calculated score.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{essay.score}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
            <Progress value={essay.score} className="mt-2" />
            <p className="text-center text-sm font-medium mt-2">
              Estimated Grade: <span className="text-primary">{essay.estimated_grade}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {essay.feedback}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {essay.suggestions}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
