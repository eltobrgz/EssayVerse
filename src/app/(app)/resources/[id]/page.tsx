import { getResourceById } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Globe, Lock } from "lucide-react";
import Image from "next/image";
import { QuizPlayer } from "@/components/quiz-player";

export default async function ResourcePage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        notFound();
    }

    const resource = await getResourceById(params.id, user.id);

    if (!resource) {
        notFound();
    }

    const renderResourceContent = () => {
        switch (resource.resource_type) {
            case 'VIDEO':
                if (!resource.video_url) return <p>URL do vídeo não encontrada.</p>;
                
                // Simple regex to get video ID from YouTube URL
                const videoIdMatch = resource.video_url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;

                if (!videoId) return <p>URL do YouTube inválida.</p>

                return (
                    <div className="aspect-video">
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            case 'MIND_MAP':
                if (!resource.image_url) return <p>URL da imagem não encontrada.</p>;
                return (
                     <div className="relative w-full aspect-video border rounded-lg overflow-hidden">
                        <Image src={resource.image_url} alt={`Mapa mental: ${resource.title}`} fill className="object-contain" data-ai-hint="mind map"/>
                    </div>
                );
            case 'QUIZ':
                return <QuizPlayer quiz={resource} />;
            default:
                return <p>Tipo de recurso desconhecido.</p>;
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                             <CardTitle className="font-headline text-2xl">{resource.title}</CardTitle>
                             <CardDescription>
                                Por {resource.profiles?.full_name || 'Professor'}
                            </CardDescription>
                        </div>
                         <Badge variant={resource.visibility === 'PUBLIC' ? 'outline' : 'secondary'}>
                            {resource.visibility === 'PUBLIC' ? <Globe className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                            {resource.visibility}
                        </Badge>
                    </div>
                     {resource.description && <p className="text-muted-foreground pt-4">{resource.description}</p>}
                </CardHeader>
                <CardContent>
                    {renderResourceContent()}
                </CardContent>
            </Card>
        </div>
    )
}
