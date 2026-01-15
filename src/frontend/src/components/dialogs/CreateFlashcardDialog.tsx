import { useState, useEffect } from 'react';
import { useCreateFlashcard, useEditFlashcard } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Flashcard } from '../../backend';

interface CreateFlashcardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFlashcard?: Flashcard | null;
}

export default function CreateFlashcardDialog({ open, onOpenChange, editingFlashcard }: CreateFlashcardDialogProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const createFlashcard = useCreateFlashcard();
  const editFlashcard = useEditFlashcard();

  useEffect(() => {
    if (editingFlashcard) {
      setQuestion(editingFlashcard.question);
      setAnswer(editingFlashcard.answer);
      setTopic(editingFlashcard.topic);
      setDifficulty(editingFlashcard.difficulty);
    } else {
      setQuestion('');
      setAnswer('');
      setTopic('');
      setDifficulty('medium');
    }
  }, [editingFlashcard, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !topic.trim()) return;

    const input = {
      question: question.trim(),
      answer: answer.trim(),
      topic: topic.trim(),
      difficulty,
    };

    if (editingFlashcard) {
      await editFlashcard.mutateAsync({ id: editingFlashcard.id, input });
    } else {
      await createFlashcard.mutateAsync(input);
    }

    onOpenChange(false);
  };

  const isLoading = createFlashcard.isPending || editFlashcard.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingFlashcard ? 'Edit Flashcard' : 'Create Flashcard'}</DialogTitle>
          <DialogDescription>
            {editingFlashcard ? 'Update your flashcard details' : 'Add a new flashcard to your study collection'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Mathematics, History, Biology"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="Enter your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : editingFlashcard ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
