'use client';

import { useState, useRef } from 'react';
import { generateSpeech } from '@/ai/flows/text-to-speech';
import { Button } from './ui/button';
import { Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AudioPlayer({ textToSpeak }: { textToSpeak: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handlePlay = async () => {
    if (audioSrc) {
      audioRef.current?.play();
      return;
    }

    setIsLoading(true);
    try {
      const newAudioSrc = await generateSpeech(textToSpeak);
      setAudioSrc(newAudioSrc);
      // Use a timeout to allow the state to update and the audio element to render
      setTimeout(() => {
        audioRef.current?.play();
      }, 0);
    } catch (error) {
      console.error('Failed to generate speech:', error);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Could not generate audio for this text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlay}
        disabled={isLoading}
        aria-label="Play audio feedback"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}
    </>
  );
}
