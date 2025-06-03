import React, { useEffect, useRef, useState } from 'react';
import '../styles/Home.css';
import foodImage from '../assets/foodImage.png';
import ScrollSidebar from '../components/ScrollSidebar';

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);

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
    el.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="discover-container">
          <h2>Discover</h2>
          <p className="discover-subtitle">Uncover new recipes, tips, and inspiration every day.</p>

          <div className="carousel-wrapper">
            <div className="carousel" ref={scrollRef}>
              {[1, 2, 3, 4, 5].map((num, idx) => (
                <div
                  className="carousel-item"
                  key={num}
                  ref={(el) => (itemRefs.current[idx] = el)}
                >
                  {num}
                </div>
              ))}
            </div>

            <div className="carousel-dots">
              {[0, 1, 2, 3, 4].map((index) => (
                <span
                  key={index}
                  className={`dot ${activeIndex === index ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          <button className="explore-button">Explore</button>
        </div>
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
