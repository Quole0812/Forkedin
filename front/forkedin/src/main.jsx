import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Header from './components/Header.jsx';
import RecipeDisplay from './routes/RecipeDisplay.jsx';

const router = createBrowserRouter([
  {path: '/', element: <Header />},
  {path: '/recipedisplay', element: <RecipeDisplay />},
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
     <RouterProvider router={router}/>
  </StrictMode>,
)


