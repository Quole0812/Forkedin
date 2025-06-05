import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/AdminViewPage.css";
import defaultPfp from "../../assets/pfp.png";
import foodPlaceholder from "../../assets/food-placeholder.png";

const AdminViewPage = () => {
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnpublished = async () => {
      try {
        const res = await fetch("http://localhost:5001/recipedisplay/unpublished");
        const data = await res.json();

        // Fetch each author's full name and image
        const enrichedData = await Promise.all(
          data.map(async (recipe) => {
            try {
              const userRes = await fetch(`http://localhost:5001/users/${recipe.authorId}`);
              const userData = await userRes.json();
              return {
                ...recipe,
                authorName: userData.fullName || "Unknown User",
                userImage: userData.image || null
              };
            } catch {
              return {
                ...recipe,
                authorName: "Unknown User",
                userImage: null
              };
            }
          })
        );

        setPendingRecipes(enrichedData);
      } catch (err) {
        console.error("Failed to fetch unpublished recipes", err);
      }
    };
    fetchUnpublished();
  }, []);

  const handlePublish = async (id) => {
    try {
      await fetch(`http://localhost:5001/recipedisplay/publish/${id}`, { method: "PATCH" });
      setPendingRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to publish recipe", err);
    }
  };

  return (
    <div className="admin-list">
      <h2>Pending Recipes</h2>
      {pendingRecipes.length > 0 ? (
        pendingRecipes.map(recipe => (
          <div key={recipe.id} className="admin-list-item">
              <img
                src={recipe.image?.trim() || foodPlaceholder}
                className="recipe-img"
                alt={recipe.name}
              />
            <div className="recipe-info">
              <div className="user-info">
                <img src={recipe.userImage || defaultPfp} className="user-pfp" alt="User profile" />
                <span>{recipe.authorName}</span>
              </div>
              <h3>{recipe.name}</h3>
              <p>{recipe.yieldAmt} servings • {recipe.ingredients?.length || 0} ingredients • {Math.round(recipe.calories || 0)} cal</p>
            </div>
            <div className="publish-btn-container">
              <button onClick={() => handlePublish(recipe.id)} className="publish-btn">Publish</button>
            </div>
          </div>
        ))
      ) : (
        <p>No unpublished recipes</p>
      )}
    </div>
  );
};

export default AdminViewPage;