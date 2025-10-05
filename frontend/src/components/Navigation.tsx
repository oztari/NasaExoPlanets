import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand" style={{ marginRight: 'auto' }}>
          A World Away 🚀
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Home
          </Link>
          <Link 
            to="/about-exoplanets" 
            className={location.pathname === '/about-exoplanets' ? 'nav-link active' : 'nav-link'}
          >
            About Exoplanets
          </Link>
          <Link 
            to="/project-structure" 
            className={location.pathname === '/project-structure' ? 'nav-link active' : 'nav-link'}
          >
            Project Structure
          </Link>
          <Link 
            to="/extra-resources" 
            className={location.pathname === '/extra-resources' ? 'nav-link active' : 'nav-link'}
          >
            Extra Resources
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;