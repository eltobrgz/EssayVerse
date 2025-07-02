'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, Send, Loader2, X, Sparkles } from 'lucide-react';
import { askTutor } from '@/ai/flows/ask-tutor';
import { type ChatHistory } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { useToast } from '@/hooks/use-toast';

export function ChatTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatHistory>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages: ChatHistory = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askTutor(newMessages);
      setMessages((prev) => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error('Error with AI Tutor:', error);
      toast({
        variant: 'destructive',
        title: 'AI Tutor Error',
        description: 'Sorry, I couldn\'t get a response. Please try again later.',
      });
      // Remove the user's message if the API call fails
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };
  
  const initialMessage = {
    role: 'model',
    content: "Olá! Eu sou o Verse, seu tutor de redação. Como posso ajudar você hoje? Você pode me pedir para corrigir uma frase, sugerir tópicos ou explicar um conceito gramatical."
  } as const;


  return (
    <>
      <div className={cn(
        "fixed bottom-4 right-4 z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-[500px]" : "translate-x-0"
      )}>
        <Button onClick={() => setIsOpen(true)} size="lg" className="rounded-full h-16 w-16 shadow-lg">
          <MessageSquarePlus className="h-8 w-8" />
          <span className="sr-only">Open AI Tutor</span>
        </Button>
      </div>

      <div
        className={cn(
          'fixed bottom-4 right-4 z-50 h-[calc(100svh-2rem)] w-[440px] max-w-[calc(100vw-2rem)] flex-col rounded-lg border bg-card shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0 flex' : 'translate-x-[500px]'
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Logo className="text-base" />
            <span className="text-sm font-medium">Tutor</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
              <ChatMessage message={initialMessage} />
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo sobre redação..."
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

function ChatMessage({ message }: { message: { role: 'user' | 'model'; content: string } }) {
    const isUser = message.role === 'user';
    return (
        <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
           {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-5 w-5" />
                </div>
            )}
            <div
                className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap",
                    isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
            >
              {message.content}
            </div>
        </div>
    );
}
