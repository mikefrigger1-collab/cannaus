'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function CategoryLoadMore({ initialArticles, excludeIds, category }) {
  const [articles, setArticles] = useState(initialArticles)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(2)

  const loadMore = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles?page=${page}&excludeIds=${excludeIds.join(',')}&category=${category}`)
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

  // Helper function to truncate text
  const truncateText = (html, maxLength) => {
    const text = html.replace(/<[^>]*>/g, '')
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
  }

  return (
    <div>
      {/* Articles List - Using exact same styling as main category page */}
      <div className="space-y-8 mt-8">
        {articles.map((article) => (
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
                  <time className="text-xs text-gray-500 flex items-center">
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

      {/* Load More Button */}
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