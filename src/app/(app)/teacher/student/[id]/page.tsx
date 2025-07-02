
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getStudentDetailsForTeacher } from "@/lib/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function StudentDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user: teacher } } = await supabase.auth.getUser();

    if (!teacher) {
        notFound();
    }

    const studentData = await getStudentDetailsForTeacher(params.id, teacher.id);

    if (!studentData) {
        notFound();
    }

    const { profile: student, essays } = studentData;
    
    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={student?.avatar_url} />
                        <AvatarFallback className="text-3xl">
                            {student?.full_name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold font-headline">
                            {student?.full_name}
                        </h1>
                        <p className="text-muted-foreground">{student?.email}</p>
                        {student?.bio && (
                            <p className="mt-2 text-sm text-foreground max-w-prose">
                                {student.bio}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Redações</CardTitle>
                    <CardDescription>Todas as redações enviadas por {student?.full_name.split(' ')[0]}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Enviado em</TableHead>
                                <TableHead>Nota (IA)</TableHead>
                                <TableHead>Status Correção</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {essays && essays.length > 0 ? (
                                essays.map(essay => (
                                    <TableRow key={essay.id}>
                                        <TableCell>
                                            <Link href={essay.image_url ? `/teacher/submissions/${essay.id}` : '#'} className="font-medium hover:underline">
                                                {essay.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{essay.type}</Badge></TableCell>
                                        <TableCell>{format(new Date(essay.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                        <TableCell>{essay.score}</TableCell>
                                        <TableCell>
                                             {essay.image_url ? 
                                                (essay.reviewed_by_teacher_at ? 'Corrigido' : 'Pendente') :
                                                ('Sem imagem')
                                             }
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Este aluno ainda não enviou nenhuma redação.</TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
