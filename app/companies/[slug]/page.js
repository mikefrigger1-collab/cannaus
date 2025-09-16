import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import MainLayout from '@/components/MainLayout'
import CompanyGallery from '@/components/CompanyGallery'

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
  const { slug } = params
  
  // Find company
  const company = await prisma.article.findUnique({
    where: { slug: slug, type: 'company', published: true }
  })

  if (!company) {
    return {}
  }

  // Clean description from HTML and company-specific content
  let description = company.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/^About:\s*/i, '') // Remove "About:" prefix
    .replace(/<div class="company-contact">.*?<\/div>/s, '') // Remove contact divs
    .replace(/<div class="company-social">.*?<\/div>/s, '') // Remove social divs
    .trim()
    .substring(0, 160)

  const stateName = company.category ? formatStateName(company.category) : 'Australia'
  
  // Parse featured image if available
  let featuredImageUrl = null
  if (company.featuredImage) {
    try {
      const imageData = JSON.parse(company.featuredImage)
      featuredImageUrl = `https://www.cannaus.com.au${imageData.jpg}`
    } catch (error) {
      console.error('Error parsing featured image for metadata:', error)
    }
  }

  // Extract contact info for enhanced business data
  let websiteUrl = null
  let phoneNumber = null
  let emailAddress = null
  
  if (company.content.includes('company-contact')) {
    const websiteMatch = company.content.match(/<strong>Website:<\/strong>\s*<a href="([^"]*)"/)
    const phoneMatch = company.content.match(/<strong>Phone:<\/strong>\s*([^<\n]*?)(?:<br|$)/)
    const emailMatch = company.content.match(/<strong>Email:<\/strong>\s*<a href="mailto:([^"]*)"/)
    
    websiteUrl = websiteMatch ? websiteMatch[1] : null
    phoneNumber = phoneMatch ? phoneMatch[1].trim() : null
    emailAddress = emailMatch ? emailMatch[1] : null
  }

  return {
    title: `${company.title} | Cannabis Company ${stateName} | Cannaus`,
    description: description || `${company.title} - Australian cannabis company profile. Learn about their products, services, and industry expertise in ${stateName}.`,
    keywords: `${company.title}, cannabis company, ${stateName}, Australia, medical cannabis, hemp, CBD, cannabis industry`,
    openGraph: {
      title: `${company.title} | Cannabis Company`,
      description: description || `${company.title} - Australian cannabis company in ${stateName}`,
      url: `https://www.cannaus.com.au/companies/${slug}/`,
      type: 'website',
      locale: 'en_AU',
      siteName: 'Cannaus',
      images: featuredImageUrl ? [{
        url: featuredImageUrl,
        width: 1200,
        height: 800,
        alt: `${company.title} logo`
      }] : [{
        url: 'https://www.cannaus.com.au/images/logo/cannaus-social.png',
        width: 1200,
        height: 630,
        alt: `${company.title} - Cannabis Company Directory`
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.title} | Cannabis Company`,
      description: description || `${company.title} - Australian cannabis company in ${stateName}`,
      images: featuredImageUrl ? [featuredImageUrl] : ['https://www.cannaus.com.au/images/logo/cannaus-social.png'],
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
      canonical: `https://www.cannaus.com.au/companies/${slug}/`,
    },
    other: {
      'business:contact_data:street_address': company.category ? stateName : null,
      'business:contact_data:region': company.category ? stateName : null,
      'business:contact_data:country_name': 'Australia',
      'business:contact_data:website': websiteUrl,
      'business:contact_data:phone_number': phoneNumber,
      'business:contact_data:email': emailAddress,
      'article:section': 'Cannabis Companies',
      'article:tag': `${company.title}, Cannabis, ${stateName}, Business Directory`,
    },
    // Add last modified
    lastModified: company.updatedAt,
  }
}

// Updated cleanCompanyContent function
const cleanCompanyContent = (content) => {
  if (!content) return content
  
  return content
    .replace(/^About:\s*/i, '')
    .replace(/<p[^>]*>About:\s*/i, '<p>')
    .replace(/^<h[1-6][^>]*>About:<\/h[1-6]>/i, '')
    .replace(/(<strong>|<b>)About:(<\/strong>|<\/b>)\s*/i, '')
    // Remove both contact and social media divs
    .replace(/<div class="company-contact">.*?<\/div>/s, '')
    .replace(/<div class="company-social">.*?<\/div>/s, '')
    .trim()
}

