import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext"
import logo from "../assets/logo.png"
import "./Header.css"
import React from 'react';

export default function Header() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
      return location.pathname === path;
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/'); 
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo-container">
                    <img src={logo} alt="ForkedIn Logo" className="logo-image" />
                    {/* <span className="logo-text">ForkedIn</span> */}
                </Link>
            </div>
            
            <nav className="nav-links">
                <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>Home</Link>
                <Link to="/recipedisplay" className={isActive('/recipedisplay') ? 'nav-link active' : 'nav-link'}>Recipes</Link>
                {currentUser ? (
                    <Link to="/create" className={isActive('/create') ? 'nav-link active' : 'nav-link'}>Create</Link>
                    ) : (
                    <span className="nav-link disabled" title="Sign in to create recipes">Create</span>
                    )}
                        </nav>
            
            <div className="header-actions">
                {currentUser ? (
                    <div className="user-section">
                        <Link to="/account/user" className="user-welcome">
                            Welcome, <strong>{currentUser.displayName || currentUser.email}</strong>!
                        </Link>
                        <button className="logout-button" onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="login-link">
                            Log In
                        </Link>
                        <Link to="/signup" className="signup-link">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}