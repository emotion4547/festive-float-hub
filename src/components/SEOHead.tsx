import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  structuredData?: object;
}

export function SEOHead({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = "website",
  ogImage = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=630&fit=crop",
  structuredData,
}: SEOHeadProps) {
  const fullTitle = `${title} | Радуга Праздника — Воздушные шары Краснодар`;
  const baseUrl = "https://radugaprazdnika.ru";
  const canonicalUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="Радуга Праздника" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
