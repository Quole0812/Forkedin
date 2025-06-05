import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import '../styles/AccountPage.css'; // we’ll make this next
import UserInfoPage from './account/UserInfoPage';
import MyRecipesPage from './account/MyRecipesPage';
import SavedPage from './account/SavedPage';
import AdminViewPage from './account/AdminViewPage';


const AccountPage = () => {
  return (
    <div className="account-container">
      <aside className="account-sidebar">
        <h2>My Account</h2>
        <nav>
            <NavLink to="/account/user" className="account-link">User Info</NavLink>
            <NavLink to="/account/recipes" className="account-link">My Recipes</NavLink>
            <NavLink to="/account/saved" className="account-link">Saved</NavLink>
            <NavLink to="/account/admin" className="account-link">Admin View</NavLink>
        </nav>
      </aside>

      <main className="account-main">
        <Routes>
            <Route path="user" element={<UserInfoPage />} />
            <Route path="recipes" element={<h2>My Recipes</h2>} />
            <Route path="saved" element={<h2>Saved</h2>} />
            <Route path="admin" element={<h2>Admin View</h2>} />
        </Routes>
      </main>
    </div>
  );
};

export default AccountPage;
