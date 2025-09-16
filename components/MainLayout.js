import GlobalHeader from './GlobalHeader'
import GlobalFooter from './GlobalFooter'

export default function MainLayout({ 
  children, 
  headerProps = {},
  showFooter = true,
  className = ""
}) {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      {/* Global Header */}
      <GlobalHeader {...headerProps} />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Global Footer */}
      {showFooter && <GlobalFooter />}
    </div>
  )
}