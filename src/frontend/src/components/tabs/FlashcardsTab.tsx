import { useState } from 'react';
import { useGetAllFlashcards, useCreateFlashcard, useEditFlashcard } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, BookOpen } from 'lucide-react';
import type { Flashcard } from '../../backend';
import CreateFlashcardDialog from '../dialogs/CreateFlashcardDialog';
import FlashcardViewer from '../FlashcardViewer';

interface FlashcardsTabProps {
  searchResults?: Flashcard[];
}

export default function FlashcardsTab({ searchResults }: FlashcardsTabProps) {
  const { data: allFlashcards, isLoading } = useGetAllFlashcards();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [viewingFlashcards, setViewingFlashcards] = useState<Flashcard[] | null>(null);

  const flashcards = searchResults || allFlashcards || [];

  const groupedByTopic = flashcards.reduce((acc, card) => {
    if (!acc[card.topic]) {
      acc[card.topic] = [];
    }
    acc[card.topic].push(card);
    return acc;
  }, {} as Record<string, Flashcard[]>);

  const topics = Object.keys(groupedByTopic).sort();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Flashcards</h3>
          <p className="text-sm text-muted-foreground">
            {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''} across {topics.length} topic
            {topics.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flashcard
        </Button>
      </div>

      {flashcards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No flashcards yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first flashcard to start studying
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Flashcard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {topics.map((topic) => (
            <Card key={topic}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{topic}</CardTitle>
                    <CardDescription>
                      {groupedByTopic[topic].length} flashcard{groupedByTopic[topic].length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingFlashcards(groupedByTopic[topic])}
                  >
                    Study
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedByTopic[topic].map((card) => (
                    <div
                      key={card.id}
                      className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <Badge variant="outline" className={getDifficultyColor(card.difficulty)}>
                          {card.difficulty}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => setEditingFlashcard(card)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm font-medium">{card.question}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{card.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFlashcardDialog
        open={isCreateOpen || !!editingFlashcard}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingFlashcard(null);
        }}
        editingFlashcard={editingFlashcard}
      />

      {viewingFlashcards && (
        <FlashcardViewer
          flashcards={viewingFlashcards}
          onClose={() => setViewingFlashcards(null)}
        />
      )}
    </>
  );
}
