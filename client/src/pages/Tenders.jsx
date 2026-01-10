import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rfqAPI } from '../services/api';
import RFQCard from '../components/rfq/RFQCard';
import { IoSearch } from 'react-icons/io5';
import './Tenders.css';

// Sri Lanka Districts
const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const Tenders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || 'open',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    district: searchParams.get('district') || '',
    sortBy: searchParams.get('sortBy') || 'closingSoonest'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRfqs();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await rfqAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.minBudget) params.minBudget = filters.minBudget;
      if (filters.maxBudget) params.maxBudget = filters.maxBudget;
      if (filters.district) params.district = filters.district;
      
      const response = await rfqAPI.getAll(params);
      setRfqs(response.data.rfqs || []);
    } catch (error) {
      console.error('Failed to fetch tenders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRfqs();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: 'open',
      minBudget: '',
      maxBudget: '',
      district: ''
    });
    setSearchParams({});
  };

  const activeFilterCount = [
    filters.category,
    filters.minBudget,
    filters.maxBudget,
    filters.district,
    filters.status !== 'open' ? filters.status : ''
  ].filter(Boolean).length;

  return (
    <div className="tenders-page">
      <div className="container">
        {/* Header */}
        <div className="tenders-header">
          <div>
            <h1>Browse Tenders</h1>
            <p>Find and bid on open procurement opportunities</p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <IoSearch className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search tenders by title, description..."
                className="search-input"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Main Content with Sidebar */}
        <div className="tenders-layout">
          {/* Left Sidebar Filters */}
          <aside className="tenders-sidebar">
            <div className="sidebar-header">
              <h3>Filters</h3>
              {activeFilterCount > 0 && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="filter-section">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Budget Range Filter */}
            <div className="filter-section">
              <label className="filter-label">Budget Range (LKR)</label>
              <div className="budget-inputs">
                <div className="budget-input-group">
                  <span className="input-label">Min</span>
                  <input
                    type="number"
                    placeholder="10,000"
                    className="budget-input"
                    value={filters.minBudget}
                    onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                    min="0"
                    step="1000"
                  />
                </div>
                <span className="budget-separator">—</span>
                <div className="budget-input-group">
                  <span className="input-label">Max</span>
                  <input
                    type="number"
                    placeholder="1,000,000"
                    className="budget-input"
                    value={filters.maxBudget}
                    onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
              <div className="budget-presets">
                <button 
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    handleFilterChange('minBudget', '');
                    handleFilterChange('maxBudget', '100000');
                  }}
                >
                  Under 100K
                </button>
                <button 
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    handleFilterChange('minBudget', '100000');
                    handleFilterChange('maxBudget', '500000');
                  }}
                >
                  100K - 500K
                </button>
                <button 
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    handleFilterChange('minBudget', '500000');
                    handleFilterChange('maxBudget', '');
                  }}
                >
                  Above 500K
                </button>
              </div>
            </div>

            {/* Location (District) Filter */}
            <div className="filter-section">
              <label className="filter-label">Location (District)</label>
              <select
                className="filter-select"
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              >
                <option value="">All Districts</option>
                {DISTRICTS.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Status Toggle */}
            <div className="filter-section">
              <label className="filter-label">Status</label>
              <div className="status-radios">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="status"
                    value="open"
                    checked={filters.status === 'open'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-label">Open</span>
                  <span className="radio-default">(Default)</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="status"
                    value="closed"
                    checked={filters.status === 'closed'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-label">Closed</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="status"
                    value="all"
                    checked={filters.status === 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-label">All</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="tenders-main">
            <div className="results-header">
              <span className="results-count">
                {rfqs.length} tender{rfqs.length !== 1 ? 's' : ''} found
              </span>
              <div className="sort-dropdown">
                <label>Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="sort-select"
                >
                  <option value="closingSoonest">Closing Soonest</option>
                  <option value="newest">Newest Listed</option>
                  <option value="highValue">High Value</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="tenders-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="skeleton skeleton-card"></div>
                ))}
              </div>
            ) : rfqs.length > 0 ? (
              <div className="tenders-grid">
                {rfqs.map(rfq => (
                  <RFQCard key={rfq._id} rfq={rfq} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No tenders found</h3>
                <p>Try adjusting your search or filter criteria.</p>
                {activeFilterCount > 0 && (
                  <button className="btn btn-secondary mt-3" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Tenders;
