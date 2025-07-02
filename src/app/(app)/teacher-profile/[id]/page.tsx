
import { getPublicProfessorProfile } from "@/lib/actions";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Video, BrainCircuit, ListChecks, Lock, Globe } from "lucide-react";
import type { Resource } from "@/lib/definitions";

const ICONS = {
  VIDEO: <Video className="h-6 w-6 text-primary" />,
  MIND_MAP: <BrainCircuit className="h-6 w-6 text-primary" />,
  QUIZ: <ListChecks className="h-6 w-6 text-primary" />,
};

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
         <div className="flex justify-center mb-4">{ICONS[resource.resource_type]}</div>
        <CardTitle>{resource.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {resource.description || 'Nenhuma descrição fornecida.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button asChild size="sm">
          <Link href={`/resources/${resource.id}`}>Acessar Recurso</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
    const data = await getPublicProfessorProfile(params.id);

    if (!data) {
        notFound();
    }

    const { profile, resources } = data;

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="text-3xl">
                            {profile.full_name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold font-headline">
                            {profile.full_name}
                        </h1>
                        <p className="text-muted-foreground">{profile.email}</p>
                        {profile.bio && (
                            <p className="mt-2 text-sm text-foreground max-w-prose">
                                {profile.bio}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Recursos Públicos</h2>
                {resources && resources.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {resources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            Este professor ainda não publicou nenhum recurso.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
