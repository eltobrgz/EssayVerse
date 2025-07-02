
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getStudentConnections, searchTeachers, sendConnectionRequest } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus } from 'lucide-react';
import type { Profile } from '@/lib/definitions';
import Link from 'next/link';

function TeacherCard({ teacher, status }: { teacher: Profile, status: 'accepted' | 'pending' | 'search_result' }) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={teacher.avatar_url} />
                    <AvatarFallback>{teacher.full_name?.charAt(0) || 'T'}</AvatarFallback>
                </Avatar>
                <div>
                   <Link href={`/teacher-profile/${teacher.id}`} className="font-semibold hover:underline">
                        {teacher.full_name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                </div>
            </div>
            {status === 'accepted' && <Badge variant="secondary">Conectado</Badge>}
            {status === 'pending' && <Badge variant="outline">Pendente</Badge>}
            {status === 'search_result' && (
                 <form action={sendConnectionRequest}>
                    <input type="hidden" name="teacherId" value={teacher.id} />
                    <Button type="submit" size="sm" variant="outline">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Conectar
                    </Button>
                </form>
            )}
        </div>
    )
}


export default async function MyTeachersPage({ searchParams }: { searchParams?: { query?: string; }; }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) notFound();

    const query = searchParams?.query || '';
    
    async function handleSearch(formData: FormData) {
        'use server'
        const query = formData.get('query') as string;
        redirect(`/my-teachers?query=${query}`);
    }
    
    const { accepted, pending } = await getStudentConnections(user.id);
    const searchResults = query ? await searchTeachers(query) : [];

    const allConnectedOrPendingIds = [...accepted.map(t => t.id), ...pending.map(t => t.id)];
    const filteredSearchResults = searchResults.filter(t => t.id !== user.id && !allConnectedOrPendingIds.includes(t.id));

    return (
       <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Gerenciar Professores</CardTitle>
                    <CardDescription>Conecte-se com seus professores para receber feedback personalizado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Seus Professores ({accepted.length})</h3>
                        <div className="space-y-2">
                            {accepted.length > 0 ? (
                                accepted.map(teacher => <TeacherCard key={teacher.id} teacher={teacher} status="accepted" />)
                            ) : (
                                <p className="text-sm text-muted-foreground">Você ainda não está conectado a nenhum professor.</p>
                            )}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Solicitações Pendentes ({pending.length})</h3>
                        <div className="space-y-2">
                             {pending.length > 0 ? (
                                pending.map(teacher => <TeacherCard key={teacher.id} teacher={teacher} status="pending" />)
                            ) : (
                                <p className="text-sm text-muted-foreground">Você não tem solicitações pendentes.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Encontrar um Professor</CardTitle>
                    <CardDescription>Procure pelo nome ou email do professor.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSearch} className="flex items-center gap-2 mb-6">
                        <Input name="query" placeholder="prof.joao@email.com" defaultValue={query} className="flex-1" />
                        <Button type="submit"><Search className="mr-2 h-4 w-4" /> Buscar</Button>
                    </form>

                    <div className="space-y-2">
                       {query && filteredSearchResults.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center">Nenhum professor encontrado ou você já está conectado.</p>
                        )}
                        {filteredSearchResults.map(teacher => (
                           <TeacherCard key={teacher.id} teacher={teacher} status="search_result" />
                        ))}
                    </div>
                </CardContent>
            </Card>
       </div>
    )
}
