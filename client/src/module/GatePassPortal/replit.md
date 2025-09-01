# Gate Pass System

## Overview

This is a web application for managing gate passes in an educational institution. The system allows users to create and manage gate passes for students, providing a digital solution for tracking student movement in and out of campus facilities. The application uses a modern React frontend with Shadcn UI components and a Node.js Express backend. Data is stored using Drizzle ORM with support for PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture with clear separation between frontend and backend components:

1. **Frontend**: React-based single-page application using Vite as the build tool
2. **Backend**: Express.js server handling API requests and business logic
3. **Database**: Drizzle ORM with PostgreSQL support
4. **State Management**: React Query for server state management
5. **UI Components**: Shadcn UI components based on Radix UI primitives
6. **Styling**: Tailwind CSS for utility-first styling

The project is structured with client, server, and shared directories to maintain clear separation of concerns while allowing for type sharing between frontend and backend.

## Key Components

### Frontend (client/src)

1. **Pages**:
   - `GatePassForm.tsx`: The main form for creating gate passes
   - `not-found.tsx`: 404 page for handling invalid routes

2. **Components**:
   - UI components: A comprehensive set of Shadcn UI components in `components/ui`
   - `GatePassHeader.tsx`: Header component specific to the gate pass form

3. **Hooks**:
   - `useGatePass.ts`: Custom hook for managing gate pass data and functionality
   - `use-toast.ts`: Hook for managing toast notifications
   - `use-mobile.tsx`: Hook for responsive design based on viewport size

4. **Utilities**:
   - `queryClient.ts`: Configuration for React Query
   - `utils/dateUtils.ts`: Utility functions for date manipulation and validation

### Backend (server)

1. **API Routes**:
   - `/api/gate-pass`: Endpoint for creating gate passes

2. **Storage Layer**:
   - `storage.ts`: Interface and implementation for data persistence
   - Currently implements a memory storage solution, but designed to work with PostgreSQL

3. **Server Initialization**:
   - `index.ts`: Main server file that sets up Express and middleware

### Shared (shared)

1. **Database Schema**:
   - `schema.ts`: Defines database tables and validation schemas using Drizzle ORM and Zod

## Data Flow

1. **Gate Pass Creation Flow**:
   - User fills out the gate pass form in the UI
   - Frontend validates the form using Zod schemas
   - On form submission, data is sent to the `/api/gate-pass` endpoint
   - Backend performs additional validation
   - Data is stored in the database
   - A text file representation of the gate pass is generated and saved
   - Frontend displays success or error message using toast notifications

2. **Validation Flow**:
   - Form validation occurs client-side using shared Zod schemas
   - Server-side validation ensures data integrity before database operations

## External Dependencies

### Frontend

1. **UI Framework**:
   - React for UI components
   - Radix UI for accessible primitives
   - Shadcn UI for pre-built component patterns

2. **State Management**:
   - React Query for server state
   - React Hook Form for form state

3. **Styling**:
   - Tailwind CSS for utility classes
   - Class-variance-authority for component variants

### Backend

1. **Server Framework**:
   - Express.js for API routing and middleware

2. **Database**:
   - Drizzle ORM for database operations
   - PostgreSQL as the database (via Neon's serverless driver)

3. **Validation**:
   - Zod for schema validation

### Build Tools

1. **Vite** for frontend bundling
2. **esbuild** for backend bundling
3. **TypeScript** for type safety across the application

## Deployment Strategy

The application is configured for deployment on Replit, with the following setup:

1. **Development Mode**:
   - `npm run dev`: Starts the development server using tsx for backend and Vite for frontend

2. **Production Build**:
   - `npm run build`: Builds the frontend using Vite and the backend using esbuild
   - Outputs to the `dist` directory

3. **Production Start**:
   - `npm run start`: Runs the built application from the dist directory

4. **Database Management**:
   - `npm run db:push`: Updates the database schema using Drizzle Kit

The deployment is configured in the `.replit` file to automatically build and run the application. The ports are mapped appropriately to expose the application publicly.

## Development Guidelines

1. **Frontend Development**:
   - Add new pages in the `client/src/pages` directory
   - Update routing in `App.tsx` for new pages
   - Use shared schema definitions for form validation

2. **Backend Development**:
   - Add new API endpoints in `server/routes.ts`
   - Extend the storage interface in `server/storage.ts` for new data operations
   - Use shared schema definitions for data validation

3. **Database Schema Changes**:
   - Update the schema in `shared/schema.ts`
   - Run `npm run db:push` to update the database schema

4. **Component Development**:
   - Follow the Shadcn UI pattern for new components
   - Use the utility-first approach with Tailwind CSS
   - Maintain accessibility standards with Radix UI primitives