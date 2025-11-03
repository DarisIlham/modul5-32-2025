// src/utils/imageCache.js

const IMAGE_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 50; // Maximum number of images to keep in cache

/**
 * Preload and cache an image
 * @param {string} src - Image URL to cache
 * @returns {Promise} - Promise that resolves when image is loaded
 */
export function preloadImage(src) {
  if (!src) return Promise.reject('No image source provided');
  
  // Check if image is already cached and not expired
  const cached = IMAGE_CACHE.get(src);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Update timestamp to keep frequently accessed images in cache
    cached.timestamp = Date.now();
    IMAGE_CACHE.set(src, cached);
    return Promise.resolve(cached.blob);
  }

  // Load and cache the image
  return fetch(src)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.blob();
    })
    .then(blob => {
      // Clean cache if it exceeds max size
      if (IMAGE_CACHE.size >= MAX_CACHE_SIZE) {
        const oldestEntry = Array.from(IMAGE_CACHE.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
        if (oldestEntry) {
          URL.revokeObjectURL(oldestEntry[1].objectUrl);
          IMAGE_CACHE.delete(oldestEntry[0]);
        }
      }

      // Cache new image
      const objectUrl = URL.createObjectURL(blob);
      IMAGE_CACHE.set(src, {
        blob: blob,
        timestamp: Date.now(),
        objectUrl: objectUrl,
        size: blob.size
      });
      return blob;
    })
    .catch(error => {
      console.error('Error caching image:', error);
      throw error;
    });
}

/**
 * Get cached image URL
 * @param {string} src - Original image URL
 * @returns {string} - Cached object URL or original URL
 */
export function getCachedImageUrl(src) {
  const cached = IMAGE_CACHE.get(src);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.objectUrl;
  }
  return src;
}

/**
 * Clear expired cache entries
 */
export function cleanImageCache() {
  const now = Date.now();
  for (const [key, value] of IMAGE_CACHE.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      URL.revokeObjectURL(value.objectUrl);
      IMAGE_CACHE.delete(key);
    }
  }
}

// Clean cache periodically
setInterval(cleanImageCache, CACHE_DURATION);