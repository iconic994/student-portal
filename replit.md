# Replit.md

## Overview

Skillbanto is a comprehensive learning management system (LMS) built with React (frontend) and Express.js (backend). The application provides interactive courses, live sessions, assignments, and certificate management for educational purposes. It follows a full-stack monorepo structure with shared TypeScript types and uses PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI components with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth (OIDC-based) with session management
- **Session Store**: PostgreSQL-based session storage
- **Real-time**: WebSocket support for live sessions

### Database Architecture
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Centralized schema definitions in `shared/schema.ts`
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Management**: Express sessions stored in PostgreSQL
- **Authorization**: Role-based access (student, instructor, admin)
- **Security**: HTTP-only cookies with secure session handling

### Course Management
- **Courses**: Hierarchical structure with modules and progress tracking
- **Enrollments**: User-course relationships with progress percentage
- **Modules**: Individual learning units within courses
- **Resources**: Downloadable materials and links

### Assignment System
- **Types**: Multiple assignment types (quiz, project, essay)
- **Submissions**: File uploads and text submissions
- **Grading**: Score tracking and attempt management
- **Due Dates**: Time-limited assignments with deadline enforcement

### Live Sessions
- **Scheduling**: Instructor-led live sessions with calendar integration
- **Real-time**: WebSocket-based chat and video controls
- **Attendance**: Automatic attendance tracking
- **Recording**: Session recording capabilities

### Certificate System
- **Generation**: Automatic certificate generation on course completion
- **PDF Export**: Certificate download functionality
- **Verification**: Unique certificate numbers for authenticity

## Data Flow

1. **Authentication Flow**: User logs in via Replit Auth → Session created → User data cached
2. **Course Enrollment**: Browse courses → Enroll → Progress tracking begins
3. **Learning Flow**: Access modules → Complete content → Submit assignments → Track progress
4. **Live Sessions**: Join scheduled sessions → Real-time interaction → Attendance recorded
5. **Certification**: Complete course → Certificate generated → PDF available for download

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **eslint**: Code linting and formatting
- **drizzle-kit**: Database migration management

### Authentication Dependencies
- **openid-client**: OIDC authentication client
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management middleware

## Deployment Strategy

### Development Environment
- **Server**: Vite dev server with HMR for frontend
- **API**: Express server with TypeScript compilation via tsx
- **Database**: Neon PostgreSQL with connection pooling
- **WebSockets**: Integrated with Express server

### Production Build
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild compiles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push`
4. **Static Assets**: Express serves built frontend files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit application identifier (required for auth)
- **ISSUER_URL**: OIDC issuer URL (defaults to Replit)
- **NODE_ENV**: Environment mode (development/production)

### Scaling Considerations
- Database connection pooling for concurrent requests
- Session store in PostgreSQL for horizontal scaling
- WebSocket connections managed per server instance
- Static asset serving can be offloaded to CDN