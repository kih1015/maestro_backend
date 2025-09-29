# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `npm install` - Install dependencies
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start server in debug mode with hot reload
- `npm run build` - Build the application for production
- `npm run start:prod` - Start production server

### Code Quality

- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

### Database

This project uses Prisma with PostgreSQL. Key Prisma commands:

- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma studio` - Open Prisma Studio for database management

## Architecture Overview

### Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **File Processing**: Excel processing with xlsx library
- **Testing**: Jest for unit and e2e tests

### Project Structure

```
src/
├── admissions/          # University admission data management
├── auth/               # Authentication (JWT, login, password reset)
├── events/             # Event handling and WebSocket functionality
├── file-upload/        # Excel file upload and processing
├── prisma/             # Database service and configuration
├── score-calculation/  # Student score calculation and ranking
├── user/              # User management
├── app.module.ts       # Main application module
└── main.ts            # Application bootstrap
```

### Core Modules

1. **AdmissionsModule**: Manages university admission data including recruitment seasons, admission types, and recruitment units
2. **AuthModule**: Handles authentication with JWT strategy, login, and password reset functionality
3. **FileUploadModule**: Processes Excel file uploads for student data import
4. **ScoreCalculationModule**: Calculates student scores and rankings based on academic performance
5. **UserModule**: User account management and profile operations
6. **EventsModule**: WebSocket and event-driven functionality
7. **PrismaModule**: Global database service provider

### Database Schema

The database contains several key entities:

- `users` - System users with university association
- `recruitment_seasons` - Academic year and admission cycles
- `student_base_infos` - Core student demographic and academic data
- `subject_scores` - Individual subject grades and assessments
- `student_score_results` - Calculated final scores and rankings
- `subject_score_calculation_details` - Score conversion and calculation metadata

### API Configuration

- Base URL: `/api`
- CORS enabled for frontend (default: localhost:3001)
- Swagger documentation available at `/api/docs`
- Large file upload support (5GB limit)
- JWT Bearer authentication required for protected routes

### Development Notes

- Uses global validation pipes with class-transformer
- Prisma client is globally available across all modules
- TypeScript configuration allows flexible typing (noImplicitAny: false)
- ESLint configured with TypeScript and Prettier integration
