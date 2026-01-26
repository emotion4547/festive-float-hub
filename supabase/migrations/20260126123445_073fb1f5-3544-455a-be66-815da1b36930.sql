-- Add user wheel spins tracking table
CREATE TABLE public.user_wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  segment_id UUID REFERENCES public.wheel_segments(id) ON DELETE SET NULL,
  spun_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  coupon_id UUID REFERENCES public.user_coupons(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.user_wheel_spins ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all spins"
  ON public.user_wheel_spins FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own spins"
  ON public.user_wheel_spins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own spins"
  ON public.user_wheel_spins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add gift support to wheel_segments
ALTER TABLE public.wheel_segments
  ADD COLUMN prize_type TEXT NOT NULL DEFAULT 'discount',
  ADD COLUMN gift_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Add gift support to user_coupons
ALTER TABLE public.user_coupons
  ADD COLUMN prize_type TEXT NOT NULL DEFAULT 'discount',
  ADD COLUMN gift_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN gift_product_name TEXT,
  ADD COLUMN gift_product_image TEXT;

-- Add pending wheel spins for unregistered users (stored temporarily)
CREATE TABLE public.pending_wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  segment_id UUID REFERENCES public.wheel_segments(id) ON DELETE CASCADE NOT NULL,
  prize_type TEXT NOT NULL,
  discount_type TEXT,
  discount_value NUMERIC,
  gift_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS for pending spins
ALTER TABLE public.pending_wheel_spins ENABLE ROW LEVEL SECURITY;

-- Anyone can create pending spins (anonymous users)
CREATE POLICY "Anyone can create pending spins"
  ON public.pending_wheel_spins FOR INSERT
  WITH CHECK (true);

-- Anyone can view pending spins by session_id
CREATE POLICY "Anyone can view pending spins"
  ON public.pending_wheel_spins FOR SELECT
  USING (true);

-- Anyone can delete own pending spins
CREATE POLICY "Anyone can delete pending spins"
  ON public.pending_wheel_spins FOR DELETE
  USING (true);

-- Admins can manage all pending spins
CREATE POLICY "Admins can manage pending spins"
  ON public.pending_wheel_spins FOR ALL
  USING (has_role(auth.uid(), 'admin'));