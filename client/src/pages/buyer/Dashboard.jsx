import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { IoDocumentText, IoCheckmarkCircle, IoTime, IoTrophy, IoEye, IoCreate, IoTrash, IoSend, IoClose } from 'react-icons/io5';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './Dashboard.css';

const BuyerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    awarded: 0,
    draft: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      navigate('/login#buyer');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await rfqAPI.getMy({});
      const allRfqs = response.data.rfqs || [];
      setRfqs(allRfqs);
      
      // Calculate stats
      const statsObj = {
        total: allRfqs.length,
        open: allRfqs.filter(r => r.status === 'open').length,
        closed: allRfqs.filter(r => r.status === 'closed').length,
        awarded: allRfqs.filter(r => r.status === 'awarded').length,
        draft: allRfqs.filter(r => r.status === 'draft').length,
        cancelled: allRfqs.filter(r => r.status === 'cancelled').length
      };
      setStats(statsObj);
    } catch (error) {
      toast.error('Failed to fetch RFQs');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRfqs = () => {
    if (activeTab === 'all') return rfqs;
    return rfqs.filter(r => r.status === activeTab);
  };

  const handleViewDetails = (rfq) => {
    setSelectedRfq(rfq);
    setShowModal(true);
  };

  const handlePublish = async (rfqId) => {
    try {
      await rfqAPI.update(rfqId, { status: 'open' });
      toast.success('RFQ published successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish RFQ');
    }
  };

  const handleDelete = async (rfqId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Delete RFQ',
      message: 'Are you sure you want to delete this RFQ? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await rfqAPI.delete(rfqId);
          toast.success('RFQ deleted successfully');
          fetchDashboardData();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete RFQ');
        }
      }
    });
  };

  const handleCancel = async (rfqId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: 'Cancel RFQ',
      message: 'Are you sure you want to cancel this RFQ? This will notify all bidders and cannot be undone.',
      onConfirm: async () => {
        try {
          await rfqAPI.delete(rfqId);
          toast.success('RFQ cancelled successfully');
          fetchDashboardData();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to cancel RFQ');
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <span className="badge badge-draft">Draft</span>;
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
            <h1>Buyer Dashboard</h1>
            <p>Welcome back, {user?.companyName}</p>
          </div>
          <Link to="/buyer/create-rfq" className="btn btn-primary">
            + Create New RFQ
          </Link>
        </div>

        {/* Pending Approval Notice */}
        {!user?.isApproved && (
          <div className="alert alert-warning mb-4">
            <strong>Account Pending Approval</strong>
            <p>Your account is awaiting admin approval. You cannot create RFQs until approved.</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => setActiveTab('all')}>
            <div className="stat-icon total">
              <IoDocumentText size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total RFQs</span>
            </div>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('open')}>
            <div className="stat-icon open">
              <IoTime size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.open}</span>
              <span className="stat-label">Open</span>
            </div>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('closed')}>
            <div className="stat-icon closed">
              <IoCheckmarkCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.closed}</span>
              <span className="stat-label">Closed</span>
            </div>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('awarded')}>
            <div className="stat-icon awarded">
              <IoTrophy size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.awarded}</span>
              <span className="stat-label">Awarded</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs mb-4">
          <button
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-tab ${activeTab === 'draft' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft')}
          >
            Drafts ({stats.draft})
          </button>
          <button
            className={`filter-tab ${activeTab === 'open' ? 'active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open ({stats.open})
          </button>
          <button
            className={`filter-tab ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed ({stats.closed})
          </button>
          <button
            className={`filter-tab ${activeTab === 'awarded' ? 'active' : ''}`}
            onClick={() => setActiveTab('awarded')}
          >
            Awarded ({stats.awarded})
          </button>
          <button
            className={`filter-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>

        {/* RFQs Table */}
        <div className="card">
          <div className="card-body">
            {getFilteredRfqs().length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Closing Date</th>
                      <th>Bids</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredRfqs().map(rfq => (
                      <tr key={rfq._id}>
                        <td className="font-medium">{rfq.referenceId}</td>
                        <td className="truncate" style={{ maxWidth: '200px' }}>{rfq.title}</td>
                        <td>{rfq.category}</td>
                        <td>{new Date(rfq.closingDate).toLocaleDateString()}</td>
                        <td>{rfq.bidCount || 0}</td>
                        <td>{getStatusBadge(rfq.status)}</td>
                        <td>
                          <div className="action-btns">
                            {/* View Details Button - for all */}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleViewDetails(rfq)}
                              title="View Details"
                            >
                              <IoEye />
                            </button>

                            {/* Draft specific actions */}
                            {rfq.status === 'draft' && (
                              <>
                                <Link
                                  to={`/buyer/edit-rfq/${rfq._id}`}
                                  className="btn btn-ghost btn-sm"
                                  title="Edit"
                                >
                                  <IoCreate />
                                </Link>
                                <button
                                  className="btn btn-outline-success btn-sm btn-publish"
                                  onClick={() => handlePublish(rfq._id)}
                                  title="Publish"
                                >
                                  <IoSend /> Publish
                                </button>
                                <button
                                  className="btn btn-danger btn-sm btn-action-end"
                                  onClick={() => handleDelete(rfq._id)}
                                  title="Delete"
                                >
                                  <IoTrash />
                                </button>
                              </>
                            )}

                            {/* Open RFQ actions */}
                            {rfq.status === 'open' && (
                              <>
                                <Link
                                  to={`/buyer/rfq/${rfq._id}/bids`}
                                  className="btn btn-primary btn-sm btn-view-bids"
                                >
                                  View Bids ({rfq.bidCount || 0})
                                </Link>
                                <button
                                  className="btn btn-danger btn-sm btn-action-end"
                                  onClick={() => handleCancel(rfq._id)}
                                  title="Cancel RFQ"
                                >
                                  <IoClose />
                                </button>
                              </>
                            )}

                            {/* Closed RFQ actions */}
                            {rfq.status === 'closed' && (
                              <Link
                                to={`/buyer/rfq/${rfq._id}/bids`}
                                className="btn btn-primary btn-sm"
                              >
                                View Bids & Award
                              </Link>
                            )}

                            {/* Awarded RFQ actions */}
                            {rfq.status === 'awarded' && (
                              <Link
                                to={`/buyer/rfq/${rfq._id}/bids`}
                                className="btn btn-ghost btn-sm"
                              >
                                View Details
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No RFQs found{activeTab !== 'all' ? ` with status "${activeTab}"` : ''}.</p>
                <Link to="/buyer/create-rfq" className="btn btn-primary mt-4">
                  Create Your First RFQ
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RFQ Details Modal */}
      {showModal && selectedRfq && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content rfq-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>RFQ Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <IoClose size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="rfq-detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Reference ID</span>
                  <span className="detail-value">{selectedRfq.referenceId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Title</span>
                  <span className="detail-value">{selectedRfq.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{selectedRfq.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{getStatusBadge(selectedRfq.status)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Closing Date</span>
                  <span className="detail-value">{new Date(selectedRfq.closingDate).toLocaleString()}</span>
                </div>
                {selectedRfq.budgetPrice && (
                  <div className="detail-row">
                    <span className="detail-label">Budget</span>
                    <span className="detail-value">LKR {selectedRfq.budgetPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Sealed Bidding</span>
                  <span className="detail-value">{selectedRfq.isSealed ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Bids</span>
                  <span className="detail-value">{selectedRfq.bidCount || 0}</span>
                </div>
                {selectedRfq.deliveryLocation && (
                  <div className="detail-row">
                    <span className="detail-label">Delivery Location</span>
                    <span className="detail-value">{selectedRfq.deliveryLocation}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Description</h4>
                <p>{selectedRfq.description}</p>
              </div>

              <div className="detail-section">
                <h4>Items</h4>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRfq.items?.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              {selectedRfq.status === 'draft' && (
                <>
                  <Link
                    to={`/buyer/edit-rfq/${selectedRfq._id}`}
                    className="btn btn-secondary"
                  >
                    <IoCreate /> Edit
                  </Link>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      handlePublish(selectedRfq._id);
                      setShowModal(false);
                    }}
                  >
                    <IoSend /> Publish
                  </button>
                </>
              )}
              {['open', 'closed'].includes(selectedRfq.status) && (
                <Link
                  to={`/buyer/rfq/${selectedRfq._id}/bids`}
                  className="btn btn-primary"
                >
                  View Bids
                </Link>
              )}
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

export default BuyerDashboard;
