import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bidAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { IoEye, IoTime, IoCheckmark, IoClose, IoTrash } from 'react-icons/io5';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import '../buyer/Dashboard.css';

const MyBids = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, won: 0, lost: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/login#vendor');
      return;
    }
    fetchBids();
  }, [isAuthenticated, user, navigate, filter]);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bidAPI.getMyBids(params);
      setBids(response.data.bids || []);
      setStats(response.data.stats || { total: 0, pending: 0, won: 0, lost: 0, cancelled: 0 });
    } catch (error) {
      console.error('Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = useCallback((createdAt) => {
    const submissionTime = new Date(createdAt);
    const fiveMinutesMs = 5 * 60 * 1000;
    const deadline = new Date(submissionTime.getTime() + fiveMinutesMs);
    const remaining = deadline - currentTime;
    
    if (remaining <= 0) return null;
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [currentTime]);

  const canCancelBid = (bid) => {
    if (bid.status !== 'pending') return false;
    if (bid.rfq?.status !== 'open') return false;
    
    const submissionTime = new Date(bid.createdAt);
    const fiveMinutesMs = 5 * 60 * 1000;
    return (currentTime - submissionTime) <= fiveMinutesMs;
  };

  const handleCancelBid = async (bidId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Cancel Bid',
      message: 'Are you sure you want to cancel this bid? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await bidAPI.cancel(bidId);
          toast.success('Bid cancelled successfully');
          fetchBids();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to cancel bid');
        }
      }
    });
  };

  const getStatusBadge = (bid) => {
    // For cancelled tenders, show blank bid status
    if (bid.rfq?.status === 'cancelled') {
      return <span className="text-muted">-</span>;
    }
    
    switch (bid.status) {
      case 'pending':
        return <span className="badge badge-pending">Pending</span>;
      case 'won':
        return <span className="badge badge-success">Won</span>;
      case 'lost':
        return <span className="badge badge-danger">Lost</span>;
      case 'under_review':
        return <span className="badge badge-info">Under Review</span>;
      case 'withdrawn':
        return <span className="badge badge-cancelled">Withdrawn</span>;
      default:
        return null;
    }
  };

  const getRfqStatusClass = (rfqStatus) => {
    if (rfqStatus === 'cancelled') return 'row-cancelled';
    return '';
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>My Bids</h1>
            <p>Track all your submitted bids and their status</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs mb-4">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <IoTime /> Pending ({stats.pending})
          </button>
          <button
            className={`filter-tab ${filter === 'won' ? 'active' : ''}`}
            onClick={() => setFilter('won')}
          >
            <IoCheckmark /> Won ({stats.won})
          </button>
          <button
            className={`filter-tab ${filter === 'lost' ? 'active' : ''}`}
            onClick={() => setFilter('lost')}
          >
            <IoClose /> Lost ({stats.lost})
          </button>
        </div>

        {/* Bids Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: '60px' }}></div>
                ))}
              </div>
            ) : bids.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Tender Title</th>
                      <th>Category</th>
                      <th>My Bid</th>
                      <th>Submitted</th>
                      <th>Tender Status</th>
                      <th>Bid Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map(bid => {
                      const cancelTimeRemaining = canCancelBid(bid) ? getTimeRemaining(bid.createdAt) : null;
                      const isTenderCancelled = bid.rfq?.status === 'cancelled';
                      
                      return (
                        <tr key={bid._id} className={getRfqStatusClass(bid.rfq?.status)}>
                          <td className="font-medium">{bid.rfq?.referenceId || '-'}</td>
                          <td className="truncate" style={{ maxWidth: '200px' }}>
                            {bid.rfq?.title || 'Unknown'}
                          </td>
                          <td>{bid.rfq?.category || '-'}</td>
                          <td className="font-semibold">
                            LKR {bid.totalPrice?.toLocaleString()}
                          </td>
                          <td>{new Date(bid.createdAt).toLocaleDateString()}</td>
                          <td>
                            {isTenderCancelled ? (
                              <span className="badge badge-cancelled">Cancelled</span>
                            ) : (
                              <span className={`badge badge-${bid.rfq?.status}`}>
                                {bid.rfq?.status?.charAt(0).toUpperCase() + bid.rfq?.status?.slice(1)}
                              </span>
                            )}
                          </td>
                          <td>{getStatusBadge(bid)}</td>
                          <td>
                            <div className="action-btns">
                              <Link 
                                to={`/tenders/${bid.rfq?._id}`}
                                className="btn btn-ghost btn-sm"
                              >
                                <IoEye /> View
                              </Link>
                              {cancelTimeRemaining && (
                                <button
                                  className="btn btn-danger btn-sm btn-cancel-bid"
                                  onClick={() => handleCancelBid(bid._id)}
                                  title="Cancel bid"
                                >
                                  <IoTrash /> {cancelTimeRemaining}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No bids found matching your filter.</p>
                <Link to="/tenders" className="btn btn-primary">
                  Browse Open Tenders
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .row-cancelled {
          background-color: var(--gray-50);
          opacity: 0.8;
        }
        
        .row-cancelled td {
          color: var(--text-muted);
        }
        
        .badge-cancelled {
          background-color: var(--gray-200);
          color: var(--gray-600);
        }
        
        .btn-cancel-bid {
          font-size: 0.75rem;
          padding: 0.375rem 0.625rem;
        }
      `}</style>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default MyBids;
