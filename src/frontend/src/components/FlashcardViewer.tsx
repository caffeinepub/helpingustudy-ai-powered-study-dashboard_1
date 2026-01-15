import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCw, X } from 'lucide-react';
import type { Flashcard } from '../backend';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function FlashcardViewer({ flashcards, onClose }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentCard.topic}</Badge>
              <Badge variant="outline" className={getDifficultyColor(currentCard.difficulty)}>
                {currentCard.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {flashcards.length}
              </span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className="relative min-h-[300px] cursor-pointer rounded-lg border-2 border-border bg-gradient-to-br from-card to-accent/5 p-8 transition-all hover:border-primary/50"
            onClick={handleFlip}
          >
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {isFlipped ? 'Answer' : 'Question'}
                </p>
                <p className="text-lg font-medium leading-relaxed">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={flashcards.length === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button variant="ghost" onClick={handleFlip}>
              <RotateCw className="mr-2 h-4 w-4" />
              Flip Card
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={flashcards.length === 1}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
