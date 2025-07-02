import {
  OverallProgressChart,
  ScoreByTypeChart,
} from '@/components/progress-charts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ProgressPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: overallData } = await supabase.rpc(
    'get_user_progress_overall',
    { p_user_id: user.id }
  );
  const { data: byTypeData } = await supabase.rpc(
    'get_user_progress_by_type',
    { p_user_id: user.id }
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Seu Progresso</h1>
        <p className="text-muted-foreground">
          Acompanhe sua melhoria e identifique áreas para crescimento.
        </p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Progresso Geral</TabsTrigger>
          <TabsTrigger value="by_type">Notas por Tipo</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nota Média ao Longo do Tempo</CardTitle>
              <CardDescription>
                Este gráfico mostra a tendência de suas notas médias em todas as redações
                enviadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OverallProgressChart data={overallData || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="by_type" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nota Média por Tipo de Redação</CardTitle>
              <CardDescription>
                Compare seu desempenho em diferentes tipos de redações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreByTypeChart data={byTypeData || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
