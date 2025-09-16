"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Divide } from 'lucide-react'

export default function GlobalHeader({ 
  showLogo = true, 
  showNavigation = true, 
  showSubtitle = false,
  categoryStats = [] 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  // Helper function to format state names
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

  // Handle scroll behavior for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Check if we've scrolled past 50px for styling
      setIsScrolled(currentScrollY > 50)
      
      // Show/hide logic: hide when scrolling down past 100px, show when scrolling up
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
      } else {
        // Always show when near top
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  // Handle burger menu toggle
  const toggleMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  // Close menu when clicking outside
  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Desktop Header - Full Size */}
      <header className="hidden lg:block font-playfair">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
          <div className="text-center">
            {/* Logo Section */}
            {showLogo && (
              <div className="mb-8">
                <Link href="/">
                  <Image
                    src="/images/logo/cannaus-logo.png"
                    alt="Cannaus Logo"
                    width={200}
                    height={100}
                    priority
                    className="mx-auto cursor-pointer"
                  />
                </Link>
              </div>
            )}
            
            {/* Main Navigation */}
            {showNavigation && (
              <nav className="mt-2 border-t border-b border-gray-200 py-4">
                <div className="flex justify-center space-x-16">
                  
                  {/* HOME - with animated underline */}
                  <div className="relative group">
                    <Link 
                      href="/" 
                      className="nav-link text-base font-medium text-gray-800 hover:text-green-600 transition-colors tracking-wide pb-1 relative font-playfair"
                    >
                      HOME
                    </Link>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 ease-out group-hover:w-full"></div>
                  </div>
                  
                  {/* STATE NEWS - with dropdown and animated underline */}
                  <div className="relative group">
                    <div 
                    
                      className="nav-link text-base font-medium text-gray-800 hover:text-green-600 transition-colors tracking-wide pb-1 relative font-playfair"
                    >
                      STATE NEWS
                    </div>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 ease-out group-hover:w-full"></div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-64 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="p-4">
                        {/* States Section */}
                        <div className="text-left">
                          <Link href="/nsw/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">New South Wales</Link>
                          <Link href="/vic/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">Victoria</Link>
                          <Link href="/qld/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">Queensland</Link>
                          <Link href="/wa/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">Western Australia</Link>
                          <Link href="/sa/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">South Australia</Link>
                          <Link href="/tas/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">Tasmania</Link>
                          <Link href="/act/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">Australian Capital Territory</Link>
                          <Link href="/nt/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">Northern Territory</Link>
                        </div>
                        
                        {/* Separator */}
                        <div className="border-t border-gray-200 my-3"></div>
                        
                        {/* National & International Section */}
                        <div className="text-left">
                          <Link href="/national/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">NATIONAL NEWS</Link>
                          <Link href="/international/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 hover:font-bold rounded transition-all duration-200 font-playfair">INTERNATIONAL NEWS</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* CANNABIS COMPANIES - with animated underline */}
                  <div className="relative group">
                    <Link 
                      href="/companies/" 
                      className="nav-link text-base font-medium text-gray-800 hover:text-green-600 transition-colors tracking-wide pb-1 relative font-playfair"
                    >
                      CANNABIS COMPANIES
                    </Link>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 ease-out group-hover:w-full"></div>
                  </div>
                </div>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Header */}
      <header 
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out font-playfair ${
          isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
        } ${
          isScrolled 
            ? 'bg-white shadow-lg border-b border-gray-200' 
            : 'bg-white'
        }`}
      >
        <div className="px-4 py-3 relative">
          <div className="flex items-center justify-center">
            {/* Logo - Centered */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logo/cannaus-logo.png"
                alt="Cannaus Logo"
                width={120}
                height={60}
                priority
                className="cursor-pointer"
              />
            </Link>

            {/* Hamburger Menu Button - Absolute positioned */}
            <button
              type="button"
              onClick={toggleMenu}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <span 
                  className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                ></span>
                <span 
                  className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                ></span>
                <span 
                  className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 font-playfair"
          onClick={closeMenu}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          
          {/* Menu Content */}
          <div 
            className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 font-playfair">Navigation</h2>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-2 px-4">
                  {/* Home */}
                  <Link 
                    href="/"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors font-medium font-playfair"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>

                  {/* State News Section */}
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider font-playfair">
                      State News
                    </div>
                    <div className="space-y-1 ml-4">
                      {[
                        { code: 'nsw', name: 'New South Wales' },
                        { code: 'vic', name: 'Victoria' },
                        { code: 'qld', name: 'Queensland' },
                        { code: 'wa', name: 'Western Australia' },
                        { code: 'sa', name: 'South Australia' },
                        { code: 'tas', name: 'Tasmania' },
                        { code: 'act', name: 'Australian Capital Territory' },
                        { code: 'nt', name: 'Northern Territory' }
                      ].map((state) => (
                        <Link
                          key={state.code}
                          href={`/${state.code}/`}
                          onClick={closeMenu}
                          className="block px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors font-playfair"
                        >
                          {state.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* National & International */}
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider font-playfair">
                      News
                    </div>
                    <div className="space-y-1 ml-4">
                      <Link
                        href="/national/"
                        onClick={closeMenu}
                        className="block px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors font-playfair"
                      >
                        National News
                      </Link>
                      <Link
                        href="/international/"
                        onClick={closeMenu}
                        className="block px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors font-playfair"
                      >
                        International News
                      </Link>
                    </div>
                  </div>

                  {/* Cannabis Companies */}
                  <Link 
                    href="/companies/"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors font-medium font-playfair"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Cannabis Companies
                  </Link>
                </nav>
              </div>

              {/* Menu Footer */}
              <div className="border-t border-gray-200 p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-playfair">
                    Australia&apos;s Cannabis News
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header Spacer */}
      <div className="lg:hidden h-16"></div>
    </>
  )
}