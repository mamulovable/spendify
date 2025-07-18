# Development Standards & Best Practices

## Code Quality Standards
- **TypeScript**: Use strict TypeScript with proper type definitions
- **ESLint**: Follow the configured ESLint rules for code consistency
- **Component Structure**: Use functional components with hooks
- **Error Handling**: Implement proper error boundaries and try-catch blocks
- **Performance**: Use React.memo, useMemo, and useCallback for optimization

## File Naming Conventions
- **Components**: PascalCase (e.g., `UserDashboard.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useFinancialData.ts`)
- **Services**: camelCase ending with "Service" (e.g., `geminiService.ts`)
- **Types**: PascalCase for interfaces (e.g., `UserProfile`, `TransactionData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

## Component Architecture
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Define TypeScript interfaces for all component props
- **Default Props**: Use default parameters instead of defaultProps
- **Composition**: Prefer composition over inheritance
- **Custom Hooks**: Extract complex logic into reusable custom hooks

## State Management
- **Context API**: Use for global state (Auth, Admin, Subscription, Statement)
- **Local State**: Use useState for component-specific state
- **React Query**: Use for server state management and caching
- **Form State**: Use react-hook-form with Zod validation

## Import Organization
```typescript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal components and hooks
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 3. Services and utilities
import { geminiService } from '@/services/geminiService';
import { cn } from '@/lib/utils';

// 4. Types
import type { UserProfile } from '@/types/auth';
```