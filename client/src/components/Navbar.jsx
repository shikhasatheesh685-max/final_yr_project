import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Art Gallery
        </Link>

        <div className="nav-links">
          <Link to="/">Gallery</Link>
          
          {isAuthenticated ? (
            <>
              {user.role === 'artist' && (
                <Link to="/artist/dashboard">Artist Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin">Admin Dashboard</Link>
              )}
              <Link to="/orders">My Orders</Link>
              <span className="user-name">Hello, {user.name}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