function CompanyLogo({ featuredImage, title, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-4xl">🏢</div>
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
            src={imageData.thumbnail || imageData.jpg}
            alt={imageData.alt || `${title} logo`}
            width={300}
            height={128}
            className="w-full h-full object-contain bg-white p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </picture>
      </div>
    )
  } catch (error) {
    console.error('Error parsing company logo:', error)
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-4xl">🏢</div>
      </div>
    )
  }
}

// Component for company logo/featured image
function CompanyHero({ featuredImage, title, category, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-8xl">🏢</div>
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
            alt={imageData.alt || `${title} logo`}
            width={1200}
            height={400}
            className="w-full h-full object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </picture>
        <div className="absolute inset-0"></div>
      </div>
    )
  } catch (error) {
    console.error('Error parsing company featured image:', error)
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-8xl">🏢</div>
      </div>
    )
  }
}

function SocialMediaLinks({ content }) {
  // Check if content contains social media div
  if (!content || !content.includes('company-social')) {
    return null
  }

  // Extract social media info from the HTML
  const socialMatch = content.match(/<div class="company-social">(.*?)<\/div>/s)
  if (!socialMatch) return null

  const socialHTML = socialMatch[1]
  
  // Parse all social media links
  const linkRegex = /<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g
  const socialLinks = []
  let match

  while ((match = linkRegex.exec(socialHTML)) !== null) {
    const url = match[1]
    const platform = match[2].trim()
    
    // Determine platform type and icon
    let icon = null
    let platformName = platform
    let bgColor = 'bg-gray-100 hover:bg-gray-200'
    let textColor = 'text-gray-700'

    if (url.includes('facebook.com')) {
      platformName = 'Facebook'
      bgColor = 'bg-green-100 hover:bg-green-200'
      textColor = 'text-green-800'
      icon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    } else if (url.includes('linkedin.com')) {
      platformName = 'LinkedIn'
      bgColor = 'bg-green-100 hover:bg-green-200'
      textColor = 'text-green-800'
      icon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      platformName = 'Twitter'
      bgColor = 'bg-green-100 hover:bg-green-200'
      textColor = 'text-green-800'
      icon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    } else if (url.includes('instagram.com')) {
      platformName = 'Instagram'
      bgColor = 'bg-green-100 hover:bg-green-200'
      textColor = 'text-green-800'
      icon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C8.396 0 7.989.013 6.756.072 5.526.13 4.668.316 3.906.6c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.346 4.897.16 5.755.102 6.984.013 8.218 0 8.624 0 12.245s.013 4.027.072 5.26c.058 1.23.244 2.088.528 2.845.306.79.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.757.284 1.615.47 2.845.528 1.233.058 1.639.072 5.26.072s4.027-.015 5.26-.072c1.23-.058 2.088-.244 2.845-.528a5.847 5.847 0 002.126-1.384 5.847 5.847 0 001.384-2.126c.284-.757.47-1.615.528-2.845.058-1.233.072-1.639.072-5.26s-.015-4.027-.072-5.26c-.058-1.23-.244-2.088-.528-2.845a5.847 5.847 0 00-1.384-2.126A5.847 5.847 0 0019.85.63c-.757-.284-1.615-.47-2.845-.528C16.772.013 16.366 0 12.745 0h-.728zm-.717 1.075h.718c3.568 0 3.995.012 5.406.071 1.305.058 2.014.272 2.485.451.625.242 1.071.532 1.539 1.001.469.469.758.914 1.001 1.539.179.471.393 1.18.451 2.485.059 1.411.072 1.838.072 5.406s-.013 3.995-.072 5.406c-.058 1.305-.272 2.014-.451 2.485-.242.625-.532 1.071-1.001 1.539-.469.469-.914.758-1.539 1.001-.471.179-1.18.393-2.485.451-1.411.059-1.838.072-5.406.072s-3.995-.013-5.406-.072c-1.305-.058-2.014-.272-2.485-.451-.625-.242-1.071-.532-1.539-1.001a4.142 4.142 0 01-1.001-1.539c-.179-.471-.393-1.18-.451-2.485-.059-1.411-.072-1.838-.072-5.406s.013-3.995.072-5.406c.058-1.305.272-2.014.451-2.485.242-.625.532-1.071 1.001-1.539.469-.469.914-.758 1.539-1.001.471-.179 1.18-.393 2.485-.451 1.236-.057 1.715-.07 4.688-.071v.003zm9.438 2.504a1.425 1.425 0 11-2.85 0 1.425 1.425 0 012.85 0zm-7.425 1.937a5.484 5.484 0 105.484 5.484 5.484 5.484 0 00-5.484-5.484zm0 1.425a4.059 4.059 0 114.059 4.059 4.059 4.059 0 01-4.059-4.059z"/>
        </svg>
      )
    } else if (url.includes('youtube.com')) {
      platformName = 'YouTube'
      bgColor = 'bg-green-100 hover:bg-green-200'
      textColor = 'text-green-800'
      icon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    } else {
      // Generic link
      platformName = 'Website'
      bgColor = 'bg-green-100 hover:bg-green-200'
      textColor = 'text-green-800'
      icon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )
    }

    socialLinks.push({
      url,
      platform: platformName,
      icon,
      bgColor,
      textColor
    })
  }

  if (socialLinks.length === 0) return null

  return (
    <div className="mt-8 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Socials</h3>
      
      <div className="flex flex-col sm:flex-row sm:justify-center items-center gap-3">
        {socialLinks.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${social.bgColor} ${social.textColor}`}
          >
            {social.icon}
            {social.platform}
          </a>
        ))}
      </div>
    </div>
  )
}

// Add this component to your company page
function ContactInformation({ content }) {
  // Check if content contains contact info div
  if (!content || !content.includes('company-contact')) {
    return null
  }

  // Extract contact info from the HTML
  const contactMatch = content.match(/<div class="company-contact">(.*?)<\/div>/s)
  if (!contactMatch) return null

  const contactHTML = contactMatch[1]
  
  // Parse the contact details
  const websiteMatch = contactHTML.match(/<strong>Website:<\/strong>\s*<a href="([^"]*)"[^>]*>([^<]*)<\/a>/)
  const emailMatch = contactHTML.match(/<strong>Email:<\/strong>\s*<a href="mailto:([^"]*)"[^>]*>([^<]*)<\/a>/)
  const phoneMatch = contactHTML.match(/<strong>Phone:<\/strong>\s*([^<\n]*?)(?:<br|$)/)
  const industryMatch = contactHTML.match(/<strong>Industry:<\/strong>\s*([^<\n]*?)(?:<\/p|$)/)

  return (
    <div className="mt-8 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
      
      <div className="space-y-3 text-center">
        {websiteMatch && (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Website:</span>
            <a 
              href={websiteMatch[1]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 hover:underline text-sm"
            >
              {websiteMatch[2]}
            </a>
          </div>
        )}

        {emailMatch && (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <a 
              href={`mailto:${emailMatch[1]}`}
              className="text-green-600 hover:text-green-700 hover:underline text-sm"
            >
              {emailMatch[2]}
            </a>
          </div>
        )}

        {phoneMatch && (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Phone:</span>
            <span className="text-gray-900 text-sm">{phoneMatch[1].trim()}</span>
          </div>
        )}

        {industryMatch && (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Industry:</span>
            <span className="text-gray-900 text-sm">{industryMatch[1].trim()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Component for article thumbnails
function ArticleThumbnail({ featuredImage, title, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-2xl">🌿</div>
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
            width={200}
            height={120}
            className="w-full h-full object-cover"
            sizes="200px"
          />
        </picture>
      </div>
    )
  } catch (error) {
    console.error('Error parsing thumbnail image:', error)
    return (
      <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-2xl">🌿</div>
      </div>
    )
  }
}

export default async function CompanyPage({ params }) {
  const { slug } = await params;
  
  const company = await prisma.article.findUnique({
    where: { slug: slug, type: 'company', published: true }
  })

  if (!company) {
    notFound()
  }

  // Get related companies (same category, excluding current)
  const relatedCompanies = await prisma.article.findMany({
    where: { 
      published: true, 
      type: 'company',
      category: company.category,
      NOT: { id: company.id }
    },
    orderBy: { title: 'asc' },
    take: 6
  })

  // Get latest articles
  const latestArticles = await prisma.article.findMany({
    where: { 
      published: true, 
      type: 'post'
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      category: true,
      createdAt: true,
      featuredImage: true
    }
  })

  const headerProps = {
    showLogo: true,
    showNavigation: true,
    showSubtitle: false
  }

  const getStateColor = (category) => {
    const colors = {
      'nsw': 'bg-blue-100 text-blue-800',
      'vic': 'bg-purple-100 text-purple-800',
      'qld': 'bg-red-100 text-red-800',
      'wa': 'bg-yellow-100 text-yellow-800',
      'sa': 'bg-green-100 text-green-800',
      'tas': 'bg-indigo-100 text-indigo-800',
      'act': 'bg-pink-100 text-pink-800',
      'nt': 'bg-orange-100 text-orange-800',
      'national': 'bg-gray-100 text-gray-800',
      'international': 'bg-emerald-100 text-emerald-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const truncateText = (text, length) => {
    const plainText = text.replace(/<[^>]*>/g, '')
    return plainText.length > length ? `${plainText.substring(0, length)}...` : plainText
  }

  // Enhanced structured data for companies
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.title,
    "description": company.content.replace(/<[^>]*>/g, '').substring(0, 160),
    "url": `https://www.cannaus.com.au/companies/${company.slug}`,
    "foundingDate": company.createdAt,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": company.category ? formatStateName(company.category) : "Australia",
      "addressCountry": "AU"
    },
    "industry": "Cannabis Industry",
    "knowsAbout": ["Medical Cannabis", "Hemp", "CBD", "Cannabis Regulation"],
    "areaServed": {
      "@type": "Place",
      "name": company.category ? formatStateName(company.category) : "Australia"
    }
  }

  // Add contact info to structured data if available
  if (company.content.includes('company-contact')) {
    const websiteMatch = company.content.match(/<strong>Website:<\/strong>\s*<a href="([^"]*)"/)
    const phoneMatch = company.content.match(/<strong>Phone:<\/strong>\s*([^<\n]*?)(?:<br|$)/)
    const emailMatch = company.content.match(/<strong>Email:<\/strong>\s*<a href="mailto:([^"]*)"/)
    
    if (websiteMatch) {
      structuredData.url = websiteMatch[1]
    }
    if (phoneMatch) {
      structuredData.telephone = phoneMatch[1].trim()
    }
    if (emailMatch) {
      structuredData.email = emailMatch[1]
    }
  }

  // Add logo to structured data if available
  if (company.featuredImage) {
    try {
      const imageData = JSON.parse(company.featuredImage)
      structuredData.logo = {
        "@type": "ImageObject",
        "url": `https://www.cannaus.com.au${imageData.jpg}`,
        "caption": `${company.title} logo`
      }
    } catch (error) {
      console.error('Error parsing featured image for structured data:', error)
    }
  }

  return (
    <>
      {/* Enhanced SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <MainLayout headerProps={headerProps}>
        <div className="min-h-screen bg-gray-50">

          {/* Main Content - Single Column, Max Width 700px */}
          <div className="max-w-[700px] mx-auto px-4 py-8">
            {/* Breadcrumb Navigation */}
            <nav className="mb-8 text-sm" aria-label="Breadcrumb">
              <ol className="flex justify-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 hover:underline">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">›</li>
                <li>
                  <Link href="/companies/" className="text-gray-600 hover:text-gray-900 hover:underline">
                    Companies
                  </Link>
                </li>
                <li className="text-gray-400">›</li>
                <li className="text-gray-900 font-medium truncate">{company.title}</li>
              </ol>
            </nav>

            {/* Main Article */}
            <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-12">
              {/* Article Header */}
              <div className="flex items-center justify-center">
                <CompanyHero 
                  featuredImage={company.featuredImage}
                  title={company.title}
                  category={company.category}
                  className="w-48 h-48 lg:h-64"
                />
              </div>
              <header className="p-8 pb-6 border-b border-gray-100">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight text-center">
                  {company.title}
                </h1>
                
                <div className="flex flex-wrap items-justify gap-4 text-sm text-gray-600 justify-center">
                  {company.category && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {formatStateName(company.category)}
                    </div>
                  )}
                </div>
              </header>
              
              {/* Article Content */}
              <div className="p-8">
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cleanCompanyContent(company.content) }}
                />

                {/* Company Gallery */}
                <CompanyGallery 
                  featuredImage={company.featuredImage}
                  title={company.title}
                />

                <ContactInformation content={company.content} />

                <SocialMediaLinks content={company.content} />
              </div>
            </article>

            {/* Related Companies */}
            {relatedCompanies.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-26 text-center">
                  More Aussie Cannabis Companies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {relatedCompanies.map((relatedCompany) => (
                    <Link 
                      key={relatedCompany.id}
                      href={`/companies/${relatedCompany.slug}/`}
                      className="group"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                        {/* Full-width logo section */}
                        <div className="relative">
                          <CompanyLogo 
                            featuredImage={relatedCompany.featuredImage}
                            title={relatedCompany.title}
                            className="w-full h-32 border-b border-gray-100"
                          />
                        </div>
                        
                        {/* Content section */}
                        <div className="p-4 text-center">
                          <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-2 line-clamp-2">
                            {relatedCompany.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Latest Articles */}
            {latestArticles.length > 0 && (
              <section>
                <div className="flex items-center justify-center mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Latest Cannabis News</h2>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="space-y-4">
                    {latestArticles.map((article) => (
                      <article key={article.id} className="group">
                        <Link href={`/${article.category}/${article.slug}/`} className="block">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                              <ArticleThumbnail 
                                featuredImage={article.featuredImage}
                                title={article.title}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 leading-5">
                                {article.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  )
}