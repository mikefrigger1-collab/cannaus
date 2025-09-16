"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const getDaysAgo = (dateString) => {
  if (!dateString) return '0 days ago'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '0 days ago'
    
    const now = new Date()
    const diffInTime = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  } catch (error) {
    return '0 days ago'
  }
}

// Component for article thumbnails
function ArticleThumbnail({ featuredImage, title, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-4xl">🌿</div>
      </div>
    )
  }
  
  try {
    const imageData = typeof featuredImage === 'string' 
      ? JSON.parse(featuredImage) 
      : featuredImage
    
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <picture>
          <source srcSet={imageData.thumbnailWebp} type="image/webp" />
          <Image
            src={imageData.thumbnail}
            alt={imageData.alt || title}
            width={400}
            height={250}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </picture>
      </div>
    )
  } catch (error) {
    console.error('Error parsing thumbnail image:', error)
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-4xl">🌿</div>
      </div>
    )
  }
}

// Component for large featured images
function FeaturedImage({ featuredImage, title, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-6xl">🌿</div>
      </div>
    )
  }
  
  try {
    const imageData = typeof featuredImage === 'string' 
      ? JSON.parse(featuredImage) 
      : featuredImage
    
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <picture>
          <source srcSet={imageData.webp} type="image/webp" />
          <Image
            src={imageData.jpg}
            alt={imageData.alt || title}
            width={800}
            height={400}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </picture>
      </div>
    )
  } catch (error) {
    console.error('Error parsing featured image:', error)
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-6xl">🌿</div>
      </div>
    )
  }
}

// Component for company logos
function CompanyLogo({ featuredImage, title, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-2xl">🏢</div>
      </div>
    )
  }
  
  try {
    const imageData = typeof featuredImage === 'string' 
      ? JSON.parse(featuredImage) 
      : featuredImage
    
    const logoSrc = imageData.thumbnail || imageData.jpg
    const logoWebp = imageData.thumbnailWebp || imageData.webp
    
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <picture>
          {logoWebp && <source srcSet={logoWebp} type="image/webp" />}
          <Image
            src={logoSrc}
            alt={imageData.alt || `${title} logo`}
            width={80}
            height={80}
            className="w-full h-full object-contain bg-white p-2"
            sizes="80px"
          />
        </picture>
      </div>
    )
  } catch (error) {
    console.error('Error parsing company logo:', error)
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-2xl">🏢</div>
      </div>
    )
  }
}

