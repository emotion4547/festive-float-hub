/**
 * SEO Schema.org structured data generators
 * For rich search results and better indexing
 */

const BASE_URL = 'https://radugaprazdnika.ru';

interface ProductSchema {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  images?: string[] | null;
  rating?: number | null;
  reviewsCount?: number | null;
  inStock?: boolean;
  categoryName?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ReviewSchema {
  author: string;
  rating: number;
  content: string;
  datePublished: string;
}

/**
 * Generate Product schema for product pages
 */
export function generateProductSchema(product: ProductSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/product/${product.id}`,
    name: product.name,
    description: product.description || `${product.name} - купить в магазине Радуга Праздника с доставкой по Краснодару`,
    image: product.images?.[0] || `${BASE_URL}/placeholder.svg`,
    url: `${BASE_URL}/product/${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Радуга Праздника',
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/product/${product.id}`,
      priceCurrency: 'RUB',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: 'Радуга Праздника',
      },
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewsCount || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Радуга Праздника',
    alternateName: 'Raduga Prazdnika',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/assets/logo.png`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+7 (918) 179-00-56',
      contactType: 'customer service',
      areaServed: 'RU-KDA',
      availableLanguage: 'Russian',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Российская 72/1 к1, Торговая галерея Опера',
      addressLocality: 'Краснодар',
      addressRegion: 'Краснодарский край',
      postalCode: '350000',
      addressCountry: 'RU',
    },
    sameAs: [
      'https://vk.com/radugaprazdnika',
      'https://www.instagram.com/radugaprazdnika',
      'https://t.me/+79181790056',
    ],
  };
}

/**
 * Generate LocalBusiness schema with extended info
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#localbusiness`,
    name: 'Радуга Праздника',
    description: 'Магазин воздушных шаров в Краснодаре. Более 1000 композиций на любой праздник. Доставка от 2 часов.',
    url: BASE_URL,
    telephone: '+7 (918) 179-00-56',
    email: 'info@radugaprazdnika.ru',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=630&fit=crop',
    priceRange: '₽₽',
    currenciesAccepted: 'RUB',
    paymentAccepted: 'Наличные, Банковские карты, Безналичный расчёт',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Российская 72/1 к1, Торговая галерея Опера',
      addressLocality: 'Краснодар',
      addressRegion: 'Краснодарский край',
      postalCode: '350000',
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 45.052788,
      longitude: 39.017834,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Каталог воздушных шаров',
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Наборы шаров' },
        { '@type': 'OfferCatalog', name: 'Фольгированные шары' },
        { '@type': 'OfferCatalog', name: 'Шары с гелием' },
        { '@type': 'OfferCatalog', name: 'Оформление праздников' },
      ],
    },
    areaServed: {
      '@type': 'City',
      name: 'Краснодар',
    },
  };
}

/**
 * Generate ItemList schema for category pages
 */
export function generateItemListSchema(
  name: string,
  items: Array<{ id: string; name: string; price: number; image?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        '@id': `${BASE_URL}/product/${item.id}`,
        name: item.name,
        image: item.image,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'RUB',
          price: item.price,
        },
      },
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: 'Радуга Праздника',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/catalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'ru-RU',
  };
}
