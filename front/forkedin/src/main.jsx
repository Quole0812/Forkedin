import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext.jsx';
import Header from './components/Header.jsx';
import RecipeDisplay from './routes/RecipeDisplay.jsx';
import RecipeDetails from './routes/RecipeDetails.jsx';
import Login from './routes/login.jsx';
import SignUp from './routes/signUp.jsx';
import CreateRecipe from './components/create-recipe/CreateRecipe.jsx';
import Home from './routes/Home.jsx';
import AccountPage from './routes/AccountPage.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'signup',
        element: <SignUp />
      },
      {
        path: 'recipes',
        element: <div>Recipes Page</div>
      },
      {
        path: 'create',
        element: <CreateRecipe />
      },
      {
        path: 'saved',
        element: <div>Saved Page</div>
      },
      {
        path: 'account/*',
        element: <AccountPage />
      },
//       {path: '/', element: <Header />},
      {path: '/recipedisplay', element: <RecipeDisplay />},
      {path: '/recipedisplay/:id', element: <RecipeDetails />},
      {path: '/recipe/:id', element: <RecipeDetails />},
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </AuthProvider>
  </StrictMode>,
)


