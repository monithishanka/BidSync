import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rfqAPI } from '../services/api';
import { IoTime, IoLocation, IoBusiness, IoDocumentText, IoLockClosed } from 'react-icons/io5';
import './TenderDetails.css';

const TenderDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQ();
  }, [id]);

  const fetchRFQ = async () => {
    try {
      const response = await rfqAPI.getById(id);
      setRfq(response.data.rfq);
    } catch (error) {
      console.error('Failed to fetch RFQ');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (closingDate) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing - now;
    
    if (diff <= 0) return 'Closed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days ${hours} hours remaining`;
    if (hours > 0) return `${hours} hours remaining`;
    return 'Closing soon';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-open">Open</span>;
      case 'closed':
        return <span className="badge badge-closed">Closed</span>;
      case 'awarded':
        return <span className="badge badge-awarded">Awarded</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="tender-details-page">
        <div className="container">
          <div className="skeleton skeleton-heading"></div>
          <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="tender-details-page">
        <div className="container">
          <div className="card text-center py-8">
            <h3>Tender not found</h3>
            <Link to="/tenders" className="btn btn-primary mt-4">
              Browse Tenders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canBid = rfq.status === 'open' && user?.role === 'vendor' && user?.isApproved;

  return (
    <div className="tender-details-page">
      <div className="container">
        <div className="tender-grid">
          {/* Main Content */}
          <div className="tender-main">
            {/* Header */}
            <div className="tender-header">
              <div className="tender-badges">
                <span className="category-badge">{rfq.category}</span>
                {getStatusBadge(rfq.status)}
                {rfq.isSealed && <span className="sealed-tag"><IoLockClosed /> Sealed</span>}
              </div>
              <h1>{rfq.title}</h1>
              <div className="tender-meta">
                <span><IoBusiness /> {rfq.organization || rfq.createdBy?.companyName}</span>
                <span><IoDocumentText /> {rfq.referenceId}</span>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <div className="card-header">
                <h3>Description</h3>
              </div>
              <div className="card-body">
                <p className="description-text">{rfq.description}</p>
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <div className="card-header">
                <h3>Items Required</h3>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfq.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>{item.specifications || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms */}
            {rfq.termsAndConditions && (
              <div className="card">
                <div className="card-header">
                  <h3>Terms & Conditions</h3>
                </div>
                <div className="card-body">
                  <p>{rfq.termsAndConditions}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="tender-sidebar">
            {/* Deadline Card */}
            <div className={`card deadline-card ${['closed', 'awarded'].includes(rfq.status) ? 'deadline-closed' : ''} ${rfq.status === 'cancelled' ? 'deadline-cancelled' : ''}`}>
              <div className="card-body">
                <div className="deadline-timer">
                  <IoTime size={24} />
                  <span>
                    {rfq.status === 'cancelled' 
                      ? 'Cancelled'
                      : rfq.status === 'closed' || rfq.status === 'awarded' 
                        ? 'Closed' 
                        : getTimeRemaining(rfq.closingDate)}
                  </span>
                </div>
                <div className="deadline-date">
                  <span>
                    {rfq.status === 'cancelled' 
                      ? 'Buyer cancelled this tender' 
                      : ['closed', 'awarded'].includes(rfq.status) 
                        ? 'Closed at' 
                        : 'Closing Date'}
                  </span>
                  {rfq.status !== 'cancelled' && (
                    <strong>
                      {new Date(rfq.closingDate).toLocaleString()}
                    </strong>
                  )}
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="card">
              <div className="card-body">
                {rfq.status === 'open' ? (
                  isAuthenticated ? (
                    user?.role === 'vendor' ? (
                      user.isApproved ? (
                        <Link 
                          to={`/vendor/bid/${rfq._id}`}
                          className="btn btn-primary btn-lg w-full"
                        >
                          Submit Bid
                        </Link>
                      ) : (
                        <div className="text-center">
                          <p className="text-muted mb-2">Account pending approval</p>
                          <button className="btn btn-secondary w-full" disabled>
                            Cannot Bid Yet
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="text-center">
                        <p className="text-muted mb-2">Only vendors can submit bids</p>
                        <Link to={`/buyer/rfq/${rfq._id}/bids`} className="btn btn-primary w-full">
                          View Bids
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <p className="text-muted mb-2">Login to submit a bid</p>
                      <Link to="/login#vendor" className="btn btn-primary w-full">
                        Login as Vendor
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-muted">This tender is no longer accepting bids</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details Card */}
            <div className="card">
              <div className="card-header">
                <h4>Details</h4>
              </div>
              <div className="card-body">
                <ul className="detail-list">
                  {rfq.budgetPrice && rfq.showBudget && (
                    <li>
                      <span>Budget</span>
                      <strong>LKR {rfq.budgetPrice.toLocaleString()}</strong>
                    </li>
                  )}
                  <li>
                    <span>Bids Received</span>
                    <strong>{rfq.bidCount || 0}</strong>
                  </li>
                  {rfq.deliveryLocation && (
                    <li>
                      <span>Delivery Location</span>
                      <strong>{rfq.deliveryLocation}</strong>
                    </li>
                  )}
                  {rfq.deliveryDeadline && (
                    <li>
                      <span>Expected Delivery</span>
                      <strong>{new Date(rfq.deliveryDeadline).toLocaleDateString()}</strong>
                    </li>
                  )}
                  <li>
                    <span>Published</span>
                    <strong>{new Date(rfq.createdAt).toLocaleDateString()}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TenderDetails;
