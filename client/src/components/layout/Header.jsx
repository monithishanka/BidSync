import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { IoNotifications, IoMenu, IoClose, IoChevronDown } from 'react-icons/io5';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };

    if (profileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdown]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setProfileDropdown(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'buyer': return '/buyer/dashboard';
      case 'vendor': return '/vendor/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="header-nav">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <span className="logo-text">BidSync.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="header-links hide-mobile">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/tenders" className="nav-link">Tenders</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Auth Section */}
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link to={`/${user?.role}/notifications`} className="notification-btn">
                  <IoNotifications size={22} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="profile-dropdown-container" ref={dropdownRef}>
                  <button 
                    className="profile-btn"
                    onClick={() => setProfileDropdown(!profileDropdown)}
                  >
                    <div className="profile-avatar">
                      {user?.companyName?.charAt(0) || 'U'}
                    </div>
                    <span className="profile-name hide-mobile">{user?.companyName}</span>
                    <IoChevronDown size={16} className={`profile-arrow ${profileDropdown ? 'open' : ''}`} />
                  </button>

                  {profileDropdown && (
                    <div className="profile-dropdown">
                      <div className="dropdown-header">
                        <span className="dropdown-email">{user?.email}</span>
                        <span className={`dropdown-role badge badge-${user?.role === 'vendor' ? 'success' : 'info'}`}>
                          {user?.role}
                        </span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setProfileDropdown(false)}>
                        Dashboard
                      </Link>
                      <Link to={`/${user?.role}/profile`} className="dropdown-item" onClick={() => setProfileDropdown(false)}>
                        Profile Settings
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons hide-mobile">
                <Link to="/login" className="btn btn-ghost">Login</Link>
                <Link to="/signup" className="btn btn-primary">Register</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-btn hide-desktop"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/tenders" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Tenders</Link>
            <Link to="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            {!isAuthenticated && (
              <>
                <div className="mobile-divider"></div>
                <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
