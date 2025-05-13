-- Migration: Create tables for Advanced Analysis (used by src/pages/AdvancedAnalysis.tsx)

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color text,
    icon text,
    is_income boolean DEFAULT false,
    is_custom boolean DEFAULT false,
    budget_amount numeric,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- 2. Spending Patterns Table
CREATE TABLE IF NOT EXISTS spending_patterns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    amount numeric NOT NULL,
    frequency text,
    transactions uuid[] DEFAULT '{}',
    confidence_score numeric,
    type text,
    first_occurrence date,
    last_occurrence date,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_spending_patterns_user_id ON spending_patterns(user_id);

-- 3. Financial Predictions Table
CREATE TABLE IF NOT EXISTS financial_predictions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('spending', 'income', 'savings', 'budget')),
    category_id uuid REFERENCES categories(id),
    description text,
    amount numeric NOT NULL,
    date date NOT NULL,
    confidence_score numeric,
    factors text[],
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_financial_predictions_user_id ON financial_predictions(user_id);

-- 4. Transaction Anomalies Table
CREATE TABLE IF NOT EXISTS transaction_anomalies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('unusual_amount', 'unusual_merchant', 'unusual_timing', 'potential_fraud')),
    description text,
    severity text CHECK (severity IN ('low', 'medium', 'high')),
    detected_at timestamptz NOT NULL DEFAULT now(),
    status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'false_positive')),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_transaction_anomalies_user_id ON transaction_anomalies(user_id);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    description text,
    amount numeric NOT NULL,
    category_id uuid REFERENCES categories(id),
    is_recurring boolean DEFAULT false,
    is_anomaly boolean DEFAULT false,
    confidence_score numeric,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
