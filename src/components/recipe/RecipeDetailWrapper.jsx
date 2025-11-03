// src/components/recipe/RecipeDetailWrapper.jsx
import { useParams, useNavigate } from 'react-router-dom';
import RecipeDetail from './RecipeDetail';
import PropTypes from 'prop-types';

RecipeDetailWrapper.propTypes = {
  onBack: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default function RecipeDetailWrapper({ onBack, onEdit }) {
  const { category, recipeId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    // If there's a previous page in history, go back
    // Otherwise navigate to the category page
    if (window.history.length > 2) {
      onBack();
    } else {
      navigate(`/${category}`);
    }
  };

  return (
    <RecipeDetail
      recipeId={recipeId}
      category={category}
      onBack={handleBack}
      onEdit={onEdit}
    />
  );
}