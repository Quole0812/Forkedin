import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import React from 'react';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  return currentUser ? children : <Navigate to="/login" />;
} 