import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import GlobalHeader from '@/components/GlobalHeader'
import GlobalFooter from '@/components/GlobalFooter'
import ArticleSidebar from '@/components/SidebarComponent'
import CategoryLoadMore from '@/components/CategoryLoadMore'

const prisma = new PrismaClient()

// Helper function - defined at module level for both generateMetadata and component
const formatStateName = (category) => {
  const stateNames = {
    'nsw': 'New South Wales',
    'vic': 'Victoria',
    'qld': 'Queensland', 
    'wa': 'Western Australia',
    'sa': 'South Australia',
    'tas': 'Tasmania',
    'act': 'Australian Capital Territory',
    'nt': 'Northern Territory',
    'national': 'National',
    'international': 'International'
  }
  return stateNames[category] || category.toUpperCase()
}

// SEO Metadata Generation
export async function generateMetadata({ params }) {
  const { category } = params
  
  // Valid categories check
  const validCategories = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt', 'national', 'international']
  if (!validCategories.includes(category)) {
    return {}
  }

  const stateName = formatStateName(category)


  // Get most recent article for last modified date
  const latestArticle = await prisma.article.findFirst({
    where: { 
      published: true, 
      type: 'post',
      category: category
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  })

  const descriptions = {
    'nsw': `Latest cannabis news, legislation updates, and industry insights from New South Wales. Stay informed with NSW cannabis developments and regulatory changes.`,
    'vic': `Latest cannabis news, legislation updates, and industry insights from Victoria. Stay informed with Victorian cannabis developments and regulatory changes.`,
    'qld': `Latest cannabis news, legislation updates, and industry insights from Queensland. Stay informed with QLD cannabis developments and regulatory changes.`,
    'wa': `Latest cannabis news, legislation updates, and industry insights from Western Australia. Stay informed with WA cannabis developments and regulatory changes.`,
    'sa': `Latest cannabis news, legislation updates, and industry insights from South Australia. Stay informed with SA cannabis developments and regulatory changes.`,
    'tas': `Latest cannabis news, legislation updates, and industry insights from Tasmania. Stay informed with Tasmanian cannabis developments and regulatory changes.`,
    'act': `Latest cannabis news, legislation updates, and industry insights from Australian Capital Territory. Stay informed with ACT cannabis developments and regulatory changes.`,
    'nt': `Latest cannabis news, legislation updates, and industry insights from Northern Territory. Stay informed with NT cannabis developments and regulatory changes.`,
    'national': `Latest national cannabis news, federal legislation updates, and Australia-wide industry insights. Stay informed with national cannabis developments.`,
    'international': `Latest international cannabis news, global legislation updates, and worldwide industry insights. Stay informed with global cannabis developments.`
  }

  const description = descriptions[category] || `Latest cannabis news and industry updates from ${stateName}. Stay informed with Cannaus.`

  return {
    title: `${stateName} Cannabis News | Latest Updates & Industry Insights | Cannaus`,
    description: description,
    keywords: `cannabis news, ${stateName}, Australia, legislation, medical cannabis, hemp, industry updates, ${category}`,
    openGraph: {
      title: `${stateName} Cannabis News | Cannaus`,
      description: description,
      url: `https://www.cannaus.com.au/${category}`,
      type: 'website',
      locale: 'en_AU',
      siteName: 'Cannaus',
      images: [{
        url: 'https://www.cannaus.com.au/images/logo/cannaus-social.png',
        width: 1200,
        height: 630,
        alt: `${stateName} Cannabis News - Cannaus`
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${stateName} Cannabis News | Cannaus`,
      description: description,
      images: ['https://www.cannaus.com.au/images/logo/cannaus-social.png'],
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
      canonical: `https://www.cannaus.com.au/${category}`,
    },
    other: {
      'geo.region': category === 'international' ? null : 'AU',
      'geo.placename': stateName,
      'article:section': 'Cannabis News',
      'article:tag': `${stateName}, Cannabis, Australia`,
    },
    // Add last modified if we have articles
    ...(latestArticle && {
      lastModified: latestArticle.createdAt,
    }),
  }
}

// Component for displaying optimized article thumbnails
function ArticleThumbnail({ featuredImage, title, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center h-48 sm:h-32 sm:w-48 ${className}`}>
        <span className="text-green-600 text-4xl">🌿</span>
      </div>
    )
  }
  
  try {
    const imageData = typeof featuredImage === 'string' 
      ? JSON.parse(featuredImage) 
      : featuredImage
    
    return (
      <div className={`relative overflow-hidden h-48 sm:h-32 sm:w-48 ${className}`}>
        <picture>
          <source srcSet={imageData.webp} type="image/webp" />
          <Image
            src={imageData.thumbnail || imageData.jpg}
            alt={imageData.alt || title}
            width={192}
            height={128}
            className="w-full h-full object-cover"
            sizes="(max-width: 640px) 100vw, 192px"
          />
        </picture>
      </div>
    )
  } catch (error) {
    console.error('Error parsing featured image:', error)
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center h-48 sm:h-32 sm:w-48 ${className}`}>
        <span className="text-green-600 text-4xl">🌿</span>
      </div>
    )
  }
}

export default async function CategoryPage({ params }) {
  const { category } = params
  
  // Valid categories
  const validCategories = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt', 'national', 'international']
  
  if (!validCategories.includes(category)) {
    notFound()
  }
  
  // Get articles for this category
  const articles = await prisma.article.findMany({
    where: { 
      published: true, 
      type: 'post',
      category: category
    },
    orderBy: { createdAt: 'desc' },
    take: 21 // Take 21 to check if there are more than 20
  })

  // Check if there are more articles beyond the first 20
  const hasMoreArticles = articles.length > 20
  const displayArticles = articles.slice(0, 20) // Only show first 20

  if (articles.length === 0) {
    notFound()
  }


  // Helper function to truncate text
  const truncateText = (html, maxLength) => {
    const text = html.replace(/<[^>]*>/g, '')
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
  }

  // Generate structured data for the category page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${formatStateName(category)} Cannabis News`,
    "description": `Latest cannabis news and industry updates from ${formatStateName(category)}`,
    "url": `https://www.cannaus.com.au/${category}`,
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
      "numberOfItems": displayArticles.length,
      "itemListElement": displayArticles.slice(0, 10).map((article, index) => ({
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
          }
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
            "name": `${formatStateName(category)} Cannabis News`,
            "@id": `https://www.cannaus.com.au/${category}`
          }
        }
      ]
    },
    "about": {
      "@type": "Thing",
      "name": `Cannabis Industry ${formatStateName(category)}`,
      "description": `Cannabis industry news and updates from ${formatStateName(category)}`
    }
  }

  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Global Header */}
        <GlobalHeader showLogo={true} showNavigation={true} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8 text-center" aria-label="Breadcrumb">
            <ol className="flex justify-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-900 font-medium">{formatStateName(category)}</li>
            </ol>
          </nav>

                        {/* Page Header */}
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {formatStateName(category)} Cannabis News
                </h1>
                <p className="text-gray-600 text-lg">
                  Latest cannabis news and updates from {formatStateName(category)}. 
                </p>
              </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">


              {/* Articles List */}
              <div className="space-y-8">
                {displayArticles.map((article) => (
                  <article key={article.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex-shrink-0">
                        <Link href={`/${article.category}/${article.slug}`}>
                          <ArticleThumbnail 
                            featuredImage={article.featuredImage}
                            title={article.title}
                            className="!w-100 !h-full"
                          />
                        </Link>
                      </div>
                      
                      <div className="flex-1 min-w-0 p-4 sm:p-6 flex flex-col justify-center">
                        <Link href={`/${article.category}/${article.slug}`}>
                          <h3 className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors mb-3 line-clamp-2 leading-tight">
                            {article.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {truncateText(article.content, 150)}
                        </p>

                        <div className="flex items-center justify-between gap-2 mb-3">
                          <time className="text-xs text-gray-500 flex items-center" dateTime={article.createdAt}>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(article.createdAt).toLocaleDateString('en-AU', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </time>

                          <Link 
                            href={`/${article.category}/${article.slug}`}
                            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                          >
                            Read full article
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More / Pagination */}
              {hasMoreArticles && (
                <CategoryLoadMore 
                  initialArticles={[]} // Start with empty array since it will fetch from API
                  excludeIds={displayArticles.map(article => article.id)} // Exclude the first 20
                  category={category} // Pass the current category
                />
              )}
            </div>

            {/* Sidebar - Desktop: Sticky, Mobile: After articles */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="lg:sticky lg:top-8">
                <ArticleSidebar category={category} currentSlug="" />
              </div>
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <GlobalFooter />
      </div>
    </>
  )
}