import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../firebase';
import { userAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  async function signup(name, username, email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(result.user, {
      displayName: name
    });

    // Create user in backend database
    const userData = {
      uid: result.user.uid,
      fullName: name,
      username: username,
      email: email
    };
    
    try {
      const response = await userAPI.createUser(userData);
      setUserData(response.user);
      console.log('User created successfully in database');
    } catch (error) {
      console.error('Error creating user in database:', error);
    }
    
    return result;
  }

  // Login function
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    try {
      // Update login time and get user data from backend
      const response = await userAPI.updateLogin();
      setUserData(response.user);
      console.log('Login updated successfully');
    } catch (error) {
      console.error('Error updating login in database:', error);
      // Continue with login even if backend call fails
    }
    
    return result;
  }

  // Logout function
  function logout() {
    setUserData(null);
    return signOut(auth);
  }

  // Function to get user profile from backend
  async function getUserProfile() {
    try {
      const response = await userAPI.getProfile();
      setUserData(response.user);
      return response.user;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Function to update user profile
  async function updateUserProfile(profileData) {
    try {
      const response = await userAPI.updateProfile(profileData);
      setUserData(response.user);
      return response.user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Function to check username availability
  async function checkUsernameAvailability(username) {
    try {
      const response = await userAPI.checkUsernameAvailability(username);
      return response;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Try to get user data from backend when user logs in
        try {
          const response = await userAPI.getProfile();
          setUserData(response.user);
        } catch (error) {
          console.error('Error getting user profile on auth change:', error);
          // If user doesn't exist in backend, clear userData
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    checkUsernameAvailability
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 