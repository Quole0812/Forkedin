import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext.jsx';
import Header from './components/Header.jsx';
import RecipeDisplay from './routes/RecipeDisplay.jsx';
import RecipeDetails from './routes/RecipeDetails.jsx';
import Login from './routes/login.jsx';
import SignUp from './routes/signUp.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <div>Home Page Content</div>
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
        path: 'saved',
        element: <div>Saved Page</div>
      },
//       {path: '/', element: <Header />},
      {path: '/recipedisplay', element: <RecipeDisplay />},
      {path: '/recipedisplay/:id', element: <RecipeDetails />},
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>,
)


