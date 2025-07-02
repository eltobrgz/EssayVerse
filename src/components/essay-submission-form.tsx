'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { submitAndScoreEssay } from '@/lib/actions';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit for Scoring
    </Button>
  );
}

export function EssaySubmissionForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(submitAndScoreEssay, initialState);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Essay</CardTitle>
          <CardDescription>Get instant AI-powered feedback on your writing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Essay Title</Label>
            <Input 
              id="title"
              name="title"
              placeholder="e.g., The Role of Technology in Education"
              required
            />
            {state.errors?.title &&
              state.errors.title.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>{error}</p>
              ))
            }
          </div>
          <div className="space-y-2">
            <Label htmlFor="essayType">Essay Type</Label>
            <Select name="essayType" required>
              <SelectTrigger id="essayType">
                <SelectValue placeholder="Select essay type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENEM">ENEM</SelectItem>
                <SelectItem value="Fuvest">Fuvest</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
             {state.errors?.essayType &&
              state.errors.essayType.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>{error}</p>
              ))
            }
          </div>
          <div className="space-y-2">
            <Label htmlFor="essayText">Essay Text</Label>
            <Textarea
              id="essayText"
              name="essayText"
              placeholder="Paste your essay here..."
              className="min-h-[300px]"
              required
            />
             {state.errors?.essayText &&
              state.errors.essayText.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>{error}</p>
              ))
            }
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Upload Image (Optional)</Label>
            <Input id="image" name="image" type="file" />
            <p className="text-sm text-muted-foreground">
              You can upload an image related to your essay, like a prompt or a chart.
            </p>
          </div>
          {state.message && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{state.message}</AlertDescription>
             </Alert>
           )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
