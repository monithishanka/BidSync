import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  IoDocumentText, IoPeople, IoCheckmarkCircle, IoTime, 
  IoTrophy, IoShield, IoLogOut, IoHome, IoSettings, IoLockClosed
} from 'react-icons/io5';
import './Admin.css';

const AdminDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ status: 'pending' })
      ]);
      setStats(statsRes.data);
      setPendingUsers(usersRes.data.users || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('User approved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await adminAPI.rejectUser(userId, { reason });
      toast.success('User rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
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

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="admin-logo">
            <span className="logo-icon">B</span>
            <span>BidSync Admin</span>
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <IoHome /> Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <IoPeople /> Users
            {stats?.stats?.pendingApprovals > 0 && (
              <span className="nav-badge">{stats.stats.pendingApprovals}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            <IoShield /> KYC Verification
          </button>
          <button
            className={`nav-item ${activeTab === 'tenders' ? 'active' : ''}`}
            onClick={() => setActiveTab('tenders')}
          >
            <IoDocumentText /> Tenders
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <IoSettings /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <IoLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'kyc' && 'KYC Verification'}
            {activeTab === 'tenders' && 'Tender Management'}
            {activeTab === 'settings' && 'Account Settings'}
          </h1>
          <span className="admin-user">
            Logged in as: {user?.email}
          </span>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && stats && (
            <>
              {/* Stats Grid */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="stat-icon blue">
                    <IoDocumentText size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.stats.totalTenders}</span>
                    <span className="stat-label">Total Tenders</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-icon green">
                    <IoCheckmarkCircle size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.stats.activeTenders}</span>
                    <span className="stat-label">Active Tenders</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-icon orange">
                    <IoTime size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.stats.closingToday}</span>
                    <span className="stat-label">Closing Today</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-icon purple">
                    <IoTrophy size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.stats.awardedToday}</span>
                    <span className="stat-label">Awarded Today</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-icon teal">
                    <IoPeople size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.stats.totalUsers}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                </div>
                <div className="admin-stat-card highlight">
                  <div className="stat-icon red">
                    <IoShield size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.stats.pendingApprovals}</span>
                    <span className="stat-label">Pending Approvals</span>
                  </div>
                </div>
              </div>

              {/* User Distribution */}
              <div className="admin-card">
                <h3>User Distribution</h3>
                <div className="user-distribution">
                  <div className="dist-bar">
                    <div 
                      className="dist-segment buyers"
                      style={{ width: `${(stats.usersByRole?.buyer || 0) / (stats.stats.totalUsers || 1) * 100}%` }}
                    >
                      Buyers: {stats.usersByRole?.buyer || 0}
                    </div>
                    <div 
                      className="dist-segment vendors"
                      style={{ width: `${(stats.usersByRole?.vendor || 0) / (stats.stats.totalUsers || 1) * 100}%` }}
                    >
                      Vendors: {stats.usersByRole?.vendor || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="admin-card">
                <h3>Recent Activity</h3>
                {stats.recentActivity?.length > 0 ? (
                  <ul className="activity-list">
                    {stats.recentActivity.map((log, i) => (
                      <li key={i} className="activity-item">
                        <span className="activity-action">{log.action}</span>
                        <span className="activity-desc">{log.description}</span>
                        <span className="activity-time">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No recent activity</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="admin-card">
              <h3>Pending User Approvals</h3>
              {pendingUsers.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.companyName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApproveUser(user._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRejectUser(user._id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted text-center py-4">No pending approvals</p>
              )}
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="admin-card">
              <h3>KYC Verification Requests</h3>
              <p className="text-muted text-center py-4">
                KYC verification management coming soon
              </p>
            </div>
          )}

          {activeTab === 'tenders' && (
            <div className="admin-card">
              <h3>Tender Overview</h3>
              <p className="text-muted text-center py-4">
                Tender management coming soon
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <>
              {/* Account Info */}
              <div className="admin-card">
                <h3>Account Information</h3>
                <div className="settings-info">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Role</span>
                    <span className="badge badge-info">Administrator</span>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="admin-card">
                <h3><IoLockClosed style={{ marginRight: '0.5rem' }} /> Change Password</h3>
                <form onSubmit={handlePasswordChange} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-row-admin">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        minLength={6}
                        required
                      />
                      <span className="form-hint">Minimum 6 characters</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={passwordLoading}
                    >
                      <IoLockClosed /> {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
