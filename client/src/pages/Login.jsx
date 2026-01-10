import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  
  const [role, setRole] = useState('vendor');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check hash for role
    const hash = location.hash.replace('#', '');
    if (hash === 'buyer' || hash === 'vendor') {
      setRole(hash);
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'buyer' ? '/buyer/dashboard' : '/vendor/dashboard';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login({ ...formData, role });
      toast.success('Login successful!');
      const redirectPath = role === 'buyer' ? '/buyer/dashboard' : '/vendor/dashboard';
      navigate(redirectPath);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">B</span>
            </Link>
            <h1 className="auth-title">
              {role === 'buyer' ? 'Buyer Login' : 'Vendor Login'}
            </h1>
            <p className="auth-subtitle">
              Sign in to access your {role} dashboard
            </p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              className={`role-btn ${role === 'vendor' ? 'active' : ''}`}
              onClick={() => setRole('vendor')}
              type="button"
            >
              Vendor
            </button>
            <button
              className={`role-btn ${role === 'buyer' ? 'active' : ''}`}
              onClick={() => setRole('buyer')}
              type="button"
            >
              Buyer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to={`/signup#${role}`} className="auth-link">
                Register as {role}
              </Link>
            </p>
            <p className="auth-switch">
              {role === 'vendor' ? (
                <>
                  Are you a buyer?{' '}
                  <button onClick={() => setRole('buyer')} className="auth-link-btn">
                    Login as Buyer
                  </button>
                </>
              ) : (
                <>
                  Are you a vendor?{' '}
                  <button onClick={() => setRole('vendor')} className="auth-link-btn">
                    Login as Vendor
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="auth-info">
          <h2>Welcome to BidSync</h2>
          <p>Sri Lanka's most transparent procurement platform</p>
          <ul className="auth-features">
            <li>🔒 Sealed bidding for fair competition</li>
            <li>✓ Verified vendors and buyers</li>
            <li>📊 Real-time tender tracking</li>
            <li>📄 Automated comparative statements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
