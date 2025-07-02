
'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Quiz, Resource, ResourceType } from '@/lib/definitions';
import { AlertCircle, Loader2, Plus, Trash } from 'lucide-react';
import { createResource, updateResource, deleteResource } from '@/lib/actions';

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isEditMode ? (
        'Salvar Alterações'
      ) : (
        'Criar Recurso'
      )}
    </Button>
  );
}

function DeleteButton({ resourceId }: { resourceId: string }) {
    const [pending, setPending] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setPending(true);
        await deleteResource(resourceId);
        setPending(false);
    }
    return (
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={pending}>
                    {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                    Excluir Recurso
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o recurso.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                       Confirmar Exclusão
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function ResourceForm({ resource }: { resource?: Quiz }) {
  const isEditMode = !!resource;
  const [resourceType, setResourceType] = useState<ResourceType | ''>(
    resource?.resource_type || ''
  );
  
  const initialQuestions = resource?.questions?.map(q => ({
      question_text: q.question_text,
      options: q.options.map(opt => ({ option_text: opt.option_text, is_correct: opt.is_correct }))
  })) || [{ question_text: '', options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }] }];

  const [questions, setQuestions] = useState(initialQuestions);

  const initialState = { message: null, errors: {} };
  const action = isEditMode
    ? updateResource.bind(null, resource.id)
    : createResource;
  const [state, dispatch] = useActionState(action, initialState);

  const searchParams = useSearchParams();
  const showDelete = searchParams.get('action') === 'delete';
  if (showDelete && isEditMode) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Excluir Recurso</CardTitle>
                <CardDescription>Tem certeza de que deseja excluir permanentemente o recurso "{resource.title}"?</CardDescription>
            </CardHeader>
            <CardFooter>
                <DeleteButton resourceId={resource.id} />
            </CardFooter>
        </Card>
      )
  }

  // Handle Quiz-related state and functions
  const handleAddQuestion = () => setQuestions([...questions, { question_text: '', options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }] }]);
  const handleRemoveQuestion = (index: number) => setQuestions(questions.filter((_, qIndex) => qIndex !== index));
  const handleQuestionChange = (qIndex: number, value: string) => { const newQuestions = [...questions]; newQuestions[qIndex].question_text = value; setQuestions(newQuestions); };
  const handleAddOption = (qIndex: number) => { const newQuestions = [...questions]; newQuestions[qIndex].options.push({ option_text: '', is_correct: false }); setQuestions(newQuestions); };
  const handleRemoveOption = (qIndex: number, oIndex: number) => { const newQuestions = [...questions]; newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, optIndex) => optIndex !== oIndex); setQuestions(newQuestions); };
  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => { const newQuestions = [...questions]; newQuestions[qIndex].options[oIndex].option_text = value; setQuestions(newQuestions); };
  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => { const newQuestions = [...questions]; newQuestions[qIndex].options.forEach((option, index) => { option.is_correct = index === oIndex; }); setQuestions(newQuestions); };


  return (
    <form action={dispatch}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Detalhes do Recurso</CardTitle>
          <CardDescription>
            Forneça as informações básicas do seu material de estudo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input type="hidden" name="currentImageUrl" value={resource?.image_url || ''} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="resourceType">Tipo de Recurso</Label>
              <Select
                name="resourceType"
                required
                defaultValue={resource?.resource_type}
                onValueChange={(value: ResourceType) => setResourceType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Videoaula</SelectItem>
                  <SelectItem value="MIND_MAP">Mapa Mental</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidade</Label>
              <Select name="visibility" defaultValue={resource?.visibility || "PUBLIC"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Defina a visibilidade..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Público (para todos)</SelectItem>
                  <SelectItem value="RESTRICTED">Restrito (só para meus alunos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input name="title" defaultValue={resource?.title} placeholder="Ex: Como usar a crase corretamente" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea name="description" defaultValue={resource?.description || ''} placeholder="Descreva o conteúdo deste recurso..." />
          </div>

          {resourceType === 'VIDEO' && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo (YouTube)</Label>
              <Input name="videoUrl" defaultValue={resource?.video_url || ''} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
          )}

          {resourceType === 'MIND_MAP' && (
            <div className="space-y-2">
              <Label htmlFor="image">Upload do Mapa Mental (Imagem)</Label>
              <Input name="image" type="file" accept="image/*" />
               {resource?.image_url && <p className='text-xs text-muted-foreground'>Imagem atual será substituída se uma nova for enviada.</p>}
            </div>
          )}
          
          {/* O editor de Quiz é simplificado para o escopo desta tarefa */}
          {resourceType === 'QUIZ' && isEditMode && (
             <p className='text-sm text-muted-foreground'>A edição de questões do quiz ainda não é suportada.</p>
          )}

          {resourceType === 'QUIZ' && !isEditMode && (
             <div className="space-y-4">
              <h3 className="text-lg font-semibold">Questões do Quiz</h3>
              {questions.map((q, qIndex) => (
                <Card key={qIndex} className="p-4 bg-muted/50">
                   <div className="flex justify-end mb-2"> <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveQuestion(qIndex)}><Trash className="h-4 w-4" /></Button> </div>
                  <div className="space-y-2">
                    <Label htmlFor={`question-${qIndex}`}>Enunciado da Questão {qIndex + 1}</Label>
                    <Input name={`questions[${qIndex}][question_text]`} value={q.question_text} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} placeholder="Qual a pergunta?" required />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label>Opções de Resposta</Label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input type="radio" name={`questions[${qIndex}][correct_option]`} checked={opt.is_correct} onChange={() => handleCorrectOptionChange(qIndex, oIndex)} required />
                        <Input name={`questions[${qIndex}][options][${oIndex}]`} value={opt.option_text} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Opção ${oIndex + 1}`} required />
                         <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(qIndex, oIndex)}><Trash className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddOption(qIndex)}><Plus className="mr-2 h-4 w-4" /> Adicionar Opção</Button>
                  </div>
                   <input type="hidden" name={`questions[${qIndex}][correct_option_index]`} value={q.options.findIndex(o => o.is_correct)} />
                </Card>
              ))}
              <Button type="button" onClick={handleAddQuestion}> Adicionar Questão </Button>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
           {state?.message && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Erro ao Salvar Recurso</AlertTitle>
               <AlertDescription>{state.message}</AlertDescription>
             </Alert>
           )}
          <SubmitButton isEditMode={isEditMode} />
        </CardFooter>
      </Card>
    </form>
  );
}
