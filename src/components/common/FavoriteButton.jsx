// src/components/common/FavoriteButton.jsx
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

/**
 * FavoriteButton Component
 * Toggles favorite status with localStorage support
 */
export default function FavoriteButton({ recipeId, category = 'makanan', recipe = null, onToggle, showCount = false, initialCount = 0, size = 'md' }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // Size variants
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Use composite key to avoid id collisions between makanan/minuman
  const compositeKey = `${category}-${recipeId}`;

  // Check if recipe is favorited on mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorited(favorites.includes(compositeKey));
  }, [compositeKey]);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Toggle in localStorage using composite key
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(compositeKey);

    let newFavoritedState;
    const favoritesData = JSON.parse(localStorage.getItem('favoritesData') || '{}');

    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1);
      // remove metadata
      delete favoritesData[compositeKey];
      newFavoritedState = false;
      setFavoriteCount(prev => Math.max(0, prev - 1));
    } else {
      // Add to favorites
      favorites.push(compositeKey);
      // store minimal metadata if provided
      if (recipe) {
        favoritesData[compositeKey] = {
          id: recipeId,
          category,
          name: recipe.name || recipe.title || '',
          image_url: recipe.image_url || recipe.image || ''
        };
      }
      newFavoritedState = true;
      setFavoriteCount(prev => prev + 1);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('favoritesData', JSON.stringify(favoritesData));
    setIsFavorited(newFavoritedState);

    // Call parent callback if provided
    if (onToggle) {
      // Provide both id and category in callback
      onToggle(recipeId, category, newFavoritedState);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizes[size]} rounded-full flex items-center justify-center gap-1.5
        transition-all duration-200 
        ${isFavorited 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-red-500'
        }
        backdrop-blur-sm shadow-md hover:shadow-lg
        ${isAnimating ? 'scale-125' : 'scale-100'}
        group
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`
          ${iconSizes[size]} 
          transition-all duration-200
          ${isFavorited ? 'fill-current' : ''}
          ${isAnimating ? 'animate-pulse' : ''}
        `} 
      />
      {showCount && favoriteCount > 0 && (
        <span className="text-xs font-semibold">
          {favoriteCount > 999 ? '999+' : favoriteCount}
        </span>
      )}
    </button>
  );
}
