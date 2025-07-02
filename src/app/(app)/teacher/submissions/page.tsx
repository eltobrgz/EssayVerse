import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getSubmissionsForTeacher } from '@/lib/actions';
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
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { FileImage, CheckCircle2 } from 'lucide-react';

export default async function TeacherSubmissionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }
  
  const submissions = await getSubmissionsForTeacher(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações de Alunos</CardTitle>
        <CardDescription>
          Redações enviadas com imagem para sua correção manual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Título da Redação</TableHead>
              <TableHead>Enviado em</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions && submissions.length > 0 ? (
              submissions.map(submission => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.profiles?.full_name || 'Aluno Anônimo'}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/teacher/submissions/${submission.id}`}
                      className="font-medium hover:underline"
                    >
                      {submission.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true, locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {submission.reviewed_by_teacher_at ? (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Corrigido
                      </Badge>
                    ) : (
                       <Badge variant="outline">
                        <FileImage className="mr-1 h-3 w-3" />
                        Aguardando Correção
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma redação com imagem foi enviada por seus alunos ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
