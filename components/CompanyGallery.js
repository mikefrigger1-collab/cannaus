'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

// Interactive Image Gallery Component with Slider
export default function CompanyGallery({ featuredImage, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

      // Keyboard navigation
    useEffect(() => {
      const handleKeyPress = (e) => {
        if (!isModalOpen) return;
        
        if (e.key === 'ArrowLeft') {
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
        } else if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isModalOpen, nextSlide, prevSlide]);
    

  if (!featuredImage) return null;
  
  try {
    const imageData = typeof featuredImage === 'string' 
      ? JSON.parse(featuredImage) 
      : featuredImage;
    
    // Check if gallery exists
    if (!imageData.gallery || !Array.isArray(imageData.gallery) || imageData.gallery.length === 0) {
      return null;
    }
    
    const galleryImages = imageData.gallery;
    
    // Navigation functions
    const nextSlide = () => {
      setCurrentIndex((prevIndex) => 
        prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
      );
    };
    
    const prevSlide = () => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
      );
    };
    
    const goToSlide = (index) => {
      setCurrentIndex(index);
    };
    
    // Touch handlers for swipe functionality
    const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
    };
    
    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
    
    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      
      if (isLeftSwipe) {
        nextSlide();
      }
      if (isRightSwipe) {
        prevSlide();
      }
    };
    

    const openModal = (index) => {
      setCurrentIndex(index);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    };
    
    const closeModal = () => {
      setIsModalOpen(false);
      document.body.style.overflow = 'unset';
    };
    
    return (
      <>
        <section className="mt-8">
          
          {/* Main Slider */}
          <div className="relative">
            <div 
              className="relative h-96 overflow-hidden rounded-lg shadow-lg"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {galleryImages.map((image, index) => (
                  <div 
                    key={index}
                    className="w-full h-full flex-shrink-0 relative cursor-pointer group"
                    onClick={() => openModal(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${title} - Gallery Image ${index + 1}`}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-opacity-10 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2  bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 " />
                  </button>
                </>
              )}
              

            </div>
            
            {/* Thumbnail navigation */}
            {galleryImages.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex 
                        ? 'border-green-800 ring-2 ring-green-800' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            

          </div>
        </section>
        
        {/* Modal for full-screen view */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                aria-label="Close modal"
              >
                <X className="w-8 h-8" />
              </button>
              
              {/* Modal image container */}
              <div 
                className="relative max-w-7xl max-h-full"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <Image
                  src={galleryImages[currentIndex]?.url}
                  alt={galleryImages[currentIndex]?.alt || `${title} - Gallery Image ${currentIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  sizes="100vw"
                />
                
                {/* Modal navigation */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Modal image info */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white">
                <p className="text-lg mb-1">
                  {galleryImages[currentIndex]?.alt || `Gallery Image ${currentIndex + 1}`}
                </p>
                <p className="text-sm text-gray-300">
                  {currentIndex + 1} of {galleryImages.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('Error parsing gallery images:', error);
    return null;
  }
}