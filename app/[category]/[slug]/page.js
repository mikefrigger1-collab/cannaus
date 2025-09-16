import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import GlobalHeader from '@/components/GlobalHeader'
import GlobalFooter from '@/components/GlobalFooter'
import ArticleSidebar from '@/components/SidebarComponent'
import SocialShare from '@/components/SocialShare'
import CommentSystem from '@/components/CommentSystem'

const prisma = new PrismaClient()

// Helper function - defined at module level so it can be used in both generateMetadata and component
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
  const { category, slug } = params
  
  // Valid categories check
  const validCategories = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt', 'national', 'international']
  if (!validCategories.includes(category)) {
    return {}
  }
  
  // Find article
  const article = await prisma.article.findFirst({
    where: { 
      slug: slug,
      category: category,
      published: true,
      type: 'post'
    }
  })

  if (!article) {
    return {}
  }

  // Clean description from HTML
  const description = article.content.replace(/<[^>]*>/g, '').substring(0, 160)
  const stateName = formatStateName(category)
  
  // Parse featured image if available
  let featuredImageUrl = null
  if (article.featuredImage) {
    try {
      const imageData = JSON.parse(article.featuredImage)
      featuredImageUrl = `https://www.cannaus.com.au${imageData.jpg}`
    } catch (error) {
      console.error('Error parsing featured image for metadata:', error)
    }
  }

  return {
    title: `${article.title} | ${stateName} Cannabis News | Cannaus`,
    description: description,
    keywords: `cannabis, ${stateName}, Australia, news, ${article.title}`,
    openGraph: {
      title: article.title,
      description: description,
      url: `https://www.cannaus.com.au/${category}/${slug}/`,
      type: 'article',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: ['Mike Frigger'],
      section: stateName,
      tags: ['cannabis', 'australia', stateName.toLowerCase(), 'news'],
      images: featuredImageUrl ? [{
        url: featuredImageUrl,
        width: 1200,
        height: 800,
        alt: article.title
      }] : [],
      locale: 'en_AU',
      siteName: 'Cannaus',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      images: featuredImageUrl ? [featuredImageUrl] : [],
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
      canonical: `https://www.cannaus.com.au/${category}/${slug}/`,
    },
    other: {
      'article:published_time': article.createdAt,
      'article:modified_time': article.updatedAt,
      'article:section': stateName,
      'article:author': 'Mike Frigger',
    },
  }
}

// Author Box Component
function AuthorBox() {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">MF</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Mike Frigger</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            Mike is the founder and editor of Cannaus. With over a decade of experience in cannabis journalism, 
            he&apos;s an advocate for legalising cannabis and covers much of the cannabis journey in Australia.
          </p>
        </div>
      </div>
    </div>
  )
}

export default async function ArticlePage({ params }) {
  const { category, slug } = params
  
  // Valid categories
  const validCategories = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt', 'national', 'international']
  
  if (!validCategories.includes(category)) {
    notFound()
  }
  
  // Find article by slug AND category to ensure correct state
  const article = await prisma.article.findFirst({
    where: { 
      slug: slug,
      category: category,
      published: true,
      type: 'post'
    }
  })

  if (!article) {
    notFound()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.content.replace(/<[^>]*>/g, '').substring(0, 160),
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Person",
      "name": "Mike Frigger",
      "url": "https://www.cannaus.com.au/about"
    },
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
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.cannaus.com.au/${category}/${slug}/`
    },
    "articleSection": formatStateName(category),
    "keywords": ["cannabis", "Australia", formatStateName(category), "news"],
    "inLanguage": "en-AU",
    "isAccessibleForFree": true,
    "about": {
      "@type": "Thing",
      "name": "Cannabis Industry Australia",
      "sameAs": "https://en.wikipedia.org/wiki/Cannabis_in_Australia"
    }
  }

  // Add featured image to structured data if available
  if (article.featuredImage) {
    try {
      const imageData = JSON.parse(article.featuredImage)
      structuredData.image = {
        "@type": "ImageObject",
        "url": `https://www.cannaus.com.au${imageData.jpg}`,
        "width": 1200,
        "height": 800,
        "caption": article.title
      }
    } catch (error) {
      console.error('Error parsing featured image for structured data:', error)
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
          <nav className="mb-8" aria-label="Breadcrumb">
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
              <li>
                <Link href={`/${category}`} className="text-gray-600 hover:text-gray-900 hover:underline transition-colors">
                  {formatStateName(category)}
                </Link>
              </li>
              <li className="text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-900 font-medium">{article.title}</li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Article */}
              <article className="bg-white border border-gray-200 overflow-hidden">
                
                {/* Featured Image */}
                {article.featuredImage && (
                  <div className="relative h-64 md:h-96 bg-gray-100">
                    {(() => {
                      try {
                        const imageData = JSON.parse(article.featuredImage)
                        return (
                          <picture>
                            <source srcSet={imageData.webp} type="image/webp" />
                            <Image
                              src={imageData.jpg}
                              alt={imageData.alt || article.title}
                              fill
                              className="object-cover"
                              priority
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                            />
                          </picture>
                        )
                      } catch (error) {
                        console.error('Error parsing featured image:', error)
                        return (
                          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-green-600 text-6xl">🌿</span>
                          </div>
                        )
                      }
                    })()}
                  </div>
                )}

                {/* Article Header */}
                <header className="px-8 pt-8 pb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {formatStateName(category)}
                    </span>
                    <time className="text-gray-500 text-sm" dateTime={article.createdAt}>
                      {formatDate(article.createdAt)}
                    </time>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {article.title}
                  </h1>
                </header>

                {/* Article Content */}
                <div className="px-8 pb-8">
                  <div className="prose prose-lg max-w-none prose-gray prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:shadow-lg prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:px-6 prose-blockquote:py-4">
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="px-8 pb-8">
                  <SocialShare 
                    title={article.title}
                    url={`https://www.cannaus.com.au/${category}/${slug}/`}
                    description={article.title}
                  />
                </div>

                {/* Author Box */}
                <div className="px-8 pb-8">
                  <AuthorBox />
                </div>
              </article>

              {/* Comment System - Added here */}
              <section className="mt-8">
                <CommentSystem articleId={article.id} />
              </section>
            </div>

            {/* Sidebar - Desktop: Sticky, Mobile: After article */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="lg:sticky lg:top-8">
                <ArticleSidebar category={category} currentSlug={slug} />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 text-center">
            <Link 
              href={`/${category}`}
              className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium hover:underline transition-colors bg-white px-6 py-3 shadow-md hover:shadow-lg border border-gray-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {formatStateName(category)} News
            </Link>
          </div>
        </main>

        {/* Global Footer */}
        <GlobalFooter />
      </div>
    </>
  )
}