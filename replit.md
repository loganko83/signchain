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
- **Real Email Integration**: Implemented SendGrid integration for signature request and completion notifications
- **Signature Workflow Enhancement**: Added sequential signing, deadline management, and workflow customization
- **PDF Generation**: Created comprehensive PDF download functionality with multiple format options
- **Enhanced Document Management**: Added advanced download options with PDF, JSON, and XML export formats
- **Email Notifications**: Real-time email alerts for signature requests, completions, and workflow updates
- **Database Schema Updates**: Added workflow fields (signatureOrder, isSequential, reminderSent) to support advanced signing workflows
- **Download API**: Implemented `/api/documents/:id/download` endpoint with configurable export options
- **UI Improvements**: Enhanced signature request modal with workflow options and deadline settings
- **Audit Trail Enhancement**: Complete email tracking and workflow status logging in audit system

### January 23, 2025 (Late Update)
- **Advanced Collaboration Features**: Comprehensive multi-user sequential signing and signature order management
- **Workflow Templates System**: Visual workflow builder with step-by-step configuration and reusable templates
- **Approval Workflows**: Added approval/rejection capabilities with reason tracking and automated notifications
- **Database Schema Enhancement**: Added workflowTemplates, documentCollaborators tables with approval tracking fields
- **CollaborationModal Component**: New tabbed interface combining single signature requests and complex workflow management
- **WorkflowBuilder Component**: Visual drag-and-drop workflow designer with role-based step configuration
- **WorkflowStatus Component**: Real-time workflow progress tracking with step visualization
- **API Routes Expansion**: Added workflow template CRUD, workflow execution, and approval/rejection endpoints
- **Storage Layer Updates**: Enhanced database storage with workflow template management and execution capabilities
- **Korean UI**: All collaboration features implemented with Korean language interface as requested

### January 23, 2025 (Final Update)
- **Real-time WebSocket Notification System**: Complete socket.io implementation with user authentication and room management
- **Advanced Security Features**: Comprehensive 2FA (TOTP) and biometric authentication (WebAuthn) support
- **NotificationCenter Component**: Real-time notification display with toast alerts and unread count badges
- **SecuritySettings Component**: Full UI for managing 2FA, biometric authentication, and security status
- **Blockchain Integration Module**: Multi-network support (Ethereum, Polygon) with gas optimization and transaction monitoring
- **Database Schema Expansion**: Added notifications, userSecurity, blockchainTransactions, organizations tables
- **Security API Routes**: Complete 2FA setup, biometric registration, and security management endpoints
- **WebSocket Features**: Document subscriptions, workflow updates, security alerts, and real-time status changes
- **Gas Fee Optimization**: Smart contract integration with automatic network selection for cost efficiency
- **Enhanced Authentication**: Account lockout protection, password strength validation, and session security

### January 23, 2025 (External API Integration)
- **External API System**: Complete REST API for third-party integrations with comprehensive endpoints
- **API Key Management**: Secure API key generation, hashing, and rate limiting system
- **API Documentation Page**: Comprehensive developer documentation with interactive examples
- **API Routes**: Document management, signature requests, blockchain verification, and webhook support
- **Rate Limiting**: Request throttling with configurable limits and proper HTTP headers
- **Webhook System**: Event-driven notifications with HMAC signature verification
- **Developer Experience**: Multi-language SDK examples (JavaScript, Python, PHP, Go) and cURL commands
- **Authentication System**: API key-based authentication with proper error handling and security
- **Database Integration**: Added apiKeys and webhooks tables for external service management
- **API Endpoints**: RESTful design with proper HTTP status codes, pagination, and error responses

### January 23, 2025 (Documentation Update)
- **Comprehensive README**: Complete project documentation with setup instructions and architecture overview
- **Development Guide**: Detailed development environment setup and configuration
- **File Structure Documentation**: Complete project structure explanation with component descriptions
- **API Usage Examples**: Multi-language code examples and integration guides
- **Troubleshooting Guide**: Common issues and solutions for developers
- **Deployment Instructions**: Step-by-step deployment guide for Replit and other platforms