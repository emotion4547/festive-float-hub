-- Add video fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS live_cover_url text,
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT NULL;

-- Create storage bucket for product videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product videos
CREATE POLICY "Anyone can view product videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-videos');

CREATE POLICY "Admins can upload product videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-videos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-videos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-videos' AND has_role(auth.uid(), 'admin'));