// Load More Articles Component
function LoadMoreArticles({ initialArticles, excludeIds }) {
  const [articles, setArticles] = useState(initialArticles)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(2)

  const loadMore = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles?page=${page}&excludeIds=${excludeIds.join(',')}`)
      const newArticles = await response.json()
      
      if (newArticles.length === 0) {
        setHasMore(false)
      } else {
        setArticles([...articles, ...newArticles])
        setPage(page + 1)
      }
    } catch (error) {
      console.error('Error loading more articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatStateName = (category) => {
    const stateNames = {
      'nsw': 'NSW', 'vic': 'VIC', 'qld': 'QLD', 'wa': 'WA',
      'sa': 'SA', 'tas': 'TAS', 'act': 'ACT', 'nt': 'NT',
      'national': 'National', 'international': 'International'
    }
    return stateNames[category] || category.toUpperCase()
  }

  const getStateColor = (category) => {
    const colors = {
      'nsw': 'bg-blue-100 text-blue-800', 'vic': 'bg-purple-100 text-purple-800',
      'qld': 'bg-red-100 text-red-800', 'wa': 'bg-yellow-100 text-yellow-800',
      'sa': 'bg-green-100 text-green-800', 'tas': 'bg-indigo-100 text-indigo-800',
      'act': 'bg-pink-100 text-pink-800', 'nt': 'bg-orange-100 text-orange-800',
      'national': 'bg-gray-100 text-gray-800', 'international': 'bg-emerald-100 text-emerald-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const truncateText = (text, length) => {
    const plainText = text.replace(/<[^>]*>/g, '')
    return plainText.length > length ? `${plainText.substring(0, length)}...` : plainText
  }

  return (
    <div>
      <div className="space-y-12">
  {articles.map((article) => (
    <div key={article.id} className="bg-white hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-shrink-0">
          <Link href={`/${article.category}/${article.slug}`}>
            <ArticleThumbnail 
              featuredImage={article.featuredImage}
              title={article.title}
              className="w-full"
            />
          </Link>
        </div>
        
        <div className="flex-1 min-w-0 p-4 sm:p-6 flex flex-col justify-center">
          
          <Link href={`/${article.category}/${article.slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
              {article.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm line-clamp-2">
            {truncateText(article.content, 150)}
          </p>

          <div className="flex sm:flex-row sm:items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateColor(article.category)} w-fit`}>
              {formatStateName(article.category)}
            </span>
            <time className="text-xs text-gray-500">
              {new Date(article.createdAt).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </time>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                Load More Articles
<svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
</svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default function HomeClient({ data }) {
  const { latestArticles, featuredArticles, listArticles, companies, excludeIds } = data

  // Helper functions
  const formatStateName = (category) => {
    const stateNames = {
      'nsw': 'NSW', 'vic': 'VIC', 'qld': 'QLD', 'wa': 'WA',
      'sa': 'SA', 'tas': 'TAS', 'act': 'ACT', 'nt': 'NT',
      'national': 'National', 'international': 'International'
    }
    return stateNames[category] || category.toUpperCase()
  }

  const getStateColor = (category) => {
    const colors = {
      'nsw': 'bg-blue-100 text-blue-800', 'vic': 'bg-purple-100 text-purple-800',
      'qld': 'bg-red-100 text-red-800', 'wa': 'bg-yellow-100 text-yellow-800',
      'sa': 'bg-green-100 text-green-800', 'tas': 'bg-indigo-100 text-indigo-800',
      'act': 'bg-pink-100 text-pink-800', 'nt': 'bg-orange-100 text-orange-800',
      'national': 'bg-gray-100 text-gray-800', 'international': 'bg-emerald-100 text-emerald-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const truncateText = (text, length) => {
    const plainText = text.replace(/<[^>]*>/g, '')
    return plainText.length > length ? `${plainText.substring(0, length)}...` : plainText
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-8 lg:py-12">
        
        {/* Latest News Section */}
  <section className="mb-12 sm:mb-16">
  {latestArticles.length > 0 && (
    <>
      {/* Large Featured Article */}
      <div className="mb-6 sm:mb-8">
        <Link href={`/${latestArticles[0].category}/${latestArticles[0].slug}`} className="group block">
          <div className="bg-white hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Image with gradient overlay and floating content */}
            <div className="relative">
              <FeaturedImage 
                featuredImage={latestArticles[0].featuredImage}
                title={latestArticles[0].title}
                className="w-full h-80 sm:h-100 lg:h-120"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-green-900/60 group-hover:via-green-800/20 transition-all duration-[3000ms] ease-in-out"></div>
              
              {/* Floating content */}
              <div className="absolute bottom-0 mr-4 ml-4 left-0 right-0 p-4 sm:p-6">
                {/* Date */}
                <time className="inline-block text-xs sm:text-sm text-white font-medium mb-2 sm:mb-3 bg-black/30 px-2 sm:px-3 py-1  backdrop-blur-sm">
                  {new Date(latestArticles[0].createdAt).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </time>
                
                {/* Title */}
                <h2 className="text-lg  sm:text-2xl font-bold !text-white group-hover:text-green-100 transition-colors duration-500 ease-in-out line-clamp-2">
                  {latestArticles[0].title}
                </h2>
              </div>
            </div>
          </div>
        </Link>
      </div>

{/* Small Articles - Responsive Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {latestArticles.slice(1, 5).map((article) => (
    <Link key={article.id} href={`/${article.category}/${article.slug}`} className="group block">
      <div className="sm:bg-white hover:shadow-lg sm:transition-all sm:duration-200 overflow-hidden h-full">
        {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
        <div className="flex items-center sm:flex-col sm:items-stretch">
          <div className="flex items-center justify-center sm:block flex-shrink-0">
            <ArticleThumbnail 
              featuredImage={article.featuredImage}
              title={article.title}
              className="w-30 h-20 sm:w-full sm:h-28 lg:h-32 object-cover"
            />
          </div>
          <div className="p-3 sm:p-4 flex-1 flex items-center sm:block">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:mb-2">
              {article.title}
            </h3>
            {/* Days only show on desktop */}
            <p className="hidden !mb-0 sm:block text-xs text-gray-500">
              {getDaysAgo(article.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  ))}
</div>
    </>
  )}
</section>

        {/* Featured Articles Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Featured</h2>
          </div>
          
          {featuredArticles.length > 0 && (
            <div>
              {/* Two Large Featured Articles - Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {featuredArticles.slice(0, 2).map((article) => (
                  <Link key={article.id} href={`/${article.category}/${article.slug}`} className="group block">
                    <div className="bg-white    hover:shadow-xl transition-all duration-300 overflow-hidden relative">

                      
                      <FeaturedImage 
                        featuredImage={article.featuredImage}
                        title={article.title}
                        className="w-full h-40 sm:h-48"
                      />
                      <div className="p-4 sm:p-6">

                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 text-sm sm:text-base">
                          {truncateText(article.content, 150)}
                        </p>
                                                <div className="flex sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1  text-xs sm:text-sm font-medium ${getStateColor(article.category)} w-fit`}>
                            {formatStateName(article.category)}
                          </span>
                          <time className="text-xs sm:text-sm text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString('en-AU', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Three Small Featured Articles - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredArticles.slice(2, 5).map((article) => (
                  <Link key={article.id} href={`/${article.category}/${article.slug}`} className="group block">
                    <div className="bg-white    hover:shadow-lg transition-all duration-200 overflow-hidden relative">

                      
                      <ArticleThumbnail 
                        featuredImage={article.featuredImage}
                        title={article.title}
                        className="w-full h-32 sm:h-40"
                      />
                      <div className="p-3 sm:p-4">

                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm sm:text-base">
                          {article.title}
                        </h4>
                                                <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1  text-xs font-medium ${getStateColor(article.category)}`}>
                            {formatStateName(article.category)}
                          </span>
                                                    <time className="text-xs sm:text-sm text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString('en-AU', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* All Articles List with Load More */}
        <section className="mb-12 sm:mb-16">
          <LoadMoreArticles 
            initialArticles={listArticles} 
            excludeIds={excludeIds}
          />
        </section>

      </div>
    </div>
  )
}