import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { IoAdd, IoClose, IoCalendar } from 'react-icons/io5';
import './Dashboard.css';

const CreateRFQ = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    items: [{ name: '', quantity: 1, unit: 'units', specifications: '' }],
    budgetPrice: '',
    showBudget: false,
    closingDate: '',
    closingTime: '17:00',
    isSealed: true,
    isPrivate: false,
    deliveryLocation: '',
    deliveryDeadline: '',
    termsAndConditions: ''
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      navigate('/login#buyer');
      return;
    }
    fetchCategories();
    fetchUserProfile();
  }, [isAuthenticated, user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await rfqAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  // Auto-fill location from user profile
  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const profile = response.data.user;
      if (profile?.address) {
        const address = profile.address;
        const locationParts = [address.street, address.city, address.district].filter(Boolean);
        if (locationParts.length > 0) {
          setFormData(prev => ({
            ...prev,
            deliveryLocation: locationParts.join(', ')
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unit: 'units', specifications: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e, status = 'open') => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.items[0].name) {
      toast.error('Please add at least one item');
      return;
    }

    if (!formData.closingDate) {
      toast.error('Please set a closing date');
      return;
    }

    // Combine date and time
    const closingDateTime = new Date(`${formData.closingDate}T${formData.closingTime}`);
    
    if (closingDateTime <= new Date()) {
      toast.error('Closing date must be in the future');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        closingDate: closingDateTime.toISOString(),
        budgetPrice: formData.budgetPrice ? Number(formData.budgetPrice) : null,
        status
      };

      await rfqAPI.create(payload);
      toast.success('RFQ created successfully!');
      navigate('/buyer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="form-page">
          <div className="dashboard-header">
            <div>
              <h1>Create New RFQ</h1>
              <p>Fill in the details to create a new Request for Quotation</p>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e, 'open')}>
            {/* Basic Information */}
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Basic Information</h3>
                
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="e.g., Supply of 50 Office Chairs"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="Provide detailed requirements and specifications..."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget (LKR) - Optional</label>
                    <input
                      type="number"
                      name="budgetPrice"
                      className="form-input"
                      placeholder="e.g., 500000"
                      value={formData.budgetPrice}
                      onChange={handleChange}
                    />
                    <div className="form-checkbox-group mt-2">
                      <input
                        type="checkbox"
                        id="showBudget"
                        name="showBudget"
                        className="form-checkbox"
                        checked={formData.showBudget}
                        onChange={handleChange}
                      />
                      <label htmlFor="showBudget">Show budget to vendors</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Items Required</h3>
                
                <div className="items-list">
                  {formData.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="form-group mb-0">
                        <label className="form-label">Item Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Unit</label>
                        <select
                          className="form-select"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        >
                          <option value="units">Units</option>
                          <option value="kg">Kg</option>
                          <option value="litres">Litres</option>
                          <option value="boxes">Boxes</option>
                          <option value="sets">Sets</option>
                        </select>
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeItem(index)}
                        >
                          <IoClose size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button type="button" className="add-item-btn mt-4" onClick={addItem}>
                  <IoAdd size={20} /> Add Another Item
                </button>
              </div>
            </div>

            {/* Timeline & Delivery */}
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Timeline & Delivery</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Closing Date *</label>
                    <input
                      type="date"
                      name="closingDate"
                      className="form-input"
                      min={getMinDate()}
                      value={formData.closingDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Closing Time</label>
                    <input
                      type="time"
                      name="closingTime"
                      className="form-input"
                      value={formData.closingTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Delivery Location</label>
                    <input
                      type="text"
                      name="deliveryLocation"
                      className="form-input"
                      placeholder="e.g., Colombo 07"
                      value={formData.deliveryLocation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Delivery Date</label>
                    <input
                      type="date"
                      name="deliveryDeadline"
                      className="form-input"
                      min={formData.closingDate || getMinDate()}
                      value={formData.deliveryDeadline}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Bidding Settings</h3>
                
                <div className="form-checkbox-group mb-4">
                  <input
                    type="checkbox"
                    id="isSealed"
                    name="isSealed"
                    className="form-checkbox"
                    checked={formData.isSealed}
                    onChange={handleChange}
                  />
                  <label htmlFor="isSealed">
                    <strong>Sealed Bidding</strong>
                    <span className="form-hint d-block">Bid prices are hidden until the deadline passes</span>
                  </label>
                </div>

                <div className="form-checkbox-group">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    className="form-checkbox"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                  />
                  <label htmlFor="isPrivate">
                    <strong>Private Tender</strong>
                    <span className="form-hint d-block">Only invited vendors can submit bids</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Terms & Conditions</h3>
                
                <div className="form-group">
                  <textarea
                    name="termsAndConditions"
                    className="form-textarea"
                    placeholder="Enter any specific terms and conditions..."
                    value={formData.termsAndConditions}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/buyer/dashboard')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={loading}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish RFQ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRFQ;
