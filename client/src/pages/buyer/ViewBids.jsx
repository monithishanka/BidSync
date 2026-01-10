import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { IoCheckmarkCircle, IoDownload, IoStar } from 'react-icons/io5';
import './Dashboard.css';

const ViewBids = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      navigate('/login#buyer');
      return;
    }
    fetchBids();
  }, [isAuthenticated, user, navigate, id]);

  const fetchBids = async () => {
    try {
      const response = await rfqAPI.getBids(id);
      setRfq(response.data.rfq);
      setBids(response.data.bids || []);
    } catch (error) {
      toast.error('Failed to fetch bids');
      navigate('/buyer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAward = async (bidId) => {
    if (!confirm('Are you sure you want to award this tender to the selected vendor?')) {
      return;
    }

    setAwarding(true);
    try {
      await rfqAPI.award(id, { bidId });
      toast.success('Tender awarded successfully!');
      fetchBids();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to award tender');
    } finally {
      setAwarding(false);
    }
  };

  const getLowestPrice = () => {
    if (bids.length === 0 || bids[0].isSealed) return null;
    return Math.min(...bids.map(b => b.totalPrice));
  };

  const lowestPrice = getLowestPrice();

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

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Back Button */}
        <button 
          className="btn btn-ghost mb-4"
          onClick={() => navigate('/buyer/dashboard')}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>{rfq?.title || 'View Bids'}</h1>
            <p>Reference: {rfq?.referenceId}</p>
          </div>
          <div className="flex gap-2">
            <span className={`badge badge-${rfq?.status}`}>
              {rfq?.status?.toUpperCase()}
            </span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/tenders/${id}`)}
            >
              View Full RFQ Details
            </button>
          </div>
        </div>

        {/* Sealed Notice */}
        {rfq?.isSealed && rfq?.status === 'open' && !rfq?.canReveal && (
          <div className="alert alert-warning mb-4">
            <strong>🔒 Sealed Bidding Active</strong>
            <p>Bid prices will be revealed after the deadline: {new Date(rfq.closingDate).toLocaleString()}</p>
            <p className="text-sm mt-1">You cannot award bids until the deadline passes.</p>
          </div>
        )}

        {/* Non-sealed open tender notice */}
        {!rfq?.isSealed && rfq?.status === 'open' && bids.length > 0 && (
          <div className="alert alert-info mb-4">
            <strong>ℹ️ Open Bidding</strong>
            <p>This is a non-sealed tender. You can view all bids and award at any time.</p>
          </div>
        )}

        {/* Comparative Statement */}
        <div className="card">
          <div className="card-header">
            <h3>Comparative Statement</h3>
            <span className="text-muted text-sm">{bids.length} bid(s) received</span>
          </div>
          <div className="card-body">
            {bids.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vendor</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                      <th>Delivery</th>
                      <th>Warranty</th>
                      <th>Status</th>
                      {/* Show Action column for: closed tenders OR open non-sealed tenders */}
                      {(rfq?.status === 'closed' || (rfq?.status === 'open' && !rfq?.isSealed)) && 
                        rfq?.status !== 'awarded' && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid, index) => {
                      // Can award if:
                      // 1. Tender is closed (deadline passed), OR
                      // 2. Tender is open AND not sealed (can award anytime)
                      const canAward = (rfq?.status === 'closed' || (rfq?.status === 'open' && !rfq?.isSealed)) 
                        && bid.status === 'pending' 
                        && rfq?.status !== 'awarded';
                      
                      return (
                        <tr 
                          key={bid._id}
                          className={lowestPrice && bid.totalPrice === lowestPrice ? 'table-highlight' : ''}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {bid.vendor?.companyName || 'Vendor'}
                              </span>
                              {bid.vendor?.verifiedBadge && (
                                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Verified</span>
                              )}
                            </div>
                            {bid.vendor?.rating?.average > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <IoStar className="text-warning" size={14} />
                                <span className="text-sm text-muted">
                                  {bid.vendor.rating.average.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            {bid.isSealed 
                              ? <span className="text-muted">***</span>
                              : `LKR ${bid.unitPrice?.toLocaleString()}`
                            }
                          </td>
                          <td className={lowestPrice && bid.totalPrice === lowestPrice ? 'text-primary font-semibold' : ''}>
                            {bid.isSealed 
                              ? <span className="text-muted">🔒 Sealed</span>
                              : `LKR ${bid.totalPrice?.toLocaleString()}`
                            }
                            {bid.isVATRegistered && !bid.isSealed && (
                              <span className="text-xs text-muted d-block">(incl. VAT)</span>
                            )}
                          </td>
                          <td>{bid.deliveryTimeline} days</td>
                          <td>{bid.warrantyPeriod || 0} months</td>
                          <td>
                            {bid.status === 'won' ? (
                              <span className="badge badge-success">Winner</span>
                            ) : bid.status === 'lost' ? (
                              <span className="badge badge-danger">Lost</span>
                            ) : (
                              <span className="badge badge-pending">Pending</span>
                            )}
                          </td>
                          {/* Award button */}
                          {canAward && (
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAward(bid._id)}
                                disabled={awarding}
                              >
                                <IoCheckmarkCircle /> Award
                              </button>
                            </td>
                          )}
                          {/* Show dash if action column exists but can't award this bid */}
                          {(rfq?.status === 'closed' || (rfq?.status === 'open' && !rfq?.isSealed)) 
                            && rfq?.status !== 'awarded' 
                            && !canAward && (
                            <td>-</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No bids received yet for this tender.</p>
              </div>
            )}
          </div>
          {bids.length > 0 && !bids[0].isSealed && (
            <div className="card-footer">
              <button className="btn btn-secondary btn-sm">
                <IoDownload /> Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Lowest Price Highlight */}
        {lowestPrice && (
          <div className="card mt-4">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-muted">Lowest Bid</span>
                  <h3 className="text-primary">LKR {lowestPrice.toLocaleString()}</h3>
                </div>
                <div className="text-right">
                  <span className="text-muted">Total Bids</span>
                  <h3>{bids.length}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBids;
