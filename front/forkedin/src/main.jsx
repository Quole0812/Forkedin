import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext.jsx';
import Header from './components/Header.jsx';
import RecipeDisplay from './routes/RecipeDisplay.jsx';
import Login from './routes/login.jsx';
import SignUp from './routes/signUp.jsx';
import Home from './routes/Home.jsx';

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
        path: 'saved',
        element: <div>Saved Page</div>
      },
//       {path: '/', element: <Header />},
      {path: '/recipedisplay', element: <RecipeDisplay />},
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


