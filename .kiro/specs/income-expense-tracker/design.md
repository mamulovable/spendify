# Design Document

## Overview

The Income and Expense Tracker is a comprehensive financial management feature that integrates seamlessly with the existing SpendlyAI application. It provides users with multiple ways to track their financial transactions including manual entry, AI-powered receipt scanning, and automated categorization. The system leverages the existing Supabase database, Google Gemini AI integration, and shadcn/ui component library to deliver a consistent user experience.

The feature consists of four main pages: Dashboard (overview), Income, Expenses, and Reports, each designed to provide specific functionality while maintaining the established design patterns from the uploaded dashboard mockup.

## Architecture

### System Architecture
The feature follows the existing application architecture with clear separation of concerns:

- **Frontend**: React components with TypeScript
- **State Management**: React Context API + React Query for server state
- **Database**: Supabase PostgreSQL with Row Level Security
- **AI Processing**: Google Gemini AI via existing proxy service
- **OCR**: Tesseract.js for receipt text extraction
- **UI Components**: shadcn/ui with Tailwind CSS

### Data Flow
1. **Manual Entry**: User input → Form validation → Database storage → UI update
2. **Receipt Scanning**: Image upload → OCR processing → AI extraction → User verification → Database storage
3. **Reporting**: Database query → Data aggregation → Chart rendering → Export functionality

## Components and Interfaces

### Core Data Types

```typescript
// Core transaction interface
export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  merchant?: string;
  date: string;
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
  receipt_url?: string;
  ai_extracted?: boolean;
  ai_confidence?: number;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Category management
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  is_default: boolean;
  user_id?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  icon?: string;
}

// Budget tracking
export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  spent_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// AI receipt processing
export interface ReceiptProcessingResult {
  success: boolean;
  extracted_data: {
    merchant: string;
    amount: number;
    date: string;
    items?: ReceiptItem[];
    tax_amount?: number;
    tip_amount?: number;
  };
  confidence_score: number;
  raw_text: string;
  processing_time: number;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category_suggestion?: string;
}
```

### Page Components

#### 1. Dashboard Page (`/dashboard/finance`)
```typescript
// Main dashboard component showing financial overview
export const FinanceDashboard: React.FC = () => {
  // Displays monthly spending, income totals, trends, and quick actions
  // Matches the uploaded dashboard design with cards and charts
};

// Key sub-components:
- MonthlySpendingCard
- MonthlyBudgetCard  
- SpendingTrendsChart
- CategoryBreakdownChart
- RecentTransactionsList
- UpcomingPaymentsList
- QuickActionButtons
```

#### 2. Income Page (`/dashboard/income`)
```typescript
// Income tracking and management
export const IncomePage: React.FC = () => {
  // Lists all income entries with filtering, sorting, and add functionality
};

// Key sub-components:
- IncomeForm (modal/drawer for adding income)
- IncomeList (table with pagination)
- IncomeFilters (date range, category, amount filters)
- IncomeStats (total income, average, trends)
```

#### 3. Expenses Page (`/dashboard/expenses`)
```typescript
// Expense tracking with manual entry and receipt scanning
export const ExpensesPage: React.FC = () => {
  // Lists all expenses with multiple input methods
};

// Key sub-components:
- ExpenseForm (manual entry form)
- ReceiptScanner (camera/upload interface)
- ExpenseList (table with advanced filtering)
- ExpenseFilters (comprehensive filtering options)
- ExpenseStats (spending analytics)
```

#### 4. Reports Page (`/dashboard/reports`)
```typescript
// Comprehensive financial reporting and analytics
export const ReportsPage: React.FC = () => {
  // Advanced charts, insights, and export functionality
};

// Key sub-components:
- ReportFilters (date range, categories, report types)
- SpendingTrendsChart (line chart over time)
- CategoryBreakdownChart (pie/donut chart)
- IncomeVsExpenseChart (comparison chart)
- MonthlyComparisonChart (bar chart)
- ExportButton (CSV, PDF export)
- AIInsightsPanel (AI-generated insights)
```

### Service Layer

