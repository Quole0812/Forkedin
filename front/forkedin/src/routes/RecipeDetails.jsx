import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RecipeDetails.css";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5001/recipedisplay/recipe/${encodeURIComponent(id)}`);
        setRecipe(res.data.recipe);
        console.log("Recipe data:", res.data.recipe);
      } catch (error) {
        console.error("Failed to fetch recipe details:", error);
        setError("Failed to load recipe details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Loading recipe...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/recipedisplay')} className="back-button">
          Back to Recipes
        </button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="error-container">
        <div className="error">Recipe not found</div>
        <button onClick={() => navigate('/recipedisplay')} className="back-button">
          Back to Recipes
        </button>
      </div>
    );
  }

  const formatNutrient = (nutrient) => {
    if (!nutrient) return null;
    return `${Math.round(nutrient.quantity)}${nutrient.unit}`;
  };

  const keyNutrients = ['ENERC_KCAL', 'PROCNT', 'FAT', 'CHOCDF', 'FIBTG', 'SUGAR'];

  return (
    <div className="recipe-details-container">
      <button onClick={() => navigate('/recipedisplay')} className="back-button">
        ← Back to Recipes
      </button>
      
      <div className="recipe-header">
        <div className="recipe-image-container">
          {recipe.image && (
            <img src={recipe.image} alt={recipe.label} className="recipe-image" />
          )}
          
          {/* Move cautions/allergies under the image */}
          {recipe.cautions && recipe.cautions.length > 0 && (
            <section className="cautions-section-header">
              <h3>⚠️ Cautions & Allergies</h3>
              <ul className="cautions-list">
                {recipe.cautions.map((caution, index) => (
                  <li key={index} className="caution-item">{caution}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        
        <div className="recipe-basic-info">
          <h1 className="recipe-title">{recipe.label}</h1>
          <p className="recipe-source">Source: {recipe.source}</p>
          {recipe.url && (
            <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="original-recipe-link">
              View Original Recipe & Instructions
            </a>
          )}
          
          <div className="recipe-stats">
            <div className="stat">
              <span className="stat-value">{Math.round(recipe.calories)}</span>
              <span className="stat-label">Calories</span>
            </div>
            <div className="stat">
              <span className="stat-value">{recipe.yield}</span>
              <span className="stat-label">Servings</span>
            </div>
            <div className="stat">
              <span className="stat-value">{recipe.ingredients?.length || 0}</span>
              <span className="stat-label">Ingredients</span>
            </div>
            {recipe.totalTime && (
              <div className="stat">
                <span className="stat-value">{recipe.totalTime}</span>
                <span className="stat-label">Minutes</span>
              </div>
            )}
          </div>

          {/* Recipe Type Tags */}
          <div className="recipe-types">
            {recipe.cuisineType && recipe.cuisineType.length > 0 && (
              <div className="type-group">
                <span className="type-label">Cuisine:</span>
                <div className="type-tags">
                  {recipe.cuisineType.map((type, index) => (
                    <span key={index} className="type-tag cuisine-tag">{type}</span>
                  ))}
                </div>
              </div>
            )}
            
            {recipe.mealType && recipe.mealType.length > 0 && (
              <div className="type-group">
                <span className="type-label">Meal:</span>
                <div className="type-tags">
                  {recipe.mealType.map((type, index) => (
                    <span key={index} className="type-tag meal-tag">{type}</span>
                  ))}
                </div>
              </div>
            )}
            
            {recipe.dishType && recipe.dishType.length > 0 && (
              <div className="type-group">
                <span className="type-label">Dish:</span>
                <div className="type-tags">
                  {recipe.dishType.map((type, index) => (
                    <span key={index} className="type-tag dish-tag">{type}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {recipe.dietLabels && recipe.dietLabels.length > 0 && (
            <div className="labels">
              <h3>Diet Labels:</h3>
              <div className="label-tags">
                {recipe.dietLabels.map((label, index) => (
                  <span key={index} className="label-tag diet-label">{label}</span>
                ))}
              </div>
            </div>
          )}

          {recipe.healthLabels && recipe.healthLabels.length > 0 && (
            <div className="labels">
              <h3>Health Labels:</h3>
              <div className="label-tags">
                {recipe.healthLabels.slice(0, 8).map((label, index) => (
                  <span key={index} className="label-tag health-label">{label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="recipe-content">
        <div className="recipe-main">
          <section className="ingredients-section">
            <h2>Ingredients</h2>
            <ul className="ingredients-list">
              {recipe.ingredientLines.map((ingredient, index) => (
                <li key={index} className="ingredient-item">{ingredient}</li>
              ))}
            </ul>
          </section>

          <section className="instructions-section">
            <h2>Cooking Instructions</h2>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <ol className="instructions-list">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="instruction-item">{instruction}</li>
                ))}
              </ol>
            ) : (
              <div className="no-instructions">
                <p>Detailed cooking instructions are not available for this recipe.</p>
                {recipe.url && (
                  <p>
                    Please visit the{" "}
                    <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="original-recipe-link">
                      original recipe source
                    </a>{" "}
                    for complete cooking directions.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="recipe-sidebar">
          <section className="nutrition-section">
            <h2>Nutrition Facts</h2>
            <div className="nutrition-per-serving">
              <p>Per serving (serves {recipe.yield})</p>
            </div>
            
            {recipe.totalNutrients && (
              <div className="nutrition-list">
                {keyNutrients.map(nutrientKey => {
                  const nutrient = recipe.totalNutrients[nutrientKey];
                  if (!nutrient) return null;
                  return (
                    <div key={nutrientKey} className="nutrition-item">
                      <span className="nutrition-label">{nutrient.label}</span>
                      <span className="nutrition-value">{formatNutrient(nutrient)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {recipe.totalDaily && (
              <div className="daily-values">
                <h3>% Daily Value</h3>
                {keyNutrients.map(nutrientKey => {
                  const daily = recipe.totalDaily[nutrientKey];
                  if (!daily) return null;
                  return (
                    <div key={nutrientKey} className="daily-item">
                      <span className="daily-label">{daily.label}</span>
                      <span className="daily-value">{Math.round(daily.quantity)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
} 