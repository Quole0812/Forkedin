import React, { useEffect, useRef, useState } from 'react';
import '../styles/Home.css';
import foodImage from '../assets/foodImage.png';
import section3 from '../assets/section3.jpg';
import { useNavigate } from 'react-router-dom';


import ScrollSidebar from '../components/ScrollSidebar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const queries = ["american", "mexican", "italian", "indian", "chinese", "thai", "french"];
        
        // Fetch all in parallel
        const responses = await Promise.all(
          queries.map(query =>
            fetch(`http://localhost:5001/recipedisplay/default?query=${query}`).then(res => res.json())
          )
        );

        // Flatten and filter all recipes
        const allRecipes = responses.flat().filter(item => item?.recipe?.image);

        // Shuffle and slice
        const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
        setRecipes(shuffled.slice(0, 5));
      } catch (err) {
        console.error("Failed to load recipes:", err);
      }
    };

    fetchRecipes();
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      const container = scrollRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      let minDiff = Infinity;
      let newIndex = 0;
      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const rect = item.getBoundingClientRect();
        const diff = Math.abs(rect.left + rect.width / 2 - (containerRect.left + containerRect.width / 2));
        if (diff < minDiff) {
          minDiff = diff;
          newIndex = index;
        }
      });
      setActiveIndex(newIndex);
    };

    const el = scrollRef.current;
    el?.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="scroll-wrapper">
      <ScrollSidebar />

      <section className="home-container" id="landing">
        <div className="home-content">
          <header className="home-header">
            <h1>Where Recipes Meet Innovation</h1>
            <p>
              Discover a world of culinary creativity at ForkedIn. Explore
              official and user-generated recipes, create and share your own,
              and connect with a community that loves to cook and innovate.
            </p>
            <nav className="get-started">
              <button onClick={() => window.location.href = "/login"}>
                Get Started
              </button>
            </nav>
          </header>
          <div className="image-container">
            <img src={foodImage} alt="Delicious Dish" />
            <div className="image-overlay"></div>
          </div>
        </div>
        <div className="scroll-down-indicator">
          <KeyboardArrowDownIcon fontSize="large" />
        </div>
      </section>

      <section className="page-section" id="discover">
        <div className="discover-container">
          <h2>Discover</h2>
          <p className="discover-subtitle">Uncover new recipes, tips, and inspiration every day.</p>

          <div className="carousel-wrapper">
            <div className="carousel" ref={scrollRef}>
              {recipes.map((hit, idx) => {
                const recipe = hit.recipe;
                return (
                  <div
                    className="carousel-item"
                    key={recipe.uri}
                    ref={(el) => (itemRefs.current[idx] = el)}
                  >
                   <div className="carousel-image-wrapper">
                    <img
                      src={recipe.image}
                      alt={recipe.label}
                      className="carousel-image"
                    />
                  </div>
                    <div className="carousel-info">
                      <p className="carousel-meta">
                        {recipe.yield} servings / {recipe.ingredients.length} ingredients / {Math.round(recipe.calories)} cal
                      </p>
                      <strong className="carousel-title">{recipe.label}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="carousel-dots">
              {recipes.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${activeIndex === index ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          <button className="explore-button" onClick={() => navigate('/recipes')}>
            Explore
          </button>
        </div>
      </section>

      <section className="page-section alt-bg" id="create">
        <div className="create-content">
          <img src={section3} alt="Create Section" className="create-image" />
          <div className="create-text">
            <h2>Create</h2>
            <p>Uncover new recipes, tips, and inspiration every day.</p>
          </div>
        </div>
      </section>

      <section className="page-section" id="connect">
        <div className="connect-content">
          <div className="connect-text">
            <h2>Connect</h2>
            <p>Join a vibrant community of food lovers and innovators.</p>
          </div>
          <img src={section3} alt="Connect Section" className="connect-image" />
        </div>
      </section>
    </div>
  );
};

export default Home;
