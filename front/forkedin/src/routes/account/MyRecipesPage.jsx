import React, { useEffect, useState } from 'react';
import { useAuth } from "../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/RecipeDisplay.css"; 
import "../../styles/MyRecipesPage.css";

const MyRecipesPage = () => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreatedRecipes = async () => {
      try {
        const res = await fetch(`http://localhost:5001/recipedisplay/recipes/by-user/${currentUser.uid}`);
        const data = await res.json();
        setRecipes(data);
        console.log(res.data);
      } catch (err) {
        console.error("Error loading created recipes:", err);
      }
    };

    if (currentUser?.uid) {
      fetchCreatedRecipes();
    }
  }, [currentUser]);

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipedisplay/${encodeURIComponent(recipeId)}`);
  };

  return (
    <div>
      <h2>My Recipes</h2>
      {recipes.length > 0 ? (
      <div className="myrecipes-wrapper">
        <div className="grid-container">
          {recipes.map((recipe, i) => (
            <div
              className="card"
              key={i}
              onClick={() => handleRecipeClick(recipe.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="image-placeholder">
                <img
                  src={
                    recipe.image?.trim()
                      ? recipe.image
                      : "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2070&auto=format&fit=crop"
                  }
                  alt={recipe.name}
                />
              </div>
              <div className="card-name">{recipe.label || recipe.name}</div>
              <div className="divider"></div>
              <div className="card-info">
                <div>
                  <span className="highlight-number">{Math.round(recipe.calories || 0)}</span> calories
                </div>
                <div className="divider2"></div>
                <div>
                  <div><span className="highlight-number">{recipe.yield || 1}</span> servings</div>
                  <div><span className="highlight-number">{recipe.ingredients?.length || 0}</span> ingredients</div>
                </div>
              </div>
              <div><button className="button-13">Bookmark</button></div>
            </div>
          ))}
        </div>
      </div> 
      ) : (
        <p>You haven't posted any recipes yet.</p>
      )}
    </div>
  );
};

export default MyRecipesPage;