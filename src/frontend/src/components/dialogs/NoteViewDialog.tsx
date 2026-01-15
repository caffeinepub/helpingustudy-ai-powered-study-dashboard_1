import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { StudyNote } from '../../backend';

interface NoteViewDialogProps {
  note: StudyNote;
  onClose: () => void;
}

export default function NoteViewDialog({ note, onClose }: NoteViewDialogProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{note.topic}</Badge>
              {note.isGenerated && (
                <Badge variant="outline" className="bg-chart-1/10 text-chart-1">
                  AI Generated
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl">{note.title}</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(note.createdAt)}
            </div>
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">
            {note.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
