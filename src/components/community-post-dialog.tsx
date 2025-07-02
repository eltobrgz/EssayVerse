
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCommunityPost } from '@/lib/actions';
import { AlertCircle, Loader2, PlusCircle } from 'lucide-react';
import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Criar Post
    </Button>
  );
}

export function CommunityPostDialog() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createCommunityPost, initialState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'Post criado com sucesso.') {
      setOpen(false);
      formRef.current?.reset();
      toast({
        title: 'Post Criado!',
        description: 'Seu post já está disponível no fórum da comunidade.',
      });
    }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Criar um novo post</DialogTitle>
          <DialogDescription>
            Compartilhe suas ideias, faça uma pergunta ou publique uma redação modelo.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Como escrever uma ótima conclusão?"
              required
            />
            {state.errors?.title &&
              state.errors.title.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo (Opcional)</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Compartilhe mais detalhes aqui..."
              className="min-h-[150px]"
            />
             {state.errors?.content &&
              state.errors.content.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Enviar Imagem (Opcional)</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
            {state.errors?.image &&
              state.errors.image.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">Enviar Vídeo (Opcional)</Label>
            <Input id="video" name="video" type="file" accept="video/*" />
             {state.errors?.video &&
              state.errors.video.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          {state.message && state.message !== 'Post criado com sucesso.' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
