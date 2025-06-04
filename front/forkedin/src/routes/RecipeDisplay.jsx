import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/RecipeDisplay.css"
import axios from "axios";

export default function RecipeDisplay() {
    const [searchTerm, setSearchTerm] = useState("");
    const [recipes, setRecipes] = useState([]);
    const navigate = useNavigate();

    const handleSearch = async () => {
      if (searchTerm.trim() === "") return;

      console.log("my fellow brother, let's search for this shi");
      try {
        console.log(searchTerm)
        const res = await axios.get(`http://localhost:5001/recipedisplay/official?query=${searchTerm}`)
        setRecipes(res.data);
        console.log(res);
        console.log(res.data);
      } catch (error) {
        console.error("bruh food gone gang", error)
      }
    }

    const handleRecipeClick = (recipeUri) => {
      // Navigate to the detailed recipe page using the recipe URI as the ID
      navigate(`/recipedisplay/${encodeURIComponent(recipeUri)}`);
    }

    useEffect(() => {
      async function fetchRecipes() {
        try {
          const res = await axios.get(`http://localhost:5001/recipedisplay/default?query=Indian`)
          setRecipes(res.data);
          console.log(res.data);
        } catch (error) {
          console.error("bruh where the chicken at")
        }
      }
  
      fetchRecipes();
    }, []);

    return (
        <>
        <div className="header-container">
             <input
          type="text"
          className="search-bar"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
            <button className="button-orange" />
            <button className="button-green" onClick={handleSearch}/>
        </div>
        <div className="grid-container">
      {recipes.map((item, i) => {
  const recipe = item.recipe;
    return (
      <div 
        className="card" 
        key={i}
        onClick={() => handleRecipeClick(recipe.uri)}
        style={{ cursor: 'pointer' }}
      >
        <div className="image-placeholder">
          {recipe.image && <img src={recipe.image} alt={recipe.label} />}
        </div>
        <div className="card-name">{recipe.label}</div>
        <div className="divider"></div>
        <div className="card-info">
          <div><strong>{Math.round(recipe.calories)}</strong> calories</div>
          <div className="divider2"></div>
          <div>
            <div>{recipe.yield} servings</div>
            <div>{recipe.ingredients?.length || 0} ingredients</div>
          </div>
        </div>
      </div>
    );
  })}
    </div>

        </>
    )
}