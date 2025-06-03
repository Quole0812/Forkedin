import { useState } from "react"
import "../styles/RecipeDisplay.css"
import axios from "axios";



export default function RecipeDisplay() {
    const [searchTerm, setSearchTerm] = useState("");
    const [recipes, setRecipes] = useState([]);

    const handleSearch = async () => {
      if (searchTerm.trim() === "") return;

      console.log("my fellow brother, let's search for this shi");
      try {
        console.log(searchTerm)
        const res = await axios.get(`http://localhost:5001/recipedisplay/recipes/official?query=${searchTerm}`)
        setRecipes(res.data);
        console.log(res);
        console.log(res.data);
      } catch (error) {
        console.error("bruh food gone gang", error)
      }

    }


    






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
      {Array(8).fill().map((_, i) => (
        <div className="card" key={i}>
          <div className="image-placeholder" />
          <div className="card-name">Name</div>
          <div className="card-info">
            <div><strong>#</strong> calories</div>
            <div>
              <div># serving size</div>
              <div># ingredients</div>
            </div>
          </div>
        </div>
      ))}
    </div>

        </>
    )
}