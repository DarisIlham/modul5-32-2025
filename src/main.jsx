// src/main.jsx
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import MakananPage from './pages/MakananPage';
import MinumanPage from './pages/MinumanPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeDetail from './components/recipe/RecipeDetail';
import DesktopNavbar from './components/navbar/DesktopNavbar';
import MobileNavbar from './components/navbar/MobileNavbar';
import './index.css'
import PWABadge from './PWABadge';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isListMode = !location.pathname.includes('/recipe/');

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const handleCreateRecipe = () => {
    navigate('/create');
  };

  const handleRecipeClick = (recipeId, category) => {
    navigate(`/${category}/recipe/${recipeId}`);
  };

  const handleEditRecipe = (recipeId) => {
    navigate(`/edit/${recipeId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreateSuccess = (newRecipe) => {
    alert('Resep berhasil dibuat!');
    if (newRecipe && newRecipe.category) {
      navigate(`/${newRecipe.category}`);
    }
  };

  const handleEditSuccess = () => {
    alert('Resep berhasil diperbarui!');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isListMode && (
        <>
          <DesktopNavbar 
            currentPage={location.pathname.split('/')[1] || 'home'} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
          <MobileNavbar 
            currentPage={location.pathname.split('/')[1] || 'home'} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
        </>
      )}
      
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />} />
          <Route path="/home" element={<HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />} />
          <Route path="/makanan" element={<MakananPage onRecipeClick={handleRecipeClick} />} />
          <Route path="/minuman" element={<MinumanPage onRecipeClick={handleRecipeClick} />} />
          <Route path="/favorites" element={<FavoritesPage onRecipeClick={handleRecipeClick} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={<CreateRecipePage onBack={handleBack} onSuccess={handleCreateSuccess} />} />
          <Route path="/edit/:recipeId" element={<EditRecipePage onBack={handleBack} onSuccess={handleEditSuccess} />} />
          <Route path="/:category/recipe/:recipeId" element={
            <RecipeDetailWrapper onBack={handleBack} onEdit={handleEditRecipe} />
          } />
        </Routes>
      </main>

      <PWABadge />
    </div>
  );

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isListMode && (
        <>
          <DesktopNavbar 
            currentPage={location.pathname.split('/')[1] || 'home'} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
          <MobileNavbar 
            currentPage={location.pathname.split('/')[1] || 'home'} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
        </>
      )}
      
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />} />
          <Route path="/home" element={<HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />} />
          <Route path="/makanan" element={<MakananPage onRecipeClick={handleRecipeClick} />} />
          <Route path="/minuman" element={<MinumanPage onRecipeClick={handleRecipeClick} />} />
          <Route path="/favorites" element={<FavoritesPage onRecipeClick={handleRecipeClick} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={<CreateRecipePage onBack={handleBack} onSuccess={handleCreateSuccess} />} />
          <Route path="/edit/:recipeId" element={<EditRecipePage onBack={handleBack} onSuccess={handleEditSuccess} />} />
          <Route path="/:category/recipe/:recipeId" element={
            <RecipeDetailWrapper onBack={handleBack} onEdit={handleEditRecipe} />
          } />
        </Routes>
      </main>

      <PWABadge />
    </div>
  );
}

// Wrapper component to handle URL parameters for RecipeDetail
function RecipeDetailWrapper({ onBack, onEdit }) {
  const { category, recipeId } = useParams();
  return (
    <RecipeDetail
      recipeId={recipeId}
      category={category}
      onBack={onBack}
      onEdit={onEdit}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

