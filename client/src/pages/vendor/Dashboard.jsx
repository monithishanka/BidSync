import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bidAPI, rfqAPI } from '../../services/api';
import { IoDocumentText, IoTrophy, IoClose, IoTime } from 'react-icons/io5';
import '../buyer/Dashboard.css';

const VendorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recentBids, setRecentBids] = useState([]);
  const [openTenders, setOpenTenders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    won: 0,
    lost: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/login#vendor');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [bidsRes, tendersRes] = await Promise.all([
        bidAPI.getMyBids({ limit: 5 }),
        rfqAPI.getAll({ limit: 6, status: 'open' })
      ]);

      setRecentBids(bidsRes.data.bids || []);
      setStats(bidsRes.data.stats || { total: 0, pending: 0, won: 0, lost: 0 });
      setOpenTenders(tendersRes.data.rfqs || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending">Pending</span>;
      case 'won':
        return <span className="badge badge-success">Won</span>;
      case 'lost':
        return <span className="badge badge-danger">Lost</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="skeleton skeleton-heading"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '120px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Vendor Dashboard</h1>
            <p>Welcome back, {user?.companyName}</p>
          </div>
          <Link to="/tenders" className="btn btn-primary">
            Browse Open Tenders
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <IoDocumentText size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Bids</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <IoTime size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon won">
              <IoTrophy size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.won}</span>
              <span className="stat-label">Won</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon lost">
              <IoClose size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.lost}</span>
              <span className="stat-label">Lost</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent Bids */}
          <div className="card">
            <div className="card-header">
              <h3>My Recent Bids</h3>
              <Link to="/vendor/bids" className="btn btn-link-gray btn-sm">
                View All →
              </Link>
            </div>
            <div className="card-body p-0">
              {recentBids.length > 0 ? (
                <div className="recent-list">
                  {recentBids.map(bid => (
                    <Link 
                      key={bid._id} 
                      to={`/tenders/${bid.rfq?._id}`}
                      className="recent-item"
                    >
                      <div className="recent-item-main">
                        <div className="recent-item-icon bid-icon">
                          {bid.status === 'won' ? '🏆' : bid.status === 'lost' ? '❌' : '⏳'}
                        </div>
                        <div className="recent-item-content">
                          <span className="recent-item-title">{bid.rfq?.title || 'Unknown RFQ'}</span>
                          <div className="recent-item-meta">
                            <span className="recent-item-ref">{bid.rfq?.referenceId}</span>
                            <span className="recent-item-divider">•</span>
                            <span className="recent-item-price">LKR {bid.totalPrice?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="recent-item-right">
                        {getStatusBadge(bid.status)}
                        <span className="recent-item-date">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't submitted any bids yet.</p>
                  <Link to="/tenders" className="btn btn-primary btn-sm">
                    Browse Tenders
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Open Tenders */}
          <div className="card">
            <div className="card-header">
              <h3>Open Tenders</h3>
              <Link to="/tenders" className="btn btn-link-gray btn-sm">
                View All →
              </Link>
            </div>
            <div className="card-body p-0">
              {openTenders.length > 0 ? (
                <div className="recent-list">
                  {openTenders.map(tender => {
                    const daysLeft = Math.ceil((new Date(tender.closingDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <Link 
                        key={tender._id} 
                        to={`/tenders/${tender._id}`}
                        className="recent-item"
                      >
                        <div className="recent-item-main">
                          <div className="recent-item-icon tender-icon">
                            📋
                          </div>
                          <div className="recent-item-content">
                            <span className="recent-item-title">{tender.title}</span>
                            <div className="recent-item-meta">
                              <span className="category-pill">{tender.category}</span>
                              {tender.bidCount > 0 && (
                                <>
                                  <span className="recent-item-divider">•</span>
                                  <span>{tender.bidCount} bid(s)</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="recent-item-right">
                          <span className={`days-left ${daysLeft <= 2 ? 'urgent' : ''}`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Closing soon'}
                          </span>
                          <span className="recent-item-date">
                            {new Date(tender.closingDate).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No open tenders available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Approval Notice */}
        {!user?.isApproved && (
          <div className="alert alert-warning mt-4">
            <strong>Account Pending Approval</strong>
            <p>Your account is awaiting admin approval. You cannot submit bids until approved.</p>
          </div>
        )}

        {/* Verification Notice */}
        {user?.isApproved && !user?.verifiedBadge && (
          <div className="card mt-4">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h4>Get Verified! 🏆</h4>
                  <p className="text-muted">Upload your business documents to get a Verified Supplier badge.</p>
                </div>
                <Link to="/vendor/profile" className="btn btn-primary btn-sm">
                  Upload Documents
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
