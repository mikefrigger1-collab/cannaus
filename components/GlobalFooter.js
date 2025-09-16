import Link from 'next/link'
import Image from 'next/image'

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear()
  
  const stateLinks = [
    { code: 'nsw', name: 'NSW' },
    { code: 'vic', name: 'VIC' },
    { code: 'qld', name: 'QLD' },
    { code: 'wa', name: 'WA' },
    { code: 'sa', name: 'SA' },
    { code: 'tas', name: 'TAS' },
    { code: 'act', name: 'ACT' },
    { code: 'nt', name: 'NT' }
  ]

  const quickLinks = [
    { href: '/', label: 'Latest News' },
    { href: '/companies/', label: 'Companies' },
    { href: '/data/', label: 'Industry Data' },
    { href: '/national/', label: 'National News' },
    { href: '/international/', label: 'International' }
  ]

  const legalLinks = [
    { href: '/contact/', label: 'Contact' },
    { href: '/privacy/', label: 'Privacy' },
    { href: '/terms/', label: 'Terms' },
    { href: '/disclaimer/', label: 'Disclaimer' },
    { href: '/sitemap/', label: 'Sitemap' }
  ]

  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* About Section */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="mb-6">
                <Image
  src="/images/logo/cannaus-logo.png"
  alt="Cannaus - Australian Cannabis News"
  width={200}
  height={100}
  className="mx-auto mb-8"
  priority
/>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 text-center">
                  Australia&apos;s comprehensive cannabis industry resource. Stay informed with the latest news, 
                  regulations, and company insights across all states and territories.
                </p>
<div className="text-center">
  <Link 
    href="/about/" 
    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
  >
    Learn more
    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Link>
</div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Navigate</h3>
              <ul className="text-center !pl-0">
                {quickLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link 
                      href={href} 
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
{/* States */}
<div>
  <h3 className="font-semibold text-gray-900 mb-4 text-center">By State</h3>
  <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-center">
    {stateLinks.map(({ code, name }) => (
      <Link 
        key={code}
        href={`/${code}/`} 
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        {name}
      </Link>
    ))}
  </div>
</div>
            
            {/* Legal & Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Support</h3>
              <ul className="text-center !pl-0">
                {legalLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link 
                      href={href} 
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-100 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500">
              © 2017 Cannaus. All rights reserved.
            </div>
            <div className="text-sm text-gray-500 text-center sm:text-right">
              Australian #1 Cannabis News Website
            </div>
          </div>
        </div>
        
        {/* Legal Disclaimer */}
        <div className="border-t border-gray-100 py-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 text-center leading-relaxed !text-[10px]">
              <span className="font-small text-gray-600">Legal Notice:</span> Information provided is for educational purposes only. 
              Not legal advice. Cannaus does not recommend that anyone uses cannabis for medical or adult use purposes unless consulted by a medical professional. Cannabis is a drug and may have negative side effects. Please consult with your doctor to find out if cannabis is right for you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}