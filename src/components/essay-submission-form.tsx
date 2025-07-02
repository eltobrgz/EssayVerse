'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { submitAndScoreEssay } from '@/lib/actions';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Enviar para Correção
    </Button>
  );
}

export function EssaySubmissionForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(submitAndScoreEssay, initialState);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Envie Sua Redação</CardTitle>
          <CardDescription>Receba feedback instantâneo com IA sobre sua escrita.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Redação</Label>
            <Input 
              id="title"
              name="title"
              placeholder="Ex: O Papel da Tecnologia na Educação"
              required
            />
            {state.errors?.title &&
              state.errors.title.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>{error}</p>
              ))
            }
          </div>
          <div className="space-y-2">
            <Label htmlFor="essayType">Tipo de Redação</Label>
            <Select name="essayType" required>
              <SelectTrigger id="essayType">
                <SelectValue placeholder="Selecione o tipo de redação..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENEM">ENEM</SelectItem>
                <SelectItem value="Fuvest">Fuvest</SelectItem>
                <SelectItem value="Custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
             {state.errors?.essayType &&
              state.errors.essayType.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>{error}</p>
              ))
            }
          </div>
          <div className="space-y-2">
            <Label htmlFor="essayText">Texto da Redação</Label>
            <Textarea
              id="essayText"
              name="essayText"
              placeholder="Cole sua redação aqui..."
              className="min-h-[300px]"
              required
            />
             {state.errors?.essayText &&
              state.errors.essayText.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>{error}</p>
              ))
            }
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Enviar Imagem (Opcional)</Label>
            <Input id="image" name="image" type="file" />
            <p className="text-sm text-muted-foreground">
              Você pode enviar uma imagem relacionada à sua redação, como uma proposta ou um gráfico.
            </p>
          </div>
          {state.message && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Erro</AlertTitle>
               <AlertDescription>{state.message}</AlertDescription>
             </Alert>
           )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
