import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const BASE_URL = "https://radugaprazdnika.ru";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Получаем все товары
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, updated_at")
      .eq("in_stock", true)
      .order("updated_at", { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Получаем все опубликованные новости
    const { data: news, error: newsError } = await supabase
      .from("news")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    if (newsError) {
      console.error("Error fetching news:", newsError);
    }

    // Получаем активные коллекции
    const { data: collections, error: collectionsError } = await supabase
      .from("collections")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (collectionsError) {
      console.error("Error fetching collections:", collectionsError);
    }

    // Получаем категории
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, created_at");

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
    }

    // Генерируем XML
    const now = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Главная страница -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Каталог -->
  <url>
    <loc>${BASE_URL}/catalog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Информационные страницы -->
  <url>
    <loc>${BASE_URL}/delivery</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/payment</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contacts</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about/details</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about/partners</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/printing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/corporate</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/warranty</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/reviews</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/news</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/offer</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/mailing-consent</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

    // Добавляем категории
    if (categories && categories.length > 0) {
      xml += `\n\n  <!-- Категории -->`;
      for (const category of categories) {
        xml += `
  <url>
    <loc>${BASE_URL}/catalog?category=${category.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Добавляем товары
    if (products && products.length > 0) {
      xml += `\n\n  <!-- Товары (${products.length} шт.) -->`;
      for (const product of products) {
        const lastmod = product.updated_at
          ? new Date(product.updated_at).toISOString().split("T")[0]
          : now;
        xml += `
  <url>
    <loc>${BASE_URL}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    // Добавляем новости
    if (news && news.length > 0) {
      xml += `\n\n  <!-- Новости (${news.length} шт.) -->`;
      for (const article of news) {
        const lastmod = article.updated_at
          ? new Date(article.updated_at).toISOString().split("T")[0]
          : now;
        xml += `
  <url>
    <loc>${BASE_URL}/news/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    // Добавляем коллекции
    if (collections && collections.length > 0) {
      xml += `\n\n  <!-- Коллекции (${collections.length} шт.) -->`;
      for (const collection of collections) {
        const lastmod = collection.updated_at
          ? new Date(collection.updated_at).toISOString().split("T")[0]
          : now;
        xml += `
  <url>
    <loc>${BASE_URL}/collection/${collection.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    xml += `\n</urlset>`;

    console.log(
      `Sitemap generated: ${products?.length || 0} products, ${news?.length || 0} news, ${collections?.length || 0} collections, ${categories?.length || 0} categories`
    );

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    console.error("Sitemap generation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(`Error generating sitemap: ${errorMessage}`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
