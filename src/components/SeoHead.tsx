import { useEffect } from 'react';
import { BUSINESS_INFO, BRAND_IMAGES } from '../data/content';

interface SeoProps {
  title?: string;
  description?: string;
  pagePath?: string;
}

export default function SeoHead({
  title = 'Bastanzi Premium Beef Co. | Luxury Ranch Beef Shares Montana',
  description = 'Reserve premium ranch-raised dry-aged beef shares from Bastanzi Beef Co. 100% pasture-raised Full, Half, Quarter & Eighth shares delivered nationwide.',
  pagePath = '/',
}: SeoProps) {
  useEffect(() => {
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: window.location.origin + BRAND_IMAGES.heroRanch },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: BUSINESS_INFO.name },
      { property: 'og:url', content: window.location.origin + pagePath },
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Inject LocalBusiness & Product JSON-LD Schema
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: BUSINESS_INFO.name,
      image: window.location.origin + BRAND_IMAGES.logo,
      email: BUSINESS_INFO.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_INFO.address,
        addressLocality: 'Bozeman',
        addressRegion: 'MT',
        postalCode: '59715',
        addressCountry: 'US',
      },
      priceRange: '$$$$',
      url: window.location.origin,
      description: description,
      offers: [
        {
          '@type': 'Offer',
          name: 'Full Beef Share',
          price: '3300.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Half Beef Share',
          price: '1650.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Quarter Beef Share',
          price: '850.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Eighth Beef Share',
          price: '450.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      ],
    };

    let schemaScript = document.getElementById('json-ld-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);
  }, [title, description, pagePath]);

  return null;
}
