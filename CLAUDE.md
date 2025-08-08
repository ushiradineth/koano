# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev`: Start development server with turbo mode
- `pnpm build`: Build the Next.js application
- `pnpm start`: Start production server
- `pnpm lint`: Run Biome linter with auto-fix (--write --unsafe)
- `pnpm format` or `pnpm fmt`: Format code with Biome
- `pnpm check`: Full check sequence (format → lint → build)

## Project Overview

Koano is a modern calendar management application built to replace the friction of juggling tools like Jira, Clockify, and Notion. It's a Next.js 14 app with TypeScript, using NextAuth for authentication and a separate backend API.

## Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand stores for different concerns
- **Authentication**: NextAuth v5 (beta) with custom backend integration
- **Drag & Drop**: @dnd-kit for event manipulation
- **Date/Time**: Day.js for date operations
- **Forms**: React Hook Form with Zod validation
- **Queries**: TanStack React Query
- **UI Components**: Radix UI primitives
- **Code Quality**: Biome for linting and formatting

### Component Structure
The app follows atomic design principles:
- **Atoms**: Basic components (Event, Header, Logo, Time, etc.)
- **Molecules**: Composed components (Day, Sidebar)
- **Templates**: Layout components (Grid - the main calendar grid)

### State Management (Zustand Stores)
- `event.ts`: Event CRUD operations with optimistic updates
- `global.ts`: Global app state (loading, access tokens)
- `interactions.ts`: UI interaction state (selecting, extending, active events)
- `settings.ts`: User preferences (view, timezone, clock format)

### Key Files
- `src/components/templates/Grid.tsx`: Main calendar grid with complex drag/drop logic
- `src/lib/stores/event.ts`: Event management with API integration
- `src/lib/types.ts`: TypeScript type definitions
- `src/lib/utils.ts`: Utility functions for time/pixel calculations
- `src/lib/consts.ts`: App constants and configuration

## Key Features Implementation

### Calendar Interaction
- **Event Creation**: Click and drag to select time ranges, creates preview then converts to event
- **Event Editing**: Click existing events to select, drag handles to resize
- **Event Moving**: Drag events to different days/times
- **Keyboard Shortcuts**: 
  - `Escape`: Clear selections/previews
  - `Ctrl/Cmd + C`: Copy selected events
  - `Ctrl/Cmd + V`: Paste copied events
  - `Backspace`: Delete selected events

### Event Management
All event operations use optimistic updates - UI updates immediately, with rollback on API failure. Toast notifications provide user feedback.

### Time Handling
- Uses Day.js for date operations with UTC conversion for API calls
- Pixel-to-time calculations for precise event positioning
- Quarter-hour (15-minute) snapping for event boundaries
- Multi-timezone support

## Development Notes

### Code Style
- Uses Biome for consistent formatting (2-space indentation, semicolons, trailing commas)
- Tailwind classes should be sorted (enforced by Biome useSortedClasses rule)
- TypeScript strict mode enabled

### API Integration
- Requires separate backend (https://github.com/ushiradineth/koano-api)
- Uses access tokens from NextAuth session for API calls
- Event operations include timezone conversion and error handling

### Environment Setup
- Copy `.env.example` to `.env` and configure environment variables
- Run backend API server separately
- Use `pnpm install` for dependency management

### Testing & Quality
- Run `pnpm check` before commits to ensure code quality
- Build process validates TypeScript and catches errors
- Biome handles both linting and formatting consistently