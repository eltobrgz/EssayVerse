import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Zap, Users, BarChart } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Começar Gratuitamente</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent"></div>
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-4 text-foreground">
              Domine Sua Escrita com Precisão de IA
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              O EssayVerse fornece feedback instantâneo com IA para ajudar você a
              elevar suas redações. Obtenha notas, sugestões e acompanhe seu
              progresso para liberar todo o seu potencial.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Comece a Melhorar Hoje</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline">
                Tudo o Que Você Precisa para Ter Sucesso
              </h2>
              <p className="text-muted-foreground mt-2">
                Ferramentas poderosas para alunos e educadores.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Correção Instantânea por IA"
                description="Envie sua redação e receba uma nota imediata e feedback detalhado."
              />
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8" />}
                title="Sugestões Práticas"
                description="Receba dicas concretas sobre como melhorar gramática, estrutura e clareza."
              />
              <FeatureCard
                icon={<BarChart className="w-8 h-8" />}
                title="Acompanhe seu Progresso"
                description="Visualize sua melhoria ao longo do tempo com gráficos e análises detalhadas."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Fórum da Comunidade"
                description="Conecte-se com colegas e educadores para compartilhar conhecimento e obter conselhos."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EssayVerse. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center p-6 flex flex-col items-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 font-headline">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
    </Card>
  );
}
