
import { ResourceForm } from "@/components/resource-form";
import { getResourceById } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function EditResourcePage({ params }: { params: { id: string } }) {
    const resource = await getResourceById(params.id);

    if (!resource) {
        notFound();
    }
    
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">Editar Recurso</h1>
                <p className="text-muted-foreground">
                    Modifique as informações do seu material de estudo.
                </p>
            </div>
            <ResourceForm resource={resource} />
        </div>
    );
}
