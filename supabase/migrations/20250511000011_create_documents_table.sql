-- Migration: Create Documents Table
-- Description: Store document information processed by Spendify Guru

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL, -- bank_statement, credit_card, invoice, etc.
    bank_name VARCHAR(255),
    account_number VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    original_filename VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, processed, failed
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    statement_date DATE,
    statement_start_date DATE,
    statement_end_date DATE,
    total_debit DECIMAL(12,2),
    total_credit DECIMAL(12,2),
    total_balance DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document transactions
CREATE TABLE IF NOT EXISTS public.document_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- debit, credit
    category VARCHAR(100),
    sub_category VARCHAR(100),
    notes TEXT,
    reference_number VARCHAR(255),
    balance DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document analyses
CREATE TABLE IF NOT EXISTS public.document_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    analysis_type VARCHAR(50) NOT NULL, -- summary, category_breakdown, trend_analysis, etc.
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    is_saved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY documents_user_policy ON public.documents
    FOR ALL
    USING (auth.uid() = user_id);

-- Users can view transactions for their own documents
CREATE POLICY document_transactions_user_policy ON public.document_transactions
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.documents
        WHERE documents.id = document_transactions.document_id
        AND documents.user_id = auth.uid()
    ));

-- Users can view analyses for their own documents
CREATE POLICY document_analyses_user_policy ON public.document_analyses
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.documents
        WHERE documents.id = document_analyses.document_id
        AND documents.user_id = auth.uid()
    ));

-- Admin policies
CREATE POLICY documents_admin_policy ON public.documents
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_documents' OR permission = 'view_documents'
    ));

CREATE POLICY document_transactions_admin_policy ON public.document_transactions
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_documents' OR permission = 'view_documents'
    ));

CREATE POLICY document_analyses_admin_policy ON public.document_analyses
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_documents' OR permission = 'view_documents'
    ));

-- Triggers for updated_at
CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_document_transactions_timestamp
BEFORE UPDATE ON public.document_transactions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_document_analyses_timestamp
BEFORE UPDATE ON public.document_analyses
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Comments
COMMENT ON TABLE public.documents IS 'Stores document information processed by Spendify Guru';
COMMENT ON COLUMN public.documents.document_type IS 'Type of document (bank statement, credit card, invoice)';
COMMENT ON COLUMN public.documents.status IS 'Processing status of the document';
COMMENT ON COLUMN public.documents.statement_date IS 'Date of the statement';
COMMENT ON COLUMN public.documents.total_debit IS 'Sum of all debits in the statement';
COMMENT ON COLUMN public.documents.total_credit IS 'Sum of all credits in the statement';

COMMENT ON TABLE public.document_transactions IS 'Transactions extracted from processed documents';
COMMENT ON COLUMN public.document_transactions.transaction_type IS 'Type of transaction (debit or credit)';
COMMENT ON COLUMN public.document_transactions.category IS 'Transaction category (food, utilities, etc.)';

COMMENT ON TABLE public.document_analyses IS 'Analysis results for processed documents';
COMMENT ON COLUMN public.document_analyses.analysis_type IS 'Type of analysis performed';
COMMENT ON COLUMN public.document_analyses.content IS 'JSON content of the analysis results';
