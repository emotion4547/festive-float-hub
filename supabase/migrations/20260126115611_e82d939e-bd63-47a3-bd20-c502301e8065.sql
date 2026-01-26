-- Create callback_requests table
CREATE TABLE public.callback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create callback requests
CREATE POLICY "Anyone can create callback requests"
ON public.callback_requests
FOR INSERT
WITH CHECK (true);

-- Admins can manage all callback requests
CREATE POLICY "Admins can manage callback requests"
ON public.callback_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'));