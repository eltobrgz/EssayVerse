
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getTeacherConnections, acceptConnectionRequest, rejectConnectionRequest } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';
import type { Profile } from '@/lib/definitions';

function StudentCard({ student, isPending }: { student: Profile, isPending: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={student.avatar_url} />
                    <AvatarFallback>{student.full_name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{student.full_name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
            </div>
            {isPending && (
                <div className="flex items-center gap-2">
                    <form action={acceptConnectionRequest}>
                        <input type="hidden" name="studentId" value={student.id} />
                        <Button type="submit" size="sm">
                            <Check className="mr-2 h-4 w-4" />
                            Aceitar
                        </Button>
                    </form>
                    <form action={rejectConnectionRequest}>
                         <input type="hidden" name="studentId" value={student.id} />
                        <Button type="submit" size="sm" variant="destructive">
                            <X className="mr-2 h-4 w-4" />
                            Rejeitar
                        </Button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default async function MyStudentsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) notFound();

    const { accepted, pending } = await getTeacherConnections(user.id);

    return (
       <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Solicitações Pendentes ({pending.length})</CardTitle>
                    <CardDescription>Alunos que desejam se conectar com você.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {pending.length > 0 ? (
                        pending.map(student => <StudentCard key={student.id} student={student} isPending={true} />)
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente no momento.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Meus Alunos ({accepted.length})</CardTitle>
                    <CardDescription>Alunos que você orienta na plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {accepted.length > 0 ? (
                        accepted.map(student => <StudentCard key={student.id} student={student} isPending={false} />)
                    ) : (
                        <p className="text-sm text-muted-foreground">Você ainda não tem alunos conectados.</p>
                    )}
                </CardContent>
            </Card>
       </div>
    )
}
