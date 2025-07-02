import { getPublicResources, getRestrictedResourcesForStudent } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, BrainCircuit, ListChecks, Lock, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <CardDescription>
          Por {resource.profiles?.full_name || 'Professor Anônimo'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {resource.description || 'Nenhuma descrição fornecida.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant={resource.visibility === 'PUBLIC' ? 'outline' : 'secondary'}>
          {resource.visibility === 'PUBLIC' ? 
            <Globe className="mr-1 h-3 w-3" /> :
            <Lock className="mr-1 h-3 w-3" />
          }
          {resource.visibility === 'PUBLIC' ? 'Público' : 'Restrito'}
        </Badge>
        <Button asChild size="sm">
          <Link href={`/resources/${resource.id}`}>Acessar</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


export default async function ResourcesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        notFound();
    }
    
    const publicResources = await getPublicResources();
    const restrictedResources = await getRestrictedResourcesForStudent(user.id);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Biblioteca de Recursos</h1>
                <p className="text-muted-foreground">Explore materiais de estudo criados por professores.</p>
            </div>
            
            <Tabs defaultValue="public">
                <TabsList>
                    <TabsTrigger value="public">Público</TabsTrigger>
                    <TabsTrigger value="restricted">Meus Professores</TabsTrigger>
                </TabsList>
                <TabsContent value="public" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {publicResources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                        {publicResources.length === 0 && (
                            <p className="text-muted-foreground md:col-span-3 text-center">Nenhum recurso público disponível no momento.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="restricted" className="mt-4">
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {restrictedResources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                        {restrictedResources.length === 0 && (
                            <p className="text-muted-foreground md:col-span-3 text-center">Você ainda não segue nenhum professor ou eles não postaram conteúdo restrito.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
