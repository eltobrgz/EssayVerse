import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { mockEssays } from '@/lib/data';
import { notFound } from 'next/navigation';
import { CheckCircle, Lightbulb, MessageSquareQuote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


export default function EssayPage({ params }: { params: { id: string } }) {
  const essay = mockEssays.find((e) => e.id === params.id);

  if (!essay) {
    // In a real app, this would be a redirect to a 404 page if data is fetched from a DB
    // For now, let's use the first mock essay if ID is not found.
    const firstEssay = mockEssays[0];
     if (!firstEssay) notFound();
     return <div>Essay not found</div>
  }
  
  const targetEssay = essay || mockEssays[0];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{targetEssay.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
               <Badge variant="secondary">{targetEssay.type}</Badge>
               <span>Submitted on {format(new Date(targetEssay.submittedAt), 'MMMM d, yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">
              {targetEssay.content}
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
              <span className="text-4xl font-bold">{targetEssay.score}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
            <Progress value={targetEssay.score} className="mt-2" />
            <p className="text-center text-sm font-medium mt-2">Estimated Grade: <span className="text-primary">{targetEssay.estimatedGrade}</span></p>
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
            {targetEssay.feedback}
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
            {targetEssay.suggestions}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
