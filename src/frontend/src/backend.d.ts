import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface FlashcardInput {
    topic: string;
    question: string;
    difficulty: string;
    answer: string;
}
export interface SearchResult {
    notes: Array<StudyNote>;
    flashcards: Array<Flashcard>;
    quizzes: Array<Array<QuizQuestion>>;
}
export type Time = bigint;
export interface FileMetadata {
    id: string;
    blob: ExternalBlob;
    name: string;
    fileType: string;
    uploadTime: Time;
    uploadedBy: Principal;
}
export interface QuizQuestion {
    id: string;
    topic: string;
    question: string;
    difficulty: string;
    correctAnswer: string;
    isGenerated: boolean;
    sourceMaterial?: string;
    options: Array<string>;
}
export interface QuizAttempt {
    id: string;
    topic: string;
    difficulty: string;
    user: Principal;
    score: bigint;
    totalQuestions: bigint;
    timestamp: Time;
    questions: Array<QuizQuestion>;
}
export interface Flashcard {
    id: string;
    topic: string;
    question: string;
    difficulty: string;
    createdAt: Time;
    createdBy: Principal;
    answer: string;
    isGenerated: boolean;
    sourceMaterial?: string;
}
export interface StudyNote {
    id: string;
    title: string;
    topic: string;
    content: string;
    createdAt: Time;
    createdBy: Principal;
    isGenerated: boolean;
    sourceMaterial?: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createFlashcard(input: FlashcardInput): Promise<string>;
    createNote(title: string, content: string, topic: string): Promise<string>;
    deleteFile(id: string): Promise<void>;
    deleteFlashcard(id: string): Promise<void>;
    deleteNote(id: string): Promise<void>;
    editFlashcard(id: string, updatedInput: FlashcardInput): Promise<void>;
    getAllFiles(): Promise<Array<FileMetadata>>;
    getAllFlashcards(): Promise<Array<Flashcard>>;
    getAllNotes(): Promise<Array<StudyNote>>;
    getAllQuizzes(): Promise<Array<Array<QuizQuestion>>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFile(id: string): Promise<FileMetadata | null>;
    getFilesByUser(user: Principal): Promise<Array<FileMetadata>>;
    getFlashcard(id: string): Promise<Flashcard | null>;
    getFlashcardsByDifficulty(difficulty: string): Promise<Array<Flashcard>>;
    getFlashcardsByTopic(topic: string): Promise<Array<Flashcard>>;
    getMyQuizAttempts(): Promise<Array<QuizAttempt>>;
    getNote(id: string): Promise<StudyNote | null>;
    getNotesByTopic(topic: string): Promise<Array<StudyNote>>;
    getQuiz(id: string): Promise<Array<QuizQuestion> | null>;
    getQuizzesByTopic(topic: string): Promise<{
        questions: Array<QuizQuestion>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveFileReference(name: string, fileType: string, blob: ExternalBlob): Promise<string>;
    saveQuiz(questions: Array<QuizQuestion>, topic: string, difficulty: string): Promise<string>;
    saveQuizAttempt(attempt: QuizAttempt): Promise<void>;
    searchContent(searchTerm: string): Promise<SearchResult>;
}
