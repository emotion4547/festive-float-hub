-- Table for wheel segments (configurable prizes)
CREATE TABLE public.wheel_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL,
  probability INTEGER NOT NULL DEFAULT 10, -- weight for random selection
  color TEXT NOT NULL DEFAULT '#FF6B6B',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user-won coupons
CREATE TABLE public.user_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  order_id UUID REFERENCES public.orders(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wheel_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

-- Wheel segments policies
CREATE POLICY "Anyone can view active wheel segments" 
ON public.wheel_segments 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage wheel segments" 
ON public.wheel_segments 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- User coupons policies
CREATE POLICY "Users can view own coupons" 
ON public.user_coupons 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coupons" 
ON public.user_coupons 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons" 
ON public.user_coupons 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all coupons" 
ON public.user_coupons 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default wheel segments
INSERT INTO public.wheel_segments (label, discount_type, discount_value, probability, color, sort_order) VALUES
('5%', 'percentage', 5, 30, '#FF6B6B', 1),
('10%', 'percentage', 10, 25, '#4ECDC4', 2),
('15%', 'percentage', 15, 20, '#45B7D1', 3),
('200₽', 'fixed', 200, 15, '#96CEB4', 4),
('500₽', 'fixed', 500, 7, '#FFEAA7', 5),
('20%', 'percentage', 20, 3, '#DDA0DD', 6);