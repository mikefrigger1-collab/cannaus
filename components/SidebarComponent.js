import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'

const prisma = new PrismaClient()

// Sidebar Component
export default async function ArticleSidebar({ category, currentSlug }) {
  // Fetch related articles from the same category and latest posts
  const relatedPosts = await prisma.article.findMany({
    where: {
      published: true,
      type: 'post',
      category: category,
      slug: { not: currentSlug }
    },
    select: {
      title: true,
      slug: true,
      category: true,
      createdAt: true,
      featuredImage: true
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  // If not enough related posts in same category, get latest from other categories
  if (relatedPosts.length < 4) {
    const additionalPosts = await prisma.article.findMany({
      where: {
        published: true,
        type: 'post',
        category: { not: category },
        slug: { not: currentSlug }
      },
      select: {
        title: true,
        slug: true,
        category: true,
        createdAt: true,
        featuredImage: true
      },
      orderBy: { createdAt: 'desc' },
      take: 4 - relatedPosts.length
    })
    relatedPosts.push(...additionalPosts)
  }

  const formatStateName = (category) => {
    const stateNames = {
      'nsw': 'NSW', 'vic': 'Victoria', 'qld': 'Queensland',
      'wa': 'WA', 'sa': 'SA', 'tas': 'Tasmania',
      'act': 'ACT', 'nt': 'NT', 'national': 'National', 'international': 'International'
    }
    return stateNames[category] || category.toUpperCase()
  }

  return (
    <aside className="space-y-8">
      {/* Newsletter Signup */}
      <div className="p-6 bg-white border border-gray-200 text-center">
        <Image
          src="/images/logo/cannaus-icon.png"
          alt="Cannaus - Australian Cannabis News"
          width={100}
          height={100}
          className="mx-auto mb-8"
          priority
        />
        <h3 className="text-xl font-bold mb-3 text-gray-900">Weekly Cannabis News</h3>
        <p className="text-gray-600 text-sm mb-4">
          Get the latest cannabis news and industry insights delivered to your inbox.
        </p>
        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="Enter your email"
            className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button className="w-full bg-green-600 text-white py-2 px-4 font-semibold hover:bg-green-700 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Related Posts */}
      <div className="bg-white border border-gray-200 p-6">
        <div className="space-y-4">
          {relatedPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/${post.category}/${post.slug}`} className="block">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {post.featuredImage ? (
                      <Image
                        src={JSON.parse(post.featuredImage).thumbnail || JSON.parse(post.featuredImage).jpg}
                        alt={post.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-green-600 text-2xl">🌿</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 leading-5">
                      {post.title}
                    </h4>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link 
            href={`/${category}`}
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            View all {formatStateName(category)} articles
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  )
}