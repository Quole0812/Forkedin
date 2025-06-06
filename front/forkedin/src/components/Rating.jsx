import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ratingsAPI } from '../services/api';
import '../styles/Rating.css';

const Rating = ({ recipeUri }) => {
  const [user] = useAuthState(auth);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch ratings when component mounts or recipeUri changes
  useEffect(() => {
    if (recipeUri) {
      fetchRatings();
    }
  }, [recipeUri]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingsAPI.getRatings(recipeUri);
      setRatings(data.ratings || []);
      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);
      
      // Find user's existing rating
      if (user) {
        const existingRating = data.ratings.find(rating => rating.authorId === user.uid);
        setUserRating(existingRating ? existingRating.rating : 0);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (rating) => {
    if (!user) {
      alert('Please log in to rate this recipe');
      return;
    }

    try {
      setSubmitting(true);
      await ratingsAPI.addRating(recipeUri, rating);
      setUserRating(rating);
      fetchRatings(); // Refresh ratings to get updated average
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, isInteractive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${isInteractive ? 'interactive' : ''}`}
          onClick={isInteractive ? () => handleRatingSubmit(i) : undefined}
          onMouseEnter={isInteractive ? () => setHoverRating(i) : undefined}
          onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const displayRating = hoverRating || userRating;

  return (
    <div className="rating-section">
      <div className="rating-display">
        <div className="average-rating">
          <div className="stars-display">
            {renderStars(Math.round(averageRating))}
          </div>
          <span className="rating-text">
            {averageRating > 0 ? (
              <>
                <span className="average-number">{averageRating.toFixed(1)}</span>
                <span className="rating-count">({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</span>
              </>
            ) : (
              <span className="no-ratings">No ratings yet</span>
            )}
          </span>
        </div>
      </div>

      {user && (
        <div className="user-rating">
          <h3>Rate this recipe:</h3>
          <div className="rating-input" disabled={submitting}>
            {renderStars(displayRating, true)}
          </div>
          {userRating > 0 && (
            <p className="user-rating-text">
              You rated this recipe {userRating} star{userRating !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {!user && (
        <div className="login-prompt">
          <p>Please log in to rate this recipe</p>
        </div>
      )}
    </div>
  );
};

export default Rating; 