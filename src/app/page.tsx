import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Users, BarChart } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-4">
            Master Your Writing with AI Precision
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            EssayVerse provides instant, AI-powered feedback to help you elevate your essays. Get scores, suggestions, and track your progress to unlock your full potential.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Start Improving Today</Link>
          </Button>
        </section>

        <section className="bg-card py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center font-headline mb-12">
              Everything You Need to Succeed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-primary" />}
                title="Instant AI Scoring"
                description="Submit your essay and get an immediate score and detailed feedback."
              />
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8 text-primary" />}
                title="Actionable Suggestions"
                description="Receive concrete tips on how to improve grammar, structure, and clarity."
              />
              <FeatureCard
                icon={<BarChart className="w-8 h-8 text-primary" />}
                title="Track Your Progress"
                description="Visualize your improvement over time with insightful charts and analytics."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-primary" />}
                title="Community Forum"
                description="Connect with peers and educators to share knowledge and get advice."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EssayVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 font-headline">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
