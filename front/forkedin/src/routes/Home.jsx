import React from 'react';
import '../styles/Home.css';
import foodImage from '../assets/foodImage.png';
import ScrollSidebar from '../components/ScrollSidebar';

const Home = () => {
  return (
    <div className="scroll-wrapper">
      <ScrollSidebar />

      {/* Section 1: Landing */}
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
      </section>

      {/* Section 2: Discover */}
      <section className="page-section" id="discover">
        <h2>Discover</h2>
      </section>

      {/* Section 3: Create */}
      <section className="page-section alt-bg" id="create">
        <h2>Create</h2>
      </section>

      {/* Section 4: Connect */}
      <section className="page-section" id="connect">
        <h2>Connect</h2>
      </section>
    </div>
  );
};

export default Home;
