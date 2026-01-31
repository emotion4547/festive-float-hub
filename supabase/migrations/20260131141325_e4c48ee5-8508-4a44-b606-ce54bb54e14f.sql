-- Create social_links table for managing messenger/social icons
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_header BOOLEAN DEFAULT true,
  show_in_footer BOOLEAN DEFAULT true,
  show_in_floating BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active social links"
ON public.social_links
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage social links"
ON public.social_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for social icons
INSERT INTO storage.buckets (id, name, public) VALUES ('social-icons', 'social-icons', true);

-- Storage policies
CREATE POLICY "Anyone can view social icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-icons');

CREATE POLICY "Admins can upload social icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-icons' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update social icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'social-icons' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete social icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-icons' AND has_role(auth.uid(), 'admin'::app_role));

-- Insert default social links
INSERT INTO public.social_links (name, url, icon_url, sort_order) VALUES
('WhatsApp', 'https://wa.me/79181790056', '/src/assets/whatsapp-icon.png', 1),
('Telegram', 'https://t.me/+79181790056', '/src/assets/telegram-icon.png', 2),
('VK', 'https://vk.com/radugaprazdnika', '/src/assets/vk-icon-new.png', 3);