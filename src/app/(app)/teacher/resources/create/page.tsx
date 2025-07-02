
import { ResourceForm } from "@/components/resource-form";

export default function CreateResourcePage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">Criar Novo Recurso</h1>
                <p className="text-muted-foreground">
                    Escolha o tipo de material que deseja criar e preencha as informações.
                </p>
            </div>
            <ResourceForm />
        </div>
    )
}
