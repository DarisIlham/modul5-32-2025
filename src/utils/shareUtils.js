// src/utils/shareUtils.js

/**
 * Get a shareable link for a recipe
 * @param {Object} recipe - Recipe object
 * @param {string} category - Recipe category ('makanan' or 'minuman')
 * @returns {string} - Full URL for sharing
 */
export function getRecipeShareableLink(recipe, category) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/${category}/recipe/${recipe.id}`;
}

/**
 * Create a share data object for the Web Share API
 * @param {Object} recipe - Recipe object
 * @param {string} category - Recipe category ('makanan' or 'minuman')
 * @returns {Object} - Share data object
 */
export function createShareData(recipe, category) {
  const url = getRecipeShareableLink(recipe, category);
  return {
    title: recipe.name,
    text: `Lihat resep ${recipe.name} di aplikasi resep kami!`,
    url: url
  };
}

/**
 * Share a recipe using the Web Share API if available, or copy link to clipboard
 * @param {Object} recipe - Recipe object
 * @param {string} category - Recipe category ('makanan' or 'minuman')
 * @returns {Promise} - Resolves when sharing is complete
 */
export async function shareRecipe(recipe, category) {
  const shareData = createShareData(recipe, category);
  
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return { success: true, message: 'Berhasil membagikan resep' };
    } else {
      await navigator.clipboard.writeText(shareData.url);
      return { success: true, message: 'Link telah disalin ke clipboard' };
    }
  } catch (error) {
    console.error('Error sharing:', error);
    return { 
      success: false, 
      message: 'Gagal membagikan resep. Silakan coba lagi.' 
    };
  }
}