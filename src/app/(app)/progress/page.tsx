
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudentQuizHistory } from '@/lib/actions';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
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
  
  const quizHistory = await getStudentQuizHistory(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Seu Progresso</h1>
        <p className="text-muted-foreground">
          Acompanhe sua melhoria e identifique áreas para crescimento.
        </p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Progresso Geral</TabsTrigger>
          <TabsTrigger value="by_type">Notas por Tipo</TabsTrigger>
          <TabsTrigger value="quizzes">Histórico de Quizzes</TabsTrigger>
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
        <TabsContent value="quizzes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Quizzes</CardTitle>
              <CardDescription>
                Seus resultados nos quizzes de aprendizado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título do Quiz</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizHistory.length > 0 ? (
                    quizHistory.map(attempt => (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <Link href={`/resources/${attempt.quiz_resource_id}`} className="font-medium hover:underline">
                            {attempt.resources?.title || 'Quiz Removido'}
                          </Link>
                        </TableCell>
                        <TableCell>{attempt.score} / {attempt.total_questions}</TableCell>
                        <TableCell>{format(new Date(attempt.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Você ainda não completou nenhum quiz.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
