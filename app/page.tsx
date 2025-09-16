import { PrismaClient } from '@prisma/client'
import MainLayout from '../components/MainLayout'
import HomeClient from '../components/HomeClient'

const prisma = new PrismaClient()

// SEO Metadata Generation for Homepage
export async function generateMetadata() {
  // Get statistics for dynamic metadata
  const totalArticles = await prisma.article.count({
    where: { published: true, type: 'post' }
  })

  const totalCompanies = await prisma.article.count({
    where: { published: true, type: 'company' }
  })

  // Get category distribution for enhanced description
  const categoryStats = await prisma.article.groupBy({
    by: ['category'],
    where: { published: true, type: 'post' },
    _count: { category: true }
  })

  // Get most recent article for freshness
  const latestArticle = await prisma.article.findFirst({
    where: { published: true, type: 'post' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, title: true }
  })

  return {
    title: "Cannaus | Australian Cannabis News & Industry Directory | Latest Updates",
    description: `Australia's trusted source for cannabis news, industry insights, and comprehensive business directory. ${totalArticles}+ articles covering medical cannabis, hemp, legislation, and industry developments across all states. Find ${totalCompanies}+ verified cannabis companies.`,
    keywords: "cannabis news Australia, medical cannabis, hemp industry, cannabis legislation, Australian cannabis companies, CBD news, cannabis regulation, medical marijuana, hemp news, cannabis industry Australia",
    openGraph: {
      title: "Cannaus | Australian Cannabis News & Industry Hub",
      description: `Australia's most comprehensive cannabis news platform with ${totalArticles}+ articles and ${totalCompanies}+ company profiles. Stay informed on medical cannabis, hemp industry, and legislation updates.`,
      url: "https://www.cannaus.com.au",
      type: "website",
      locale: "en_AU",
      siteName: "Cannaus",
      images: [{
        url: "https://www.cannaus.com.au/images/logo/www.cannaus-social-home.png",
        width: 1200,
        height: 630,
        alt: "Cannaus - Australian Cannabis News & Industry Directory"
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cannaus | Australian Cannabis News & Industry Hub",
      description: `Australia's trusted cannabis news source with ${totalArticles}+ articles and ${totalCompanies}+ company profiles.`,
      images: ["https://www.cannaus.com.au/images/logo/www.cannaus-logo.png"],
      creator: "@cannaus",
      site: "@cannaus",
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
      canonical: "https://www.cannaus.com.au",
      languages: {
        'en-AU': 'https://www.cannaus.com.au',
      },
    },
    other: {
      'geo.region': 'AU',
      'geo.country': 'Australia',
      'geo.placename': 'Australia',
      'article:publisher': 'https://www.cannaus.com.au',
      'article:author': 'Mike Frigger',
      'news:keywords': 'cannabis, medical cannabis, hemp, Australia, news, legislation',
      'website:type': 'News Website',
      'website:category': 'Cannabis Industry News',
      'website:region': 'Australia',
    },
    // Add freshness indicator if we have recent content
    ...(latestArticle && {
      lastModified: latestArticle.createdAt,
    }),
  }
}

export default async function Home() {
  // Get latest articles for hero section
  const latestArticles = await prisma.article.findMany({
    where: { published: true, type: 'post' },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  // Get featured articles (for now, just the next 5 after latest)
  const featuredArticles = await prisma.article.findMany({
    where: { 
      published: true, 
      type: 'post',
      NOT: { id: { in: latestArticles.map(a => a.id) } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  // Get more articles for the list section
  const listArticles = await prisma.article.findMany({
    where: { 
      published: true, 
      type: 'post',
      NOT: { 
        id: { 
          in: [...latestArticles.map(a => a.id), ...featuredArticles.map(a => a.id)] 
        } 
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  // Get category counts
  const categoryStats = await prisma.article.groupBy({
    by: ['category'],
    where: { published: true, type: 'post' },
    _count: { category: true }
  })
  
  const companies = await prisma.article.findMany({
    where: { published: true, type: 'company' },
    orderBy: { title: 'asc' },
    take: 6
  })

  // Configure header for homepage
  const headerProps = {
    showLogo: true,
    showNavigation: true,
    showSubtitle: true,
    categoryStats: categoryStats
  }

  // IDs to exclude from load more
  const excludeIds = [
    ...latestArticles.map(a => a.id),
    ...featuredArticles.map(a => a.id),
    ...listArticles.map(a => a.id)
  ]

  // Serialize data for client component
  const homeData = {
    latestArticles: latestArticles.map(article => ({
      ...article,
      createdAt: article.createdAt.toISOString()
    })),
    featuredArticles: featuredArticles.map(article => ({
      ...article,
      createdAt: article.createdAt.toISOString()
    })),
    listArticles: listArticles.map(article => ({
      ...article,
      createdAt: article.createdAt.toISOString()
    })),
    companies: companies.map(company => ({
      ...company,
      createdAt: company.createdAt.toISOString()
    })),
    excludeIds
  }

  // Generate comprehensive structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.cannaus.com.au/#website",
        "url": "https://www.cannaus.com.au/",
        "name": "Cannaus",
        "description": "Australia's trusted source for cannabis news, industry insights, and comprehensive business directory",
        "publisher": {
          "@id": "https://www.cannaus.com.au/"
        },
        "inLanguage": "en-AU",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.cannaus.com.au/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://www.cannaus.com.au/",
        "name": "Cannaus",
        "url": "https://www.cannaus.com.au/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.cannaus.com.au/images/logo/www.cannaus-logo.png",
          "width": 200,
          "height": 100,
          "caption": "Cannaus Logo"
        },
        "foundingDate": "2024",
        "description": "Australia's comprehensive cannabis industry news and business directory platform",
        "knowsAbout": [
          "Medical Cannabis",
          "Hemp Industry",
          "Cannabis Legislation",
          "Cannabis Companies",
          "CBD Products",
          "Cannabis Research"
        ],
        "areaServed": {
          "@type": "Country",
          "name": "Australia"
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.cannaus.com.au/",
        "url": "https://www.cannaus.com.au/",
        "name": "Cannaus | Australian Cannabis News & Industry Directory",
        "isPartOf": {
          "@id": "https://www.cannaus.com.au/"
        },
        "about": {
          "@id": "https://www.cannaus.com.au/"
        },
        "description": "Australia's trusted source for cannabis news, industry insights, and comprehensive business directory",
        "breadcrumb": {
          "@id": "https://www.cannaus.com.au/"
        },
        "inLanguage": "en-AU"
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.cannaus.com.au/",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "WebPage",
              "name": "Home",
              "@id": "https://www.cannaus.com.au/"
            }
          }
        ]
      }
    ]
  }

  // Add recent articles to structured data
  if (latestArticles.length > 0) {
    structuredData["@graph"].push({
      "@type": "ItemList",
      "name": "Latest Cannabis News",
      "description": "Most recent cannabis industry news and updates",
      "numberOfItems": latestArticles.length,
      "itemListElement": latestArticles.slice(0, 5).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": article.title,
          "url": `https://www.cannaus.com.au/${article.category}/${article.slug}`,
          "datePublished": article.createdAt,
          "author": {
            "@type": "Person",
            "name": "Mike Frigger"
          },
          "publisher": {
            "@id": "https://www.cannaus.com.au/"
          }
        }
      }))
    })
  }

  return (
    <>
      {/* Comprehensive SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <MainLayout headerProps={headerProps}>
        <HomeClient data={homeData} />
      </MainLayout>
    </>
  )
}