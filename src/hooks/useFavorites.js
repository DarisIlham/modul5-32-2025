import { useState, useEffect, useCallback } from 'react';
import favoriteService from '../services/favoriteService';
import userService from '../services/userService';

/**
 * Get user identifier from localStorage or generate new one
 */
const getUserIdentifier = () => {
  return userService.getUserIdentifier();
};

/**
 * Custom hook for fetching favorites
 * @returns {Object} - { favorites, loading, error, refetch }
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userIdentifier = getUserIdentifier();

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoriteService.getFavorites(userIdentifier);
      
      if (response.success) {
        setFavorites(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch favorites');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userIdentifier]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
  };
}

/**
 * Custom hook for toggling favorites
 * @returns {Object} - { toggleFavorite, loading, error }
 */
export function useToggleFavorite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userIdentifier = getUserIdentifier();

  const toggleFavorite = async (recipeId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await favoriteService.toggleFavorite({
        recipe_id: recipeId,
        user_identifier: userIdentifier,
      });
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to toggle favorite');
        return null;
      }
    } catch (err) {
      setError(err.message || 'An error occurred while toggling favorite');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleFavorite,
    loading,
    error,
  };
}

/**
 * Custom hook to check if a recipe is favorited
 * @param {string} recipeId - Recipe ID
 * @returns {Object} - { isFavorited, loading, toggleFavorite }
 */
export function useIsFavorited(recipeId, category) {
  // LocalStorage-backed favoriting to support offline/demo mode and
  // avoid dependence on the backend for favorites UI.
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!recipeId) {
      setIsFavorited(false);
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (category) {
      setIsFavorited(favorites.includes(`${category}-${recipeId}`));
    } else {
      // If category not provided, check any favorite that ends with -{id}
      setIsFavorited(favorites.some(f => f.endsWith(`-${recipeId}`)));
    }
  }, [recipeId, category]);

  const toggleFavorite = async () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let key = category ? `${category}-${recipeId}` : null;

    if (!key) {
      // If no explicit category, try to find an existing saved favorite for this id
      const found = favorites.find(f => f.endsWith(`-${recipeId}`));
      key = found || `makanan-${recipeId}`; // default to makanan if nothing found
    }

    const idx = favorites.indexOf(key);
    if (idx > -1) {
      favorites.splice(idx, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(false);
      return { removed: true };
    } else {
      favorites.push(key);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(true);
      return { added: true };
    }
  };

  return {
    isFavorited,
    loading: false,
    toggleFavorite,
  };
}

export { getUserIdentifier };
