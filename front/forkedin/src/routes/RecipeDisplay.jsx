import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/RecipeDisplay.css"
import axios from "axios";
import { useAuth } from "../components/AuthContext"
import beforeimg from "../assets/bookmark-before-click.png"
import afterimg from "../assets/bookmark-after-click.png"

export default function RecipeDisplay() {
    const [searchTerm, setSearchTerm] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [dbrecipes, setdbRecipes] = useState([]);
    const [filterRecipes, setFilterRecipes] = useState(false);
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [user, setUser] = useState(null);


    // console.log(currentUser);

      useEffect(() => {

    if (!currentUser || !currentUser.uid) {
      return;
    }

      async function fetchUser() {
        try {
          const res = await axios.get(
            `http://localhost:5001/recipedisplay/user/${currentUser.uid}`
          );
          setUser(res.data);
          console.log("here da user");
          console.log(res.data);
        } catch (error) {
          console.error("Error fetching user:", error);
        } 
      }

      fetchUser();
    }, [currentUser]); 



   const handleBookmark = async (recipeid) => {
  const isSaved = user?.saved?.includes(recipeid);

  if (!isSaved) {
    // Add bookmark
    try {
      console.log("Adding bookmark:", recipeid);
      await axios.put(
        `http://localhost:5001/recipedisplay/user/${currentUser.uid}/${encodeURIComponent(recipeid)}`
      );

      setUser((prevUser) => ({
        ...prevUser,
        saved: prevUser?.saved
          ? [...prevUser.saved, recipeid]
          : [recipeid],
      }));
    } catch (error) {
      console.log("yo i cant add the bookmark", error);
    }
  } else {
    // Remove bookmark
    try {
      console.log("Removing bookmark:", recipeid);
      await axios.delete(
        `http://localhost:5001/recipedisplay/user/${currentUser.uid}/${encodeURIComponent(recipeid)}`
      );

      setUser((prevUser) => ({
        ...prevUser,
        saved: prevUser?.saved?.filter(id => id !== recipeid),
      }));
    } catch (error) {
      console.log("yo i cant remove the bookmark", error);
    }
  }
};



    const handleSearch = async () => {
      if (searchTerm.trim() === "") {
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
      async function fetchRecipes2() {
        try {
          const res = await axios.get(`http://localhost:5001/recipedisplay/user`)
          setdbRecipes(res.data);
          console.log("heres the db stuff")
          console.log(res.data);
        } catch (error) {
          console.error("bruh where the db recipe at");
        }
      }
  
      fetchRecipes2();
    }
      console.log("my fellow brother, let's search for this shi");
      try {
        console.log(searchTerm)
        const res = await axios.get(`http://localhost:5001/recipedisplay/official?query=${searchTerm}`)
        setRecipes(res.data);
        // console.log(res);
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


    useEffect(() => {
      async function fetchRecipes2() {
        try {
          const res = await axios.get(`http://localhost:5001/recipedisplay/user`)
          setdbRecipes(res.data);
          console.log("heres the db stuff")
          console.log(res.data);
        } catch (error) {
          console.error("bruh where the db recipe at", error);
        }
      }
  
      fetchRecipes2();
    }, []);

    const dbrecipespublished = dbrecipes.filter(recipe => recipe.published !== false);

    const filtereddbrecipes = dbrecipespublished.filter(recipe => recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedRecipes = filterRecipes ? filtereddbrecipes : recipes;
    return (
        <>
        <div className="header-container">
            <input
          type="text"
          className="search-bar"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          
          
        />
        {/* <button className="button-green" onClick={handleSearch}/> */}
        </div>
        <div className="switch-spot">
          <input type="checkbox" id="user-created" name="user-created" onClick={() => setFilterRecipes(prev => !prev)}/>
          <div className="spacing"></div>
          <label>filter by Users Created</label>
        </div>



        <div className="grid-container">
      {displayedRecipes.map((item, i) => {
        let recipe;
        if (!filterRecipes) {
          recipe = item.recipe;
        } else {
          recipe = item;
        }
    return (
      <div 
        className="card" 
        key={i}
        onClick={() => handleRecipeClick(recipe.uri)}
        style={{ cursor: 'pointer' }}
      >
        <div 
          className="bookmark-icon"
          onClick={(e) => {
            e.stopPropagation();
            const recipeId = filterRecipes ? recipe.id : recipe.uri;
            handleBookmark(recipeId);
          }}
        >
          <img 
            src={
              user?.saved?.includes(filterRecipes ? recipe.id : recipe.uri)
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
      : "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={recipe.label}
        />

        </div>
        <div className="card-name">{recipe.label || recipe.name}</div>
        <div className="divider"></div>
        <div className="card-info">
          <div >
            <span className="highlight-number">{Math.round(recipe.calories)}</span> calories
          </div>
          <div className="divider2"></div>
          <div>
            <div><span className="highlight-number">{recipe.yield}</span> servings</div>
            <div><span className="highlight-number">{recipe.ingredients?.length || 0}</span> ingredients</div>
          </div>
        </div>
        {/* <div><button className="button-13"
        onClick={(e) => {
          e.stopPropagation();
          const recipeId = filterRecipes ? recipe.id : recipe.uri;
          handleBookmark(recipeId);
        }}
        >Bookmark</button></div> */}
      </div>
    );
  })}
    </div>

        </>
    )
}