import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/RecipeDisplay.css";
import "../../styles/SavedPage.css";

import beforeimg from "../../assets/bookmark-before-click.png";
import afterimg from "../../assets/bookmark-after-click.png";

const SavedPage = () => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch saved recipe data
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const userRes = await fetch(
          `http://localhost:5001/recipedisplay/user/${currentUser.uid}`
        );
        const userData = await userRes.json();
        setUser(userData);

        if (!userData.saved || userData.saved.length === 0) {
          setRecipes([]);
          return;
        }

        const recipeRes = await fetch("http://localhost:5001/recipes-by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: userData.saved }),
        });

        const data = await recipeRes.json();
        setRecipes(data);
      } catch (err) {
        console.error("Error loading saved recipes:", err);
      }
    };

    if (currentUser?.uid) {
      fetchSavedRecipes();
    }
  }, [currentUser]);

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipedisplay/${encodeURIComponent(recipeId)}`);
  };

  const handleBookmarkToggle = async (recipeId) => {
    try {
      await fetch(
        `http://localhost:5001/recipedisplay/user/${currentUser.uid}/${encodeURIComponent(recipeId)}`,
        {
          method: "DELETE",
        }
      );

      setUser((prevUser) => ({
        ...prevUser,
        saved: prevUser.saved.filter((id) => id !== recipeId),
      }));

      setRecipes((prevRecipes) =>
        prevRecipes.filter(
          (r) => (r.uri || r.id) !== recipeId
        )
      );
    } catch (err) {
      console.error("Failed to unsave recipe:", err);
    }
  };

  return (
    <div>
      <h2>Saved Recipes</h2>
      {recipes.length > 0 ? (
        <div className="saved-wrapper">
          <div className="grid-container">
            {recipes.map((recipe, i) => {
              const recipeId = recipe.uri || recipe.id;
              return (
                <div
                  className="card"
                  key={i}
                  onClick={() => handleRecipeClick(recipeId)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="bookmark-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(recipeId);
                    }}
                  >
                    <img
                      src={
                        user?.saved?.includes(recipeId)
                          ? afterimg
                          : beforeimg
                      }
                      alt="Bookmark"
                    />
                  </div>
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
                      <span className="highlight-number">
                        {Math.round(recipe.calories || 0)}
                      </span>{" "}
                      calories
                    </div>
                    <div className="divider2"></div>
                    <div>
                      <div>
                        <span className="highlight-number">
                          {recipe.yield || 1}
                        </span>{" "}
                        servings
                      </div>
                      <div>
                        <span className="highlight-number">
                          {recipe.ingredients?.length || 0}
                        </span>{" "}
                        ingredients
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p>You haven't saved any recipes yet.</p>
      )}
    </div>
  );
};

export default SavedPage;
