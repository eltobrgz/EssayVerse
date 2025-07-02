'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import {
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { submitTeacherFeedback } from '@/lib/actions';
import type { Essay, State } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Enviar Feedback
    </Button>
  );
}

export function TeacherFeedbackForm({ essay }: { essay: Essay }) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(submitTeacherFeedback, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === null && Object.keys(state.errors || {}).length === 0) {
      // successful submission, since redirect handles success
    } else if (state.message) {
      // handled by the Alert component
    } else {
        // Only show toast for validation errors
        if (Object.keys(state.errors || {}).length > 0) {
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'Por favor, corrija os erros no formulário.',
            });
        }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={dispatch}>
        <input type="hidden" name="essayId" value={essay.id} />
        <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="feedbackText">Seus Comentários</Label>
            <Textarea
                id="feedbackText"
                name="feedbackText"
                placeholder="Ex: Ótima estrutura! Faltou aprofundar o argumento no 2º parágrafo. Veja a imagem corrigida para detalhes de gramática."
                className="min-h-[150px]"
                defaultValue={essay.teacher_feedback_text || ''}
                required
            />
            {state.errors?.feedbackText && (
                <p className="text-sm font-medium text-destructive">
                {state.errors.feedbackText[0]}
                </p>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="correctedImage">Upload da Imagem Corrigida (Opcional)</Label>
            <Input id="correctedImage" name="correctedImage" type="file" accept="image/*" />
            <p className="text-sm text-muted-foreground">
                Envie a imagem da redação com suas anotações.
            </p>
             {state.errors?.correctedImage && (
                <p className="text-sm font-medium text-destructive">
                {state.errors.correctedImage[0]}
                </p>
            )}
        </div>

        {state.message && (
            <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ocorreu um Erro</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
        </CardContent>
        <CardFooter>
            <SubmitButton />
        </CardFooter>
    </form>
  );
}
