
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCommunityPost } from '@/lib/actions';
import { AlertCircle, Loader2, PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Post
    </Button>
  );
}

export function CommunityPostDialog() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createCommunityPost, initialState);
  const [open, setOpen] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'Post created successfully.') {
      setOpen(false);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask a question, or post a model essay.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., How to write a great conclusion?"
              required
            />
            {state.errors?.title &&
              state.errors.title.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Optional)</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Share more details here..."
              className="min-h-[150px]"
            />
             {state.errors?.content &&
              state.errors.content.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Upload Image (Optional)</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
            {state.errors?.image &&
              state.errors.image.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">Upload Video (Optional)</Label>
            <Input id="video" name="video" type="file" accept="video/*" />
             {state.errors?.video &&
              state.errors.video.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
          {state.message && state.message !== 'Post created successfully.' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
