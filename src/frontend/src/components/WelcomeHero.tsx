import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Brain, FileText, Trophy } from 'lucide-react';

export default function WelcomeHero() {
  const { login, loginStatus } = useInternetIdentity();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Automatically generate flashcards, quizzes, and notes from your study materials',
    },
    {
      icon: BookOpen,
      title: 'Smart Flashcards',
      description: 'Create and organize flashcards by topic and difficulty level',
    },
    {
      icon: Trophy,
      title: 'Quiz Performance',
      description: 'Track your progress with detailed quiz history and analytics',
    },
    {
      icon: FileText,
      title: 'Study Notes',
      description: 'Generate comprehensive study notes and summaries from your materials',
    },
  ];

  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/assets/generated/hero-study-dashboard.dim_800x400.png"
              alt="Study Dashboard"
              className="h-auto w-full max-w-2xl rounded-2xl shadow-2xl"
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              HelpingUStudy
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Your AI-powered study companion. Transform your study materials into interactive flashcards, quizzes, and
            comprehensive notes. Track your progress and master any subject with ease.
          </p>
          <Button
            size="lg"
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="h-12 px-8 text-base"
          >
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Get Started'}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-2/20">
                  <feature.icon className="h-6 w-6 text-chart-1" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
