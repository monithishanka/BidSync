import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { IoSave, IoShield, IoLockClosed, IoEyeOutline, IoEyeOffOutline, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import './buyer/Dashboard.css';
import './Auth.css';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
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
    vatNumber: '',
    isVATRegistered: false
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength validation
  const passwordRequirements = useMemo(() => {
    const password = passwordData.newPassword;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)
    };
  }, [passwordData.newPassword]);

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
    'IT & Electronics', 'Construction & Raw Materials', 'Office Stationery',
    'Vehicles & Spare Parts', 'Furniture', 'Medical Equipment',
    'Catering & Food', 'Cleaning & Maintenance', 'Security Services',
    'Printing & Publishing', 'Consulting Services', 'Other'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.user;
      setFormData({
        companyName: userData.companyName || '',
        contactPerson: userData.contactPerson || '',
        phone: userData.phone || '',
        address: userData.address || { street: '', city: '', district: '', postalCode: '' },
        businessCategory: userData.businessCategory || [],
        vatNumber: userData.vatNumber || '',
        isVATRegistered: userData.isVATRegistered || false
      });
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCategoryChange = (category) => {
    const updated = formData.businessCategory.includes(category)
      ? formData.businessCategory.filter(c => c !== category)
      : [...formData.businessCategory, category];
    setFormData(prev => ({ ...prev, businessCategory: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await userAPI.updateProfile(formData);
      updateUser(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (!isPasswordValid) {
      toast.error('Password does not meet security requirements');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="form-page">
          <div className="dashboard-header">
            <div>
              <h1>Profile Settings</h1>
              <p>Manage your account information</p>
            </div>
            {user?.verifiedBadge && (
              <span className="badge badge-success">
                <IoShield /> Verified Supplier
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Account Info */}
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Account Information</h3>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                  />
                  <span className="form-hint">Email cannot be changed</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Company Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      className="form-input"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      className="form-input"
                      value={formData.contactPerson}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input
                      type="text"
                      name="address.district"
                      className="form-input"
                      value={formData.address.district}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address.street"
                    className="form-input"
                    placeholder="Street address"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Vendor Specific */}
            {user?.role === 'vendor' && (
              <div className="card">
                <div className="card-body">
                  <h3 className="form-section-title">Business Details</h3>
                  
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
                      <label className="form-label">VAT Number</label>
                      <input
                        type="text"
                        name="vatNumber"
                        className="form-input"
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
                    <label htmlFor="isVATRegistered">VAT Registered</label>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <IoSave /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Change Password Section */}
          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-body">
              <h3 className="form-section-title">
                <IoLockClosed style={{ marginRight: '0.5rem' }} />
                Change Password
              </h3>
              
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
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
                  <label className="form-label">Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <span className="form-error">Passwords do not match</span>
                  )}
                </div>

                <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={passwordLoading || !isPasswordValid}
                  >
                    <IoLockClosed /> {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .category-chip {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          background-color: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .category-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .category-chip.active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default Profile;
