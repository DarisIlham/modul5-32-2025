// src/components/common/CachedImage.jsx
import { useState, useEffect, useRef } from 'react';
import { preloadImage, getCachedImageUrl } from '../../utils/imageCache';

export default function CachedImage({ src, alt, className, threshold = 0.1, ...props }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: threshold,
        rootMargin: '50px' // Start loading images 50px before they enter viewport
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  // Handle image loading when in view
  useEffect(() => {
    if (!isInView) return;

    const cachedUrl = getCachedImageUrl(src);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    preloadImage(src)
      .then(() => {
        setImageUrl(getCachedImageUrl(src));
        setIsLoading(false);
      })
      .catch(() => {
        setImageUrl(src); // Fallback to original URL on error
        setIsLoading(false);
      });
  }, [src, isInView]);

  return (
    <div ref={imageRef} className={`relative ${className || ''}`}>
      {isInView && (
        <>
          <img
            src={imageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} // Transparent placeholder
            alt={alt}
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            {...props}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse">
              <div className="h-full w-full flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}
        </>
      )}
      {!isInView && (
        <div className="absolute inset-0 bg-gray-100" style={{ aspectRatio: props.aspectRatio || '16/9' }} />
      )}
    </div>
  );
}