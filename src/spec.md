# HelpingUStudy - AI-Powered Study Dashboard

## Overview
HelpingUStudy is an AI-powered study dashboard application that helps users create and manage study materials through automated content generation and manual creation tools.

## Core Features

### AI Content Generation
- Upload study materials (text files, PDFs) or input text directly
- AI automatically generates:
  - Flashcards with questions and answers
  - Quiz questions with multiple choice or open-ended formats
  - Study notes and summaries
  - Practice questions
- Content generation based on user-specified subjects or topics

### Manual Content Creation
- Create custom flashcards with question/answer pairs
- Edit AI-generated flashcards
- Organize flashcards by topic or difficulty level

### Dashboard Interface
- View and manage all study materials in organized sections:
  - Flashcards grouped by topic/difficulty
  - Quizzes with performance tracking
  - AI-generated notes and summaries
- Search and filter functionality across all content types
- Performance history for completed quizzes

### File Management
- Upload system supporting text files and PDFs
- Process uploaded materials for AI content generation

## Data Storage (Backend)
The backend stores:
- User-uploaded files and text content
- Generated flashcards, quizzes, and notes
- User-created flashcards and edits
- Quiz performance history and scores
- Content organization (topics, difficulty levels)
- User study materials and metadata

## Backend Operations
- Process uploaded files and extract text content
- Generate study content using AI based on uploaded materials
- Store and retrieve flashcards, quizzes, and notes
- Track quiz performance and generate statistics
- Provide search and filtering capabilities across stored content
- Manage content organization and categorization
