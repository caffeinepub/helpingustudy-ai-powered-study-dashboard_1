import { useState } from 'react';
import { useGetAllNotes } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar } from 'lucide-react';
import type { StudyNote } from '../../backend';
import CreateNoteDialog from '../dialogs/CreateNoteDialog';
import NoteViewDialog from '../dialogs/NoteViewDialog';

interface NotesTabProps {
  searchResults?: StudyNote[];
}

export default function NotesTab({ searchResults }: NotesTabProps) {
  const { data: allNotes, isLoading } = useGetAllNotes();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);

  const notes = searchResults || allNotes || [];

  const groupedByTopic = notes.reduce((acc, note) => {
    if (!acc[note.topic]) {
      acc[note.topic] = [];
    }
    acc[note.topic].push(note);
    return acc;
  }, {} as Record<string, StudyNote[]>);

  const topics = Object.keys(groupedByTopic).sort();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Study Notes</h3>
          <p className="text-sm text-muted-foreground">
            {notes.length} note{notes.length !== 1 ? 's' : ''} across {topics.length} topic
            {topics.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No notes yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first study note to organize your learning
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {topics.map((topic) => (
            <Card key={topic}>
              <CardHeader>
                <CardTitle>{topic}</CardTitle>
                <CardDescription>
                  {groupedByTopic[topic].length} note{groupedByTopic[topic].length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedByTopic[topic].map((note) => (
                    <div
                      key={note.id}
                      className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                      onClick={() => setViewingNote(note)}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="font-semibold">{note.title}</h4>
                        {note.isGenerated && (
                          <Badge variant="outline" className="bg-chart-1/10 text-chart-1">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{note.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateNoteDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {viewingNote && (
        <NoteViewDialog note={viewingNote} onClose={() => setViewingNote(null)} />
      )}
    </>
  );
}
