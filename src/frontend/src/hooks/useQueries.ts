import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  Flashcard, 
  FlashcardInput, 
  StudyNote, 
  QuizQuestion, 
  QuizAttempt, 
  FileMetadata, 
  SearchResult,
  UserProfile 
} from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Flashcard Queries
export function useGetAllFlashcards() {
  const { actor, isFetching } = useActor();

  return useQuery<Flashcard[]>({
    queryKey: ['flashcards'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFlashcards();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFlashcardsByTopic(topic: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Flashcard[]>({
    queryKey: ['flashcards', 'topic', topic],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFlashcardsByTopic(topic);
    },
    enabled: !!actor && !isFetching && !!topic,
  });
}

export function useCreateFlashcard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FlashcardInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createFlashcard(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      toast.success('Flashcard created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create flashcard: ${error.message}`);
    },
  });
}

export function useEditFlashcard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: FlashcardInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editFlashcard(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      toast.success('Flashcard updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update flashcard: ${error.message}`);
    },
  });
}

// Study Notes Queries
export function useGetAllNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<StudyNote[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, topic }: { title: string; content: string; topic: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNote(title, content, topic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create note: ${error.message}`);
    },
  });
}

// Quiz Queries
export function useGetAllQuizzes() {
  const { actor, isFetching } = useActor();

  return useQuery<QuizQuestion[][]>({
    queryKey: ['quizzes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuizzes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questions, topic, difficulty }: { questions: QuizQuestion[]; topic: string; difficulty: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveQuiz(questions, topic, difficulty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save quiz: ${error.message}`);
    },
  });
}

export function useGetMyQuizAttempts() {
  const { actor, isFetching } = useActor();

  return useQuery<QuizAttempt[]>({
    queryKey: ['quizAttempts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyQuizAttempts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveQuizAttempt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attempt: QuizAttempt) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveQuizAttempt(attempt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempts'] });
      toast.success('Quiz attempt saved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save quiz attempt: ${error.message}`);
    },
  });
}

// File Management Queries
export function useGetAllFiles() {
  const { actor, isFetching } = useActor();

  return useQuery<FileMetadata[]>({
    queryKey: ['files'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveFileReference() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, fileType, blob }: { name: string; fileType: string; blob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveFileReference(name, fileType, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });
}

// Search Query
export function useSearchContent(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<SearchResult>({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!actor) return { flashcards: [], quizzes: [], notes: [] };
      return actor.searchContent(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}
