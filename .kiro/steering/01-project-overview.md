# Project Overview - SpendlyAI

## Application Purpose
SpendlyAI is a comprehensive financial management and expense tracking application built with React, TypeScript, and modern web technologies. The application provides users with intelligent financial insights, budget management, expense tracking, and AI-powered financial advisory features.

## Core Features
- **Expense Tracking**: Upload and analyze bank statements, receipts, and financial documents
- **AI Financial Advisor**: Powered by Google Gemini AI for personalized financial advice
- **Budget Management**: Create, track, and manage budgets with real-time analytics
- **Advanced Analytics**: Comprehensive financial reporting and trend analysis
- **Document Processing**: OCR and PDF processing for automated expense categorization
- **Subscription Management**: Tiered pricing with feature gates
- **Admin Dashboard**: Complete administrative interface for user and subscription management

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI components
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API + React Query
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini AI
- **Charts**: ECharts + Recharts
- **File Processing**: PDF.js, Tesseract.js for OCR
- **Payment**: Paystack integration

## Project Structure
- `/src/pages/` - Main application pages and routes
- `/src/components/` - Reusable UI components
- `/src/contexts/` - React Context providers for state management
- `/src/hooks/` - Custom React hooks
- `/src/services/` - API services and business logic
- `/src/lib/` - Utility functions and configurations
- `/src/types/` - TypeScript type definitions
- `/sql/` - Database schema and migration files