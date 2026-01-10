import { Link } from 'react-router-dom';
import { IoHome, IoArrowBack, IoSearchOutline } from 'react-icons/io5';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <span className="error-code">404</span>
          <div className="error-circle"></div>
        </div>
        
        <h1>Page Not Found</h1>
        <p>
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <IoHome size={18} />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary btn-lg">
            <IoArrowBack size={18} />
            Go Back
          </button>
        </div>
        
        <div className="not-found-search">
          <p>Or search for what you need:</p>
          <Link to="/tenders" className="search-link">
            <IoSearchOutline size={16} />
            Browse Tenders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
