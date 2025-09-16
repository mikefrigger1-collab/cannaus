import { PrismaClient } from '@prisma/client'
import CompaniesClient from './CompaniesClient'

const prisma = new PrismaClient()

// SEO Metadata Generation for Companies Directory
export async function generateMetadata() {
  // Get company statistics for metadata
  const totalCompanies = await prisma.article.count({
    where: { published: true, type: 'company' }
  })

  // Get state distribution for enhanced description
  const stateDistribution = await prisma.article.groupBy({
    by: ['category'],
    where: { published: true, type: 'company' },
    _count: { category: true }
  })

  const states = stateDistribution
    .filter(item => item.category)
    .sort((a, b) => b._count.category - a._count.category)
    .slice(0, 5)
    .map(item => {
      const stateNames = {
        'nsw': 'NSW',
        'vic': 'Victoria',
        'qld': 'Queensland',
        'wa': 'Western Australia',
        'sa': 'South Australia',
        'tas': 'Tasmania',
        'act': 'ACT',
        'nt': 'Northern Territory',
        'national': 'National',
        'international': 'International'
      }
      return stateNames[item.category] || item.category.toUpperCase()
    })

  const stateList = states.length > 0 ? states.join(', ') : 'all Australian states'

  return {
    title: `Cannabis Companies Directory Australia | ${totalCompanies}+ Companies | Cannaus`,
    description: `Discover Australia's leading cannabis companies directory. Browse ${totalCompanies}+ verified cannabis businesses across ${stateList}. Find medical clinics, research labs, cultivation, manufacturing, and more.`,
    keywords: `cannabis companies Australia, medical cannabis directory, hemp businesses, cannabis clinics, ${stateList}, cannabis industry directory, medical marijuana companies, CBD businesses, cannabis research, cultivation companies`,
    openGraph: {
      title: `Cannabis Companies Directory Australia | ${totalCompanies}+ Companies`,
      description: `Browse Australia's most comprehensive cannabis company directory with ${totalCompanies}+ verified businesses across medical, research, cultivation, and more.`,
      url: 'https://www.cannaus.com.au/companies',
      type: 'website',
      locale: 'en_AU',
      siteName: 'Cannaus',
      images: [{
        url: 'https://www.cannaus.com.au/images/logo/cannaus-companies-social.png',
        width: 1200,
        height: 630,
        alt: 'Cannabis Companies Directory Australia - Cannaus'
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Cannabis Companies Directory Australia | ${totalCompanies}+ Companies`,
      description: `Browse Australia's most comprehensive cannabis company directory with ${totalCompanies}+ verified businesses.`,
      images: ['https://www.cannaus.com.au/images/logo/cannaus-companies-social.png'],
      creator: '@cannaus',
      site: '@cannaus',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://www.cannaus.com.au/companies',
    },
    other: {
      'geo.region': 'AU',
      'geo.country': 'Australia',
      'business:contact_data:country_name': 'Australia',
      'article:section': 'Business Directory',
      'article:tag': `Cannabis Companies, Australia, Business Directory, Medical Cannabis, ${stateList}`,
      'directory:type': 'Business Directory',
      'directory:category': 'Cannabis Industry',
      'directory:region': 'Australia',
    },
  }
}

// Server Component - handles data fetching and metadata
export default async function CompaniesPage() {
  const companies = await prisma.article.findMany({
    where: { published: true, type: 'company' },
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      featuredImage: true,
      category: true,
      createdAt: true,
      updatedAt: true
    }
  })

  // Generate structured data for the companies directory
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Cannabis Companies Directory Australia",
    "description": `Australia's comprehensive cannabis companies directory featuring ${companies.length} verified businesses across medical, research, cultivation, manufacturing, and more.`,
    "url": "https://www.cannaus.com.au/companies",
    "publisher": {
      "@type": "Organization",
      "name": "Cannaus",
      "url": "https://www.cannaus.com.au",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.cannaus.com.au/images/logo/cannaus-logo.png",
        "width": 200,
        "height": 100
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Cannabis Companies",
      "description": "Directory of Australian cannabis companies",
      "numberOfItems": companies.length,
      "itemListElement": companies.slice(0, 20).map((company, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Organization",
          "name": company.title,
          "url": `https://www.cannaus.com.au/companies/${company.slug}`,
          "description": company.content.replace(/<[^>]*>/g, '').substring(0, 160),
          "address": {
            "@type": "PostalAddress",
            "addressRegion": company.category || "Australia",
            "addressCountry": "AU"
          },
          "industry": "Cannabis Industry"
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "WebPage",
            "name": "Home",
            "@id": "https://www.cannaus.com.au/"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "WebPage",
            "name": "Cannabis Companies Directory",
            "@id": "https://www.cannaus.com.au/companies"
          }
        }
      ]
    },
    "about": {
      "@type": "Thing",
      "name": "Cannabis Industry Australia",
      "description": "Australian cannabis industry business directory"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.cannaus.com.au/companies?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <CompaniesClient companies={companies} />
    </>
  )
}