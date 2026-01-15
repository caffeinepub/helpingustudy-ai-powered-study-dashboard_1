import { useState } from 'react';
import { useGetMyQuizAttempts } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Target } from 'lucide-react';
import type { QuizQuestion } from '../../backend';

interface QuizzesTabProps {
  searchResults?: QuizQuestion[][];
}

export default function QuizzesTab({ searchResults }: QuizzesTabProps) {
  const { data: quizAttempts, isLoading } = useGetMyQuizAttempts();

  const attempts = quizAttempts || [];
  const sortedAttempts = [...attempts].sort((a, b) => Number(b.timestamp - a.timestamp));

  const totalAttempts = attempts.length;
  const averageScore = attempts.length > 0
    ? Math.round((attempts.reduce((sum, a) => sum + Number(a.score), 0) / attempts.length))
    : 0;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="text-2xl font-bold">Quiz Performance</h3>
        <p className="text-sm text-muted-foreground">Track your progress and review past attempts</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/20">
                <Trophy className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAttempts}</p>
                <p className="text-xs text-muted-foreground">Total Quizzes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
                <Target className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageScore}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
                <Calendar className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {attempts.length > 0 ? formatDate(sortedAttempts[0].timestamp) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Last Attempt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No quiz attempts yet</h3>
            <p className="text-center text-sm text-muted-foreground">
              Complete quizzes to track your performance here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h4 className="font-semibold">Recent Attempts</h4>
          {sortedAttempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{attempt.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(attempt.timestamp)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getScoreColor(Number(attempt.score), Number(attempt.totalQuestions))}`}>
                      {Number(attempt.score)}/{Number(attempt.totalQuestions)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((Number(attempt.score) / Number(attempt.totalQuestions)) * 100)}%
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{attempt.difficulty}</Badge>
                  <Badge variant="outline">{attempt.questions.length} questions</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
