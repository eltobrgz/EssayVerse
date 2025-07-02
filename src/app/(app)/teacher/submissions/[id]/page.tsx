import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getEssayForTeacher, submitTeacherFeedback } from '@/lib/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Download, GraduationCap, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { TeacherFeedbackForm } from './teacher-feedback-form';

export default async function SubmissionReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const essay = await getEssayForTeacher(params.id, user.id);

  if (!essay) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Coluna Esquerda: Informações da Redação */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{essay.title}</CardTitle>
            <CardDescription>
              Enviado por: <strong>{essay.profiles?.full_name || 'Aluno Anônimo'}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-2">Texto da Redação</h4>
            <p className="whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground mb-6">
              {essay.content}
            </p>
            {essay.image_url && (
              <div>
                <h4 className="font-semibold mb-2">Imagem Original Enviada</h4>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={essay.image_url}
                    alt={`Imagem original para: ${essay.title}`}
                    fill
                    className="object-contain"
                    data-ai-hint="original essay"
                  />
                </div>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href={essay.image_url} target="_blank" download>
                    <Download className="mr-2" /> Baixar Original
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
         {essay.reviewed_by_teacher_at && essay.teacher_feedback_text && (
            <Alert variant="default" className="border-green-500">
                <CheckCircle2 className="h-4 w-4 !text-green-500" />
                <AlertTitle className="text-green-600">Feedback Enviado</AlertTitle>
                <AlertDescription>
                    Você já enviou um feedback para esta redação. Você pode reenviar o formulário para atualizá-lo.
                </AlertDescription>
            </Alert>
        )}

      </div>

      {/* Coluna Direita: Formulário de Feedback do Professor */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Seu Feedback
            </CardTitle>
            <CardDescription>
              Faça a correção da imagem, escreva seus comentários e envie a imagem corrigida para o aluno.
            </CardDescription>
          </CardHeader>
          <TeacherFeedbackForm essay={essay} />
        </Card>
      </div>
    </div>
  );
}
