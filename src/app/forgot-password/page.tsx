
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendPasswordResetEmail } from '@/app/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Enviar Link de Redefinição'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const type = searchParams.get('type');
  const isSuccess = type === 'success';

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Redefinir Senha</CardTitle>
            <CardDescription>
              Digite seu email e enviaremos um link para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isSuccess ? (
              <Alert variant="default" className="border-green-500 text-green-700">
                <CheckCircle className="h-4 w-4 !text-green-500" />
                <AlertTitle>Email Enviado!</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : (
                <form action={sendPasswordResetEmail} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@exemplo.com"
                        required
                        />
                    </div>
                    {message && (
                        <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                    <SubmitButton />
                </form>
            )}
             <div className="mt-4 text-center text-sm">
              Lembrou sua senha?{' '}
              <Link href="/login" className="underline">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
