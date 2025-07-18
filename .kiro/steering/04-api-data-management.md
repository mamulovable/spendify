# API & Data Management Guidelines

## Supabase Integration
- **Client Configuration**: Use the configured Supabase client from `@/lib/supabase.ts`
- **Authentication**: Leverage Supabase Auth for user management
- **Real-time**: Use Supabase real-time subscriptions for live data updates
- **Row Level Security**: Implement proper RLS policies for data security
- **Database Types**: Use generated TypeScript types from Supabase

## API Service Architecture
- **Service Layer**: Centralize API calls in service files (`/src/services/`)
- **Error Handling**: Consistent error handling across all API calls
- **Type Safety**: Use TypeScript interfaces for all API responses
- **Caching**: Implement React Query for intelligent caching
- **Loading States**: Provide loading indicators for async operations

## Data Flow Patterns
```typescript
// Service Layer Example
export const financialGoalsService = {
  async getGoals(userId: string): Promise<FinancialGoal[]> {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data || [];
  }
};

// Hook Usage
export const useFinancialGoals = (userId: string) => {
  return useQuery({
    queryKey: ['financial-goals', userId],
    queryFn: () => financialGoalsService.getGoals(userId),
    enabled: !!userId
  });
};
```

## External API Integrations
- **Google Gemini AI**: Use proxy service for AI interactions
- **Paystack**: Payment processing with proper error handling
- **OCR Services**: Tesseract.js for receipt text extraction
- **PDF Processing**: PDF.js for document parsing

## Data Validation
- **Zod Schemas**: Use Zod for runtime type validation
- **Form Validation**: Integrate with react-hook-form
- **API Response Validation**: Validate all external API responses
- **Input Sanitization**: Sanitize user inputs before processing

## State Management Best Practices
- **Context Providers**: Use for global application state
- **React Query**: For server state and caching
- **Local Storage**: Use Dexie for offline data persistence
- **Session Management**: Handle authentication state properly

## Error Handling Strategy
- **Global Error Boundary**: Catch and handle React errors
- **API Error Handling**: Consistent error response format
- **User Feedback**: Show meaningful error messages to users
- **Logging**: Implement proper error logging for debugging