import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import '../styles/AccountPage.css'; // we’ll make this next
import UserInfoPage from './account/UserInfoPage';
import MyRecipesPage from './account/MyRecipesPage';
import SavedPage from './account/SavedPage';
import AdminViewPage from './account/AdminViewPage';
import { useAuth } from "../components/AuthContext"






const AccountPage = () => {

  const { currentUser, logout } = useAuth();

  console.log(currentUser.reloadUserInfo.displayName === "admin");
  return (
    <div className="account-container">
      <aside className="account-sidebar">
        <h2>My Account</h2>
        <nav>
            <NavLink to="/account/user" className="account-link">User Info</NavLink>
            <NavLink to="/account/recipes" className="account-link">My Recipes</NavLink>
            <NavLink to="/account/saved" className="account-link">Saved</NavLink>
           {currentUser.reloadUserInfo.displayName === "admin" && <NavLink to="/account/admin" className="account-link">Admin View</NavLink>}
        </nav>
      </aside>

      <main className="account-main">
        <Routes>
            <Route path="user" element={<UserInfoPage />} />
            <Route path="recipes" element={<MyRecipesPage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="admin" element={<AdminViewPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AccountPage;
