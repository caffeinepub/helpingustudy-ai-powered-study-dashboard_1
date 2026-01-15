import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { UserProfile } from '../backend';
import FlashcardsTab from './tabs/FlashcardsTab';
import QuizzesTab from './tabs/QuizzesTab';
import NotesTab from './tabs/NotesTab';
import UploadTab from './tabs/UploadTab';
import { useSearchContent } from '../hooks/useQueries';

interface DashboardContentProps {
  userProfile: UserProfile | null | undefined;
}

export default function DashboardContent({ userProfile }: DashboardContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('flashcards');
  const { data: searchResults } = useSearchContent(searchTerm);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.name || 'Student'}!
        </h2>
        <p className="text-muted-foreground">Manage your study materials and track your progress</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flashcards, quizzes, and notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="space-y-4">
          <FlashcardsTab searchResults={searchTerm ? searchResults?.flashcards : undefined} />
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <QuizzesTab searchResults={searchTerm ? searchResults?.quizzes : undefined} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <NotesTab searchResults={searchTerm ? searchResults?.notes : undefined} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <UploadTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