#### Transaction Service
```typescript
export const transactionService = {
  // CRUD operations for transactions
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction>;
  async getTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  async deleteTransaction(id: string): Promise<void>;
  
  // Analytics and aggregation
  async getMonthlyTotals(userId: string, year: number): Promise<MonthlyTotals>;
  async getCategoryBreakdown(userId: string, dateRange: DateRange): Promise<CategoryBreakdown[]>;
  async getSpendingTrends(userId: string, period: string): Promise<TrendData[]>;
};
```

#### Receipt Processing Service
```typescript
export const receiptProcessingService = {
  // OCR and AI processing
  async processReceiptImage(imageFile: File): Promise<ReceiptProcessingResult>;
  async extractTextFromImage(imageFile: File): Promise<string>;
  async parseReceiptData(rawText: string): Promise<ReceiptProcessingResult>;
  
  // Image handling
  async uploadReceiptImage(file: File, userId: string): Promise<string>;
  async optimizeImageForOCR(file: File): Promise<File>;
};
```

#### Category Service
```typescript
export const categoryService = {
  // Category management
  async getCategories(userId: string, type?: 'income' | 'expense'): Promise<Category[]>;
  async createCategory(category: Omit<Category, 'id'>): Promise<Category>;
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  async deleteCategory(id: string): Promise<void>;
  
  // AI-powered categorization
  async suggestCategory(description: string, amount: number): Promise<string>;
  async bulkCategorizeTransactions(transactions: Transaction[]): Promise<Transaction[]>;
};
```

## Data Models

### Database Schema

```sql
-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  merchant VARCHAR(200),
  date DATE NOT NULL,
  payment_method VARCHAR(50),
  receipt_url TEXT,
  ai_extracted BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(3,2),
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  icon VARCHAR(50),
  color VARCHAR(7),
  is_default BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipt processing logs
CREATE TABLE receipt_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  extracted_text TEXT,
  confidence_score DECIMAL(3,2),
  processing_time INTEGER,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security Policies

```sql
-- Transactions RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Categories RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access default categories and their own" ON categories
  FOR ALL USING (is_default = TRUE OR auth.uid() = user_id);

-- Budgets RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);
```

## Error Handling

### Client-Side Error Handling
- Form validation with Zod schemas
- Network error handling with retry logic
- User-friendly error messages with toast notifications
- Graceful degradation for AI features when API is unavailable

### Server-Side Error Handling
- Database constraint validation
- File upload size and type validation
- Rate limiting for AI processing requests
- Comprehensive error logging

### AI Processing Error Handling
- Fallback to manual entry when OCR fails
- Confidence score thresholds for auto-acceptance
- User verification step for low-confidence extractions
- Retry mechanisms for transient AI API failures

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Service layer testing with Jest
- Utility function testing
- Form validation testing

### Integration Testing
- API endpoint testing
- Database operation testing
- File upload and processing testing
- Authentication flow testing

### End-to-End Testing
- Complete user workflows with Playwright
- Receipt scanning flow testing
- Multi-page navigation testing
- Data persistence testing

### Performance Testing
- Large dataset handling
- Image processing performance
- Chart rendering performance
- Database query optimization

## Security Considerations

### Data Protection
- All financial data encrypted at rest
- Secure file upload with virus scanning
- Receipt images stored with access controls
- PII data handling compliance

### Authentication & Authorization
- Row Level Security for all financial data
- API rate limiting per user
- Secure session management
- Admin access controls for sensitive operations

### Input Validation
- Server-side validation for all inputs
- File type and size restrictions
- SQL injection prevention
- XSS protection for user-generated content

## Performance Optimization

### Frontend Optimization
- React.memo for expensive components
- useMemo for complex calculations
- Lazy loading for chart components
- Virtual scrolling for large transaction lists

### Backend Optimization
- Database indexing for common queries
- Query optimization for aggregations
- Caching for category and budget data
- Batch processing for bulk operations

### Image Processing Optimization
- Client-side image compression
- Optimized OCR processing pipeline
- Async processing for large files
- Progress indicators for long operations

## Accessibility

### WCAG Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modals

### Usability Features
- Clear error messages
- Loading states for all async operations
- Responsive design for mobile devices
- Intuitive navigation patterns