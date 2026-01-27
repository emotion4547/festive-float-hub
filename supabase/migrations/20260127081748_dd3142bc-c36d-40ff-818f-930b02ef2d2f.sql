-- Create collections table for holiday/themed collections
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection_products table for individual products in collections
CREATE TABLE public.collection_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

-- Create collection_categories table for entire categories in collections
CREATE TABLE public.collection_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, category_id)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for collections
CREATE POLICY "Anyone can view active collections" 
ON public.collections 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage collections" 
ON public.collections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for collection_products
CREATE POLICY "Anyone can view collection products" 
ON public.collection_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage collection products" 
ON public.collection_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for collection_categories
CREATE POLICY "Anyone can view collection categories" 
ON public.collection_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage collection categories" 
ON public.collection_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_collections_is_active ON public.collections(is_active);
CREATE INDEX idx_collections_dates ON public.collections(start_date, end_date);
CREATE INDEX idx_collection_products_collection ON public.collection_products(collection_id);
CREATE INDEX idx_collection_categories_collection ON public.collection_categories(collection_id);