
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
import { signup } from '@/app/auth/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function SignupButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : 'Criar uma conta'}
        </Button>
    );
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const type = searchParams.get('type');
  const isSuccess = type === 'success';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Cadastre-se</CardTitle>
            <CardDescription>
              Insira suas informações para criar uma conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess && message ? (
              <Alert variant="default" className="border-green-500 text-green-700">
                <CheckCircle className="h-4 w-4 !text-green-500" />
                <AlertTitle>Verifique seu email!</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : (
              <form action={signup} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input id="fullName" name="fullName" placeholder="João da Silva" required />
                </div>
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
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                 <div className="grid gap-2">
                    <Label>Eu sou</Label>
                    <RadioGroup defaultValue="student" name="role" className="flex gap-4" required>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="student" id="role-student" />
                            <Label htmlFor="role-student" className="font-normal">Aluno(a)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="teacher" id="role-teacher" />
                            <Label htmlFor="role-teacher" className="font-normal">Professor(a)</Label>
                        </div>
                    </RadioGroup>
                </div>
                
                {message && !isSuccess && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Falha no Cadastro</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                <SignupButton />
              </form>
            )}
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
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
