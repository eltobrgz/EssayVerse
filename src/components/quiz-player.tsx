'use client';

import type { Quiz, QuizOption } from "@/lib/definitions";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { submitQuizAttempt } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

type QuizState = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTING' | 'FINISHED';

export function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const [state, setState] = useState<QuizState>('NOT_STARTED');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId: optionId
  const [result, setResult] = useState<{ score: number, total: number } | null>(null);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleStart = () => {
    setState('IN_PROGRESS');
  };

  const handleAnswer = (optionId: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    setState('SUBMITTING');
    try {
        const quizResult = await submitQuizAttempt(quiz.id, answers);
        setResult(quizResult);
    } catch (error) {
        console.error("Failed to submit quiz", error);
        // Handle error display
    } finally {
        setState('FINISHED');
    }
  };

  if (state === 'NOT_STARTED') {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Quiz: {quiz.title}</h3>
        <p className="text-muted-foreground">Este quiz tem {quiz.questions.length} questões. Pronto para começar?</p>
        <Button onClick={handleStart}>Iniciar Quiz</Button>
      </div>
    );
  }

  if (state === 'IN_PROGRESS' || state === 'SUBMITTING') {
    return (
      <div>
        <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="mb-4" />
        <Card>
          <CardHeader>
            <CardTitle>Questão {currentQuestionIndex + 1} de {quiz.questions.length}</CardTitle>
            <CardDescription className="text-lg pt-2">{currentQuestion.question_text}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup onValueChange={handleAnswer} value={answers[currentQuestion.id]}>
              {currentQuestion.options.map(option => (
                <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.option_text}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        <div className="flex justify-end mt-4">
          {currentQuestionIndex < quiz.questions.length - 1 ? (
             <Button onClick={handleNext} disabled={!answers[currentQuestion.id]}>Próxima</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={state === 'SUBMITTING' || !answers[currentQuestion.id]}>
                {state === 'SUBMITTING' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finalizar Quiz
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (state === 'FINISHED' && result) {
     const percentage = (result.score / result.total) * 100;
     return (
       <div className="text-center space-y-4">
         <h3 className="text-2xl font-bold">Quiz Finalizado!</h3>
         <p className="text-lg text-muted-foreground">Sua pontuação foi:</p>
         <div className="flex items-baseline justify-center gap-2">
            <span className={cn(
                "text-6xl font-bold",
                percentage >= 80 && "text-green-500",
                percentage >= 50 && percentage < 80 && "text-yellow-500",
                percentage < 50 && "text-destructive"
            )}>{result.score}</span>
            <span className="text-2xl text-muted-foreground">/ {result.total}</span>
         </div>
         <p className="font-semibold text-xl">({percentage.toFixed(0)}%)</p>
         <Button variant="outline" onClick={() => { setState('NOT_STARTED'); setCurrentQuestionIndex(0); setAnswers({})}}>Tentar Novamente</Button>
       </div>
     )
  }

  return null;
}
