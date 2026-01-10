import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqAPI, bidAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { IoArrowBack } from 'react-icons/io5';
import '../buyer/Dashboard.css';

const SubmitBid = () => {
  const { rfqId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    unitPrice: '',
    quantity: 1,
    deliveryTimeline: '',
    warrantyPeriod: '',
    warrantyTerms: '',
    remarks: '',
    isVATRegistered: false
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/login#vendor');
      return;
    }
    fetchRFQ();
  }, [isAuthenticated, user, navigate, rfqId]);

  const fetchRFQ = async () => {
    try {
      const response = await rfqAPI.getById(rfqId);
      setRfq(response.data.rfq);
      
      // Pre-fill quantity from RFQ
      if (response.data.rfq.items?.[0]) {
        setFormData(prev => ({
          ...prev,
          quantity: response.data.rfq.items[0].quantity || 1
        }));
      }
    } catch (error) {
      toast.error('Failed to load tender details');
      navigate('/tenders');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateTotal = () => {
    const subtotal = Number(formData.unitPrice) * Number(formData.quantity);
    const vatRate = formData.isVATRegistered ? 0.18 : 0;
    const vatAmount = subtotal * vatRate;
    return {
      subtotal,
      vatAmount,
      total: subtotal + vatAmount
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.unitPrice || !formData.deliveryTimeline) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.isApproved) {
      toast.error('Your account must be approved before submitting bids');
      return;
    }

    setSubmitting(true);
    try {
      await bidAPI.submit({
        rfqId,
        unitPrice: Number(formData.unitPrice),
        quantity: Number(formData.quantity),
        deliveryTimeline: Number(formData.deliveryTimeline),
        warrantyPeriod: formData.warrantyPeriod ? Number(formData.warrantyPeriod) : 0,
        warrantyTerms: formData.warrantyTerms,
        remarks: formData.remarks,
        isVATRegistered: formData.isVATRegistered
      });
      
      toast.success('Bid submitted successfully!');
      navigate('/vendor/bids');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotal();

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="skeleton skeleton-heading"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      </div>
    );
  }

  if (!rfq || rfq.status !== 'open') {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="card">
            <div className="card-body text-center py-8">
              <h3>This tender is not accepting bids</h3>
              <p className="text-muted mt-2">The tender may be closed or no longer available.</p>
              <Link to="/tenders" className="btn btn-primary mt-4">
                Browse Open Tenders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="form-page">
          {/* Header */}
          <Link to={`/tenders/${rfqId}`} className="btn btn-ghost mb-4">
            <IoArrowBack /> Back to Tender
          </Link>

          <div className="dashboard-header">
            <div>
              <h1>Submit Your Bid</h1>
              <p>{rfq.referenceId} - {rfq.title}</p>
            </div>
            {rfq.isSealed && (
              <span className="badge badge-info">🔒 Sealed Bidding</span>
            )}
          </div>

          {/* RFQ Summary */}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="mb-2">Tender Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted text-sm">Category</span>
                  <p className="font-medium">{rfq.category}</p>
                </div>
                <div>
                  <span className="text-muted text-sm">Closing Date</span>
                  <p className="font-medium">{new Date(rfq.closingDate).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted text-sm">Items Required</span>
                  <ul>
                    {rfq.items?.map((item, i) => (
                      <li key={i}>{item.name} - {item.quantity} {item.unit}</li>
                    ))}
                  </ul>
                </div>
                {rfq.budgetPrice && rfq.showBudget && (
                  <div>
                    <span className="text-muted text-sm">Budget</span>
                    <p className="font-medium">LKR {rfq.budgetPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bid Form */}
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Pricing</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Unit Price (LKR) *</label>
                    <input
                      type="number"
                      name="unitPrice"
                      className="form-input"
                      placeholder="Enter unit price"
                      min="0"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-input"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-checkbox-group mb-4">
                  <input
                    type="checkbox"
                    id="isVATRegistered"
                    name="isVATRegistered"
                    className="form-checkbox"
                    checked={formData.isVATRegistered}
                    onChange={handleChange}
                  />
                  <label htmlFor="isVATRegistered">
                    I am VAT Registered (18% VAT will be added)
                  </label>
                </div>

                {/* Price Summary */}
                <div className="price-summary">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>LKR {totals.subtotal.toLocaleString()}</span>
                  </div>
                  {formData.isVATRegistered && (
                    <div className="price-row">
                      <span>VAT (18%):</span>
                      <span>LKR {totals.vatAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="price-row total">
                    <span>Total Price:</span>
                    <span>LKR {totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Delivery & Warranty</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Delivery Timeline (Days) *</label>
                    <input
                      type="number"
                      name="deliveryTimeline"
                      className="form-input"
                      placeholder="e.g., 14"
                      min="1"
                      value={formData.deliveryTimeline}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warranty Period (Months)</label>
                    <input
                      type="number"
                      name="warrantyPeriod"
                      className="form-input"
                      placeholder="e.g., 12"
                      min="0"
                      value={formData.warrantyPeriod}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty Terms</label>
                  <input
                    type="text"
                    name="warrantyTerms"
                    className="form-input"
                    placeholder="Brief warranty conditions..."
                    value={formData.warrantyTerms}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 className="form-section-title">Additional Notes</h3>
                
                <div className="form-group">
                  <label className="form-label">Remarks / Notes</label>
                  <textarea
                    name="remarks"
                    className="form-textarea"
                    placeholder="Any additional information for the buyer..."
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/tenders/${rfqId}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !user?.isApproved}
              >
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .price-summary {
          background-color: var(--gray-50);
          border-radius: var(--radius-md);
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9375rem;
        }
        
        .price-row.total {
          border-top: 1px solid var(--gray-200);
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default SubmitBid;
