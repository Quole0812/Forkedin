import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"
import logo from "../assets/logo.png"
import "./Header.css"
import React from 'react';

export default function Header() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

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
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/recipedisplay" className="nav-link">Recipes</Link>
                <Link to="/saved" className="nav-link">Saved</Link>
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