# Security & Performance Guidelines

## Security Best Practices
- **Environment Variables**: Store sensitive data in `.env` files, never commit secrets
- **Authentication**: Use Supabase Auth with proper session management
- **Authorization**: Implement role-based access control (RBAC)
- **Data Sanitization**: Sanitize all user inputs before processing
- **HTTPS Only**: Ensure all API calls use HTTPS in production
- **Content Security Policy**: Implement CSP headers for XSS protection

## Authentication & Authorization
```typescript
// Protected Route Pattern
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// Admin Route Protection
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};
```

## Data Privacy & Compliance
- **PII Protection**: Encrypt sensitive personal information
- **Data Retention**: Implement proper data cleanup policies
- **User Consent**: Handle user data consent properly
- **GDPR Compliance**: Provide data export and deletion capabilities
- **Audit Logging**: Track admin actions and data access

## Performance Optimization
- **Code Splitting**: Use React.lazy() for route-based code splitting
- **Bundle Optimization**: Minimize bundle size with proper imports
- **Image Optimization**: Compress and optimize images
- **Caching Strategy**: Implement proper caching with React Query
- **Lazy Loading**: Load components and data on demand

## React Performance Patterns
```typescript
// Memoization for expensive calculations
const ExpensiveComponent = React.memo(({ data }: { data: TransactionData[] }) => {
  const processedData = useMemo(() => {
    return data.map(transaction => ({
      ...transaction,
      formattedAmount: formatCurrency(transaction.amount)
    }));
  }, [data]);

  return <div>{/* Component content */}</div>;
});

// Callback memoization for event handlers
const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  const handleTransactionClick = useCallback((id: string) => {
    // Handle click logic
  }, []);

  return (
    <div>
      {transactions.map(transaction => (
        <TransactionItem 
          key={transaction.id}
          transaction={transaction}
          onClick={handleTransactionClick}
        />
      ))}
    </div>
  );
};
```

## Database Performance
- **Query Optimization**: Use proper indexes and query patterns
- **Connection Pooling**: Leverage Supabase connection pooling
- **Batch Operations**: Group related database operations
- **Real-time Subscriptions**: Use selectively to avoid performance issues
- **Data Pagination**: Implement proper pagination for large datasets

## Monitoring & Analytics
- **Error Tracking**: Implement error monitoring and reporting
- **Performance Metrics**: Track Core Web Vitals and user interactions
- **API Monitoring**: Monitor API response times and error rates
- **User Analytics**: Track user behavior and feature usage
- **Admin Dashboards**: Provide comprehensive admin analytics