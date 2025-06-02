import { Link, useNavigate } from "react-router-dom"
import "./Header.css"


export default function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
    //do ur log out later
    console.log("Log out cuh");
    navigate('/login'); 
  };


    return (
        <>
        <header className="header">
      <div className="logo">
        <p>Lmfao we need our logo</p>
      </div>
    <div className="dalink">
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/recipes">Recipes</Link>
        <Link to="/saved">Saved</Link>
      </nav>
      <div className="header-actions">
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      </div>
    </header>
        </>
    )

}