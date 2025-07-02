
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/server';
import { MoreHorizontal, PlusCircle, Video, BrainCircuit, ListChecks, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const ICONS = {
  VIDEO: <Video className="h-4 w-4" />,
  MIND_MAP: <BrainCircuit className="h-4 w-4" />,
  QUIZ: <ListChecks className="h-4 w-4" />,
};

export default async function TeacherResourcesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Meus Recursos</h1>
          <p className="text-muted-foreground">
            Gerencie seus materiais de aprendizado.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/resources/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Recurso
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources?.map(resource => (
          <Card key={resource.id}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                        {ICONS[resource.resource_type]}
                        {resource.title}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                               <Link href={`/teacher/resources/${resource.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                </Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem className="text-destructive" asChild>
                                <Link href={`/teacher/resources/${resource.id}/edit?action=delete`}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              <CardDescription>
                Criado em {format(new Date(resource.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge variant={resource.visibility === 'PUBLIC' ? 'default' : 'secondary'}>
                  {resource.visibility}
                </Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/resources/${resource.id}`}>Ver</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
         {resources?.length === 0 && (
          <Card className="md:col-span-3">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>Você ainda não criou nenhum recurso. Comece agora!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
