'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MainLayout from '../../components/MainLayout'

// Company Logo Component
function CompanyLogo({ featuredImage, title, className = "" }) {
  if (!featuredImage) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-2xl">🏢</div>
      </div>
    )
  }
  
  try {
    const imageData = typeof featuredImage === 'string' 
      ? JSON.parse(featuredImage) 
      : featuredImage
    
    const logoSrc = imageData.thumbnail || imageData.jpg
    
    return (
      <div className={`relative ${className}`} style={{ backgroundColor: '#f9fafb' }}>
        <Image
          src={logoSrc}
          alt={imageData.alt || `${title} logo`}
          width={300}
          height={200}
          className="w-full h-full object-contain"
          style={{ 
            padding: '8px',
            backgroundColor: 'white',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          sizes="(max-width: 768px) 50vw, 300px"
          onLoad={() => console.log('Image loaded successfully:', logoSrc)}
          onError={(e) => {
            console.error('Image failed to load:', logoSrc)
          }}
        />
      </div>
    )
  } catch (error) {
    console.error('Error parsing company logo:', error)
    return (
      <div className={`bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center ${className}`}>
        <div className="text-green-600 text-2xl">🏢</div>
      </div>
    )
  }
}

// Enhanced Filter Component
function CompanyFilters({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  companyTypes,
  selectedCompanyType,
  onCompanyTypeChange,
  searchQuery, 
  onSearchChange,
  totalCount,
  filteredCount 
}) {
  const formatStateName = (category) => {
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
    return stateNames[category] || category.toUpperCase()
  }

  const formatCompanyType = (type) => {
    const typeNames = {
      'medical-clinic': 'Medical Clinics',
      'research': 'Research & Development',
      'cultivation': 'Cultivation & Growing',
      'manufacturing': 'Manufacturing & Processing',
      'testing': 'Testing & Laboratory',
      'consulting': 'Consulting & Advisory',
      'technology': 'Technology & Software',
      'distribution': 'Distribution & Logistics',
      'retail': 'Retail & Dispensary',
      'investment': 'Investment & Finance',
      'education': 'Education & Training',
      'pharmacy': 'Pharmacy & Dispensing',
      'legal': 'Legal Services',
      'other': 'Other Services'
    }
    return typeNames[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const hasActiveFilters = selectedCategory || selectedCompanyType || searchQuery

  return (
 <div className="flex justify-center">
     <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8 w-fit max-w-full">
      {/* Main Filter Row */}
      <div className="flex flex-wrap gap-4 lg:gap-6 items-end">
        {/* Search Box */}
        <div className="min-w-0 flex-shrink-0">
          <div className="relative">
            <input
              id="company-search"
              type="text"
              placeholder="Keyword..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-80 pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Company Type Filter */}
        <div className="min-w-0 flex-shrink-0">
          <select
            id="type-filter"
            value={selectedCompanyType}
            onChange={(e) => onCompanyTypeChange(e.target.value)}
            className="block w-56 px-3 py-3 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="">All Types</option>
            {companyTypes.map(({ type, count }) => (
              <option key={type} value={type}>
                {formatCompanyType(type)} ({count})
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
   </div>
  )
}

// Main Client Component
export default function CompaniesClient({ companies: initialCompanies }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCompanyType, setSelectedCompanyType] = useState('')

  // Helper functions
  const formatStateName = (category) => {
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
    return stateNames[category] || category.toUpperCase()
  }

  const getStateColor = (category) => {
    const colors = {
      'nsw': 'bg-blue-50 text-blue-700 border-blue-200',
      'vic': 'bg-purple-50 text-purple-700 border-purple-200',
      'qld': 'bg-red-50 text-red-700 border-red-200',
      'wa': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'sa': 'bg-green-50 text-green-700 border-green-200',
      'tas': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'act': 'bg-pink-50 text-pink-700 border-pink-200',
      'nt': 'bg-orange-50 text-orange-700 border-orange-200',
      'national': 'bg-gray-50 text-gray-700 border-gray-200',
      'international': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getCleanDescription = (content) => {
    let cleanText = content.replace(/<[^>]*>/g, ' ')
    cleanText = cleanText.replace(/\s+/g, ' ').trim()
    
    // Remove "About:" prefix if it exists
    cleanText = cleanText.replace(/^About:\s*/i, '')
    
    const sentences = cleanText.split('. ')
    if (sentences.length > 0 && sentences[0].length > 50) {
      return sentences[0] + (sentences.length > 1 ? '...' : '')
    }
    
    return cleanText.substring(0, 180) + (cleanText.length > 180 ? '...' : '')
  }

  // Detect company type from content
  const detectCompanyType = (company) => {
    const content = company.content.toLowerCase()
    const title = company.title.toLowerCase()
    const combined = `${title} ${content}`
    
    if (combined.includes('clinic') || combined.includes('medical practice') || combined.includes('doctor') || combined.includes('physician')) {
      return 'medical-clinic'
    } else if (combined.includes('pharmacy') || combined.includes('dispensing') || combined.includes('chemist')) {
      return 'pharmacy'
    } else if (combined.includes('research') || combined.includes('laboratory') || combined.includes('lab') || combined.includes('university')) {
      return 'research'
    } else if (combined.includes('cultivation') || combined.includes('growing') || combined.includes('farm') || combined.includes('grow') || combined.includes('agriculture')) {
      return 'cultivation'
    } else if (combined.includes('manufacturing') || combined.includes('processing') || combined.includes('production') || combined.includes('extract')) {
      return 'manufacturing'
    } else if (combined.includes('testing') || combined.includes('analysis') || combined.includes('quality') || combined.includes('assurance')) {
      return 'testing'
    } else if (combined.includes('consulting') || combined.includes('advisory') || combined.includes('consultant') || combined.includes('advisor')) {
      return 'consulting'
    } else if (combined.includes('technology') || combined.includes('software') || combined.includes('app') || combined.includes('platform') || combined.includes('tech')) {
      return 'technology'
    } else if (combined.includes('distribution') || combined.includes('logistics') || combined.includes('supply') || combined.includes('transport')) {
      return 'distribution'
    } else if (combined.includes('retail') || combined.includes('dispensary') || combined.includes('store') || combined.includes('shop')) {
      return 'retail'
    } else if (combined.includes('investment') || combined.includes('finance') || combined.includes('capital') || combined.includes('fund') || combined.includes('venture')) {
      return 'investment'
    } else if (combined.includes('education') || combined.includes('training') || combined.includes('course') || combined.includes('learning')) {
      return 'education'
    } else if (combined.includes('legal') || combined.includes('lawyer') || combined.includes('attorney') || combined.includes('law firm')) {
      return 'legal'
    }
    
    return 'other'
  }

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryCount = {}
    initialCompanies.forEach(company => {
      if (company.category) {
        categoryCount[company.category] = (categoryCount[company.category] || 0) + 1
      }
    })
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => {
        if (a.category === 'national') return -1
        if (b.category === 'national') return 1
        if (a.category === 'international') return -1
        if (b.category === 'international') return 1
        return formatStateName(a.category).localeCompare(formatStateName(b.category))
      })
  }, [initialCompanies])

  // Get unique company types with counts
  const companyTypes = useMemo(() => {
    const typeCount = {}
    
    initialCompanies.forEach(company => {
      const detectedType = detectCompanyType(company)
      typeCount[detectedType] = (typeCount[detectedType] || 0) + 1
    })
    
    return Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [initialCompanies])

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return initialCompanies.filter(company => {
      const matchesSearch = !searchQuery || 
        company.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !selectedCategory || company.category === selectedCategory
      
      const matchesType = !selectedCompanyType || detectCompanyType(company) === selectedCompanyType
      
      return matchesSearch && matchesCategory && matchesType
    })
  }, [initialCompanies, searchQuery, selectedCategory, selectedCompanyType])

  return (
    <MainLayout showFooter={true}>
      <div className="bg-gray-50 min-h-screen">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <nav className="flex justify-center mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-900 font-medium">Companies</span>
                  </li>
                </ol>
              </nav>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Cannabis Companies Directory
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Discover Australia&apos;s leading cannabis companies, from medical clinics and research organizations to industry innovators shaping the future of cannabis.
              </p>

              <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-800 font-medium text-sm">
                  {initialCompanies.length} companies listed nationwide
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Filters */}
          <CompanyFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            companyTypes={companyTypes}
            selectedCompanyType={selectedCompanyType}
            onCompanyTypeChange={setSelectedCompanyType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalCount={initialCompanies.length}
            filteredCount={filteredCompanies.length}
          />

          {/* Companies Grid */}
          {filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <Link href={`/companies/${company.slug}/`} className="block h-full">
                    {/* Company Logo */}
<div className="flex items-center justify-center">
  <CompanyLogo 
    featuredImage={company.featuredImage}
    title={company.title}
    className="w-35 h-48 border-b border-gray-100"
  />
</div>
                    
                    {/* Company Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-3 line-clamp-2 leading-tight">
                        {company.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {getCleanDescription(company.content)}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-green-600 text-sm font-semibold group-hover:text-green-700 transition-colors">
                          View Details
                        </span>
                        <div className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || selectedCategory || selectedCompanyType
                  ? "Try adjusting your search terms or filters to find more companies."
                  : "Check back later as we continue to add more companies to our directory."
                }
              </p>
              {(searchQuery || selectedCategory || selectedCompanyType) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedCompanyType('')
                  }}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {/* Enhanced Call to Action */}
          <div className="mt-20 bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-3xl shadow-2xl text-white p-8 lg:p-12 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                List Your Cannabis Company
              </h2>
              
              <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
                Connect with patients, partners, and industry professionals. Join Australia&apos;s most comprehensive cannabis company directory.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Get Listed Today
                </Link>
                
                <Link 
                  href="/about" 
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-green-700 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}