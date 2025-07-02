import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function WelcomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This should be handled by middleware, but as a safeguard.
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-headline">
            Login Realizado com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg">
            Bem-vindo(a) de volta,
          </p>
          <p className="font-bold text-primary break-all">
            {user.email}
          </p>
          <p className="mt-4 text-muted-foreground">
            Isso prova que sua autenticação está funcionando corretamente. O problema provavelmente está no carregamento de dados na página do painel, possivelmente devido às políticas do banco de dados (RLS).
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Ir para o Painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
