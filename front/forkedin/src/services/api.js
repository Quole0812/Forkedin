const API_BASE_URL = 'http://localhost:5001';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
  } catch (error) {
    console.error('Error getting auth headers:', error);
  }
  
  return {
    'Content-Type': 'application/json'
  };
};

// Recipe API functions
export const recipeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/recipedisplay/`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/recipedisplay/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }
    return response.json();
  },

  create: async (recipeData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/recipedisplay/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(recipeData)
    });
    if (!response.ok) {
      throw new Error('Failed to create recipe');
    }
    return response.json();
  },

  update: async (id, recipeData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/recipedisplay/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(recipeData)
    });
    if (!response.ok) {
      throw new Error('Failed to update recipe');
    }
    return response.json();
  },

  delete: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/recipedisplay/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }
    return response.json();
  }
};

// User API functions
export const userAPI = {
  checkUsernameAvailability: async (username) => {
    const response = await fetch(`${API_BASE_URL}/users/check-username/${username}`);
    if (!response.ok) {
      throw new Error('Failed to check username availability');
    }
    return response.json();
  },

  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user');
    }
    return response.json();
  },

  updateLogin: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to update login');
    }
    return response.json();
  },

  getProfile: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    return response.json();
  },

  updateProfile: async (userData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }
    return response.json();
  },

  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    return response.json();
  }
};

// Comments API functions
export const commentsAPI = {
  getComments: async (recipeUri) => {
    const response = await fetch(`${API_BASE_URL}/comments/recipe/${encodeURIComponent(recipeUri)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  addComment: async (recipeUri, text) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/comments/recipe/${encodeURIComponent(recipeUri)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add comment');
    }
    return response.json();
  },

  addReply: async (recipeUri, commentId, text) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/comments/recipe/${encodeURIComponent(recipeUri)}/comment/${commentId}/reply`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add reply');
    }
    return response.json();
  },

  deleteComment: async (recipeUri, commentId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/comments/recipe/${encodeURIComponent(recipeUri)}/comment/${commentId}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete comment');
    }
    return response.json();
  },

  deleteReply: async (recipeUri, commentId, replyId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/comments/recipe/${encodeURIComponent(recipeUri)}/comment/${commentId}/reply/${replyId}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete reply');
    }
    return response.json();
  }
};

// Ratings API functions
export const ratingsAPI = {
  getRatings: async (recipeUri) => {
    const response = await fetch(`${API_BASE_URL}/ratings/recipe/${encodeURIComponent(recipeUri)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch ratings');
    }
    return response.json();
  },

  addRating: async (recipeUri, rating) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ratings/recipe/${encodeURIComponent(recipeUri)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rating })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add rating');
    }
    return response.json();
  },

  updateRating: async (recipeUri, rating) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ratings/recipe/${encodeURIComponent(recipeUri)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ rating })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update rating');
    }
    return response.json();
  },

  deleteRating: async (recipeUri) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ratings/recipe/${encodeURIComponent(recipeUri)}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete rating');
    }
    return response.json();
  }
}; 