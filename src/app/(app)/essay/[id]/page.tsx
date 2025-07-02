import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { notFound } from 'next/navigation';
import { CheckCircle, Lightbulb, MessageSquareQuote, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/audio-player';

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
      <div className="md:col-span-2 flex flex-col gap-6">
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
             {essay.image_url && (
              <div className="mt-4">
                  <h4 className="font-semibold mb-2">Imagem Anexada</h4>
                  <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-lg border">
                  <Image
                      src={essay.image_url}
                      alt={`Imagem para a redação: ${essay.title}`}
                      fill
                      className="object-contain"
                      data-ai-hint="attached image"
                  />
                  </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {essay.teacher_feedback_text && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Feedback do Professor
                    </CardTitle>
                    <CardDescription>
                        Avaliação manual feita em {format(new Date(essay.reviewed_by_teacher_at!), 'MMMM d, yyyy')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground mb-4">
                        {essay.teacher_feedback_text}
                    </p>
                    {essay.corrected_image_url && (
                        <div>
                            <h4 className="font-semibold mb-2">Imagem Corrigida</h4>
                            <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-lg border">
                                <Image
                                    src={essay.corrected_image_url}
                                    alt={`Imagem corrigida para: ${essay.title}`}
                                    fill
                                    className="object-contain"
                                    data-ai-hint="corrected image"
                                />
                            </div>
                             <Button asChild variant="outline" size="sm" className="mt-2">
                                <Link href={essay.corrected_image_url} target="_blank">Ver em tamanho real</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

      </div>

      <div className="md:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pontuação (IA)</CardTitle>
            <CardDescription>Sua nota calculada por IA.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{essay.score}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
            <Progress value={essay.score} className="mt-2" />
            <p className="text-center text-sm font-medium mt-2">
              Nota Estimada (IA): <span className="text-primary">{essay.estimated_grade}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <div className='flex items-center gap-2'>
                <MessageSquareQuote className="h-5 w-5 text-primary" />
                Feedback (IA)
              </div>
              <AudioPlayer textToSpeak={essay.feedback} />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {essay.feedback}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Sugestões (IA)
              </div>
              <AudioPlayer textToSpeak={essay.suggestions} />
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
