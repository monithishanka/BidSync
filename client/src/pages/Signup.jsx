import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { IoEyeOutline, IoEyeOffOutline, IoArrowForward, IoArrowBack, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    },
    businessCategory: [],
    businessRegistrationNumber: '',
    vatNumber: '',
    isVATRegistered: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength validation
  const passwordRequirements = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)
    };
  }, [formData.password]);

  const passwordStrength = useMemo(() => {
    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial } = passwordRequirements;
    const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    if (score === 5) return { label: 'Strong', color: '#10b981', width: '100%' };
    if (score >= 3) return { label: 'Medium', color: '#f59e0b', width: '60%' };
    if (score >= 1) return { label: 'Weak', color: '#ef4444', width: '30%' };
    return { label: '', color: '#374151', width: '0%' };
  }, [passwordRequirements]);

  const isPasswordValid = useMemo(() => {
    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial } = passwordRequirements;
    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }, [passwordRequirements]);

  const categories = [
    'IT & Electronics',
    'Construction & Raw Materials',
    'Office Stationery',
    'Vehicles & Spare Parts',
    'Furniture',
    'Medical Equipment',
    'Catering & Food',
    'Cleaning & Maintenance',
    'Security Services',
    'Printing & Publishing',
    'Consulting Services',
    'Other'
  ];

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'buyer' || hash === 'vendor') {
      setRole(hash);
      setStep(2);
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value }
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryChange = (category) => {
    const updated = formData.businessCategory.includes(category)
      ? formData.businessCategory.filter(c => c !== category)
      : [...formData.businessCategory, category];
    setFormData({ ...formData, businessCategory: updated });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!role) {
        toast.error('Please select account type');
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (!isPasswordValid) {
        toast.error('Password does not meet security requirements');
        return false;
      }
    }
    
    if (step === 3) {
      if (!formData.companyName || !formData.contactPerson || !formData.phone) {
        toast.error('Please fill in all required fields');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);
    try {
      await signup({ ...formData, role });
      toast.success('Account created! Pending admin approval.');
      navigate(`/login#${role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container signup-container">
        <div className="auth-card signup-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">B</span>
            </Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join Sri Lanka's leading procurement platform</p>
          </div>

          {/* Progress Steps */}
          <div className="signup-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Account Type</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Credentials</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Company Info</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Step 1: Account Type */}
            {step === 1 && (
              <div className="form-step">
                <h3 className="step-title">Choose Account Type</h3>
                <div className="role-cards">
                  <button
                    type="button"
                    className={`role-card ${role === 'vendor' ? 'active' : ''}`}
                    onClick={() => setRole('vendor')}
                  >
                    <span className="role-icon">🏪</span>
                    <span className="role-name">Vendor / Supplier</span>
                    <span className="role-desc">Submit bids and win tenders</span>
                  </button>
                  <button
                    type="button"
                    className={`role-card ${role === 'buyer' ? 'active' : ''}`}
                    onClick={() => setRole('buyer')}
                  >
                    <span className="role-icon">🏢</span>
                    <span className="role-name">Buyer / Organization</span>
                    <span className="role-desc">Create tenders and manage procurement</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-full mt-6"
                  onClick={nextStep}
                  disabled={!role}
                >
                  Continue <IoArrowForward />
                </button>
              </div>
            )}

            {/* Step 2: Credentials */}
            {step === 2 && (
              <div className="form-step">
                <h3 className="step-title">Account Credentials</h3>
                
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
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
                  <label className="form-label">Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      placeholder="Create a strong password"
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill" 
                          style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                        />
                      </div>
                      <span className="strength-label" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                  
                  {/* Password Requirements Checklist */}
                  <div className="password-requirements">
                    <p className="requirements-title">Password must contain:</p>
                    <ul className="requirements-list">
                      <li className={passwordRequirements.minLength ? 'valid' : 'invalid'}>
                        {passwordRequirements.minLength ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                        At least 8 characters
                      </li>
                      <li className={passwordRequirements.hasUppercase ? 'valid' : 'invalid'}>
                        {passwordRequirements.hasUppercase ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                        One uppercase letter (A-Z)
                      </li>
                      <li className={passwordRequirements.hasLowercase ? 'valid' : 'invalid'}>
                        {passwordRequirements.hasLowercase ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                        One lowercase letter (a-z)
                      </li>
                      <li className={passwordRequirements.hasNumber ? 'valid' : 'invalid'}>
                        {passwordRequirements.hasNumber ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                        One number (0-9)
                      </li>
                      <li className={passwordRequirements.hasSpecial ? 'valid' : 'invalid'}>
                        {passwordRequirements.hasSpecial ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                        One special character (!@#$%^&* etc.)
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <span className="form-error">Passwords do not match</span>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    <IoArrowBack /> Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={nextStep}>
                    Continue <IoArrowForward />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Company Info */}
            {step === 3 && (
              <div className="form-step">
                <h3 className="step-title">
                  {role === 'vendor' ? 'Business Details' : 'Organization Details'}
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {role === 'vendor' ? 'Company Name *' : 'Organization Name *'}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      className="form-input"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      className="form-input"
                      placeholder="Full name"
                      value={formData.contactPerson}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="+94 XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <select
                      name="address.district"
                      className="form-select"
                      value={formData.address.district}
                      onChange={handleChange}
                    >
                      <option value="">Select District</option>
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {role === 'vendor' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Business Categories</label>
                      <div className="category-chips">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            className={`category-chip ${formData.businessCategory.includes(cat) ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Business Reg. Number</label>
                        <input
                          type="text"
                          name="businessRegistrationNumber"
                          className="form-input"
                          placeholder="BR Number"
                          value={formData.businessRegistrationNumber}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">VAT Number</label>
                        <input
                          type="text"
                          name="vatNumber"
                          className="form-input"
                          placeholder="VAT Number (if applicable)"
                          value={formData.vatNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-checkbox-group">
                      <input
                        type="checkbox"
                        id="isVATRegistered"
                        name="isVATRegistered"
                        className="form-checkbox"
                        checked={formData.isVATRegistered}
                        onChange={handleChange}
                      />
                      <label htmlFor="isVATRegistered">I am VAT registered</label>
                    </div>
                  </>
                )}

                <div className="form-actions mt-6">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    <IoArrowBack /> Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to={`/login#${role || 'vendor'}`} className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
