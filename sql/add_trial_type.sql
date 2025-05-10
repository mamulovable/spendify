-- Add trial_type and card_added columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS trial_type VARCHAR(20) CHECK (trial_type IN ('seven_day', 'thirty_day')),
ADD COLUMN IF NOT EXISTS card_added BOOLEAN DEFAULT false;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for own subscription trial info" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable update for own subscription trial info" ON public.subscriptions;

-- Create new policies
CREATE POLICY "Enable read access for own subscription trial info" 
ON public.subscriptions
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own subscription trial info"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
