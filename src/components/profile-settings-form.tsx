
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfile } from '@/lib/actions';
import type { Profile, State } from '@/lib/definitions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        'Salvar Alterações'
      )}
    </Button>
  );
}

export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(updateProfile, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'Perfil atualizado com sucesso!') {
      toast({
        title: 'Sucesso!',
        description: state.message,
      });
      // Optionally reset form or handle success state
    } else if (state.message) {
      // Error message is displayed in the Alert component
    } else if (Object.keys(state.errors || {}).length > 0) {
        toast({
            variant: 'destructive',
            title: 'Erro de Validação',
            description: 'Por favor, corrija os erros no formulário.',
        });
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile.full_name || ''}
          required
        />
        {state.errors?.fullName && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.fullName[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Biografia</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio || ''}
          placeholder="Fale um pouco sobre você..."
          className="min-h-[120px]"
        />
        {state.errors?.bio && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.bio[0]}
          </p>
        )}
      </div>
       <div className="space-y-2">
            <Label htmlFor="avatar">Foto de Perfil</Label>
            <Input id="avatar" name="avatar" type="file" accept="image/*" />
            <p className="text-sm text-muted-foreground">
              Deixe em branco para manter a foto atual.
            </p>
             {state.errors?.avatar && (
                <p className="text-sm font-medium text-destructive">
                {state.errors.avatar[0]}
                </p>
            )}
        </div>
        
        {state.message && state.message !== 'Perfil atualizado com sucesso!' && (
            <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ocorreu um Erro</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}

      <SubmitButton />
    </form>
  );
}
