# SignChain - Blockchain-based Electronic Signature Platform

## Overview

SignChain is a comprehensive electronic signature platform built on React with Express.js backend, leveraging blockchain technology for document verification and immutability. The application provides secure digital document signing capabilities with audit trails and verification features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handling
- **Database**: PostgreSQL with Drizzle ORM for persistent data storage
- **Authentication**: Simple session-based authentication with localStorage

## Key Components

### Database Schema (Drizzle ORM)
- **Users**: Authentication and user management
- **Documents**: File metadata, hashing, and blockchain references
- **Signatures**: Digital signature records with blockchain transaction hashes
- **Signature Requests**: Workflow management for signature collection
- **Audit Logs**: Complete activity tracking and compliance records

### Frontend Components
- **Navigation**: Responsive navigation with user authentication states
- **Document Viewer**: File preview and metadata display
- **Signature Pad**: Canvas-based signature drawing and text input
- **Upload Modal**: Drag-and-drop file upload with validation
- **Audit Trail**: Blockchain verification and activity history

### Authentication System
- **Registration/Login**: Simple form-based authentication
- **Session Management**: localStorage-based user persistence
- **Route Protection**: Authentication guards for protected pages

## Data Flow

1. **Document Upload**: Files are hashed (SHA-256), metadata stored, mock IPFS and blockchain hashes generated
2. **Signature Request**: Email notifications sent with secure sharing tokens
3. **Digital Signing**: Signatures captured via canvas or text input, recorded with blockchain transaction simulation
4. **Verification**: Complete audit trail with mock blockchain verification
5. **Compliance**: Immutable record keeping with cryptographic proofs

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon database connectivity (configured for PostgreSQL)
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing
- **crypto-js**: Client-side cryptographic operations
- **react-hook-form**: Form state management with Zod validation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant styling
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **eslint**: Code linting and formatting

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **File Watching**: Automatic TypeScript compilation
- **Database**: Drizzle migrations with push commands
- **Environment**: NODE_ENV=development with debug logging

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundling of Express server to `dist/index.js`
- **Database**: PostgreSQL with connection pooling via DATABASE_URL
- **Static Serving**: Express serves built frontend assets

### Database Configuration
- **Database**: PostgreSQL with connection pooling via Neon
- **ORM**: Drizzle configured for PostgreSQL dialect with serverless driver
- **Migrations**: Schema definitions in `shared/schema.ts`
- **Connection**: Environment-based DATABASE_URL configuration
- **Development**: Push-based schema updates for rapid iteration
- **Storage**: DatabaseStorage class with full CRUD operations for all entities

### Blockchain Integration
- **Mock Implementation**: Simulated blockchain operations for development
- **Hash Generation**: SHA-256 for document integrity
- **Transaction Simulation**: Mock transaction hashes and block numbers
- **IPFS Simulation**: Mock distributed storage references

The application follows a full-stack TypeScript architecture with shared schema validation, making it easy to maintain type safety across the entire codebase. The application now uses PostgreSQL for persistent data storage while maintaining mock blockchain functionality for development purposes.

## Recent Changes

### January 23, 2025
- **Database Integration**: Successfully migrated from in-memory storage to PostgreSQL
- **Drizzle ORM**: Implemented DatabaseStorage class with full database operations
- **Schema Migration**: Pushed database schema using `npm run db:push`
- **Data Persistence**: All user data, documents, signatures, and audit logs now persisted in database
- **Signature Workflow Enhancement**: Added comprehensive signature request system with modal interface
- **Document Management**: Created full document management page with search, filtering, and detailed viewer
- **Blockchain Verification**: Implemented verification dashboard with hash validation and audit trails
- **Navigation Enhancement**: Added document management and verification pages to navigation
- **UI/UX Improvements**: Enhanced document cards with signature request buttons and status badges