import { Link } from 'react-router-dom';
import { IoSearch, IoShieldCheckmark, IoTime, IoLockClosed, IoTrendingUp, IoCheckmarkCircle, IoStar, IoChevronForward } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { rfqAPI } from '../services/api';
import RFQCard from '../components/rfq/RFQCard';
import './Home.css';

const Home = () => {
  const [latestTenders, setLatestTenders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tendersRes, categoriesRes] = await Promise.all([
        rfqAPI.getAll({ limit: 7, status: 'open', sort: 'newest' }),
        rfqAPI.getCategories()
      ]);
      setLatestTenders(tendersRes.data.rfqs || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/tenders?search=${searchQuery}&category=${category}`;
  };

  const features = [
    {
      icon: <IoLockClosed size={28} />,
      title: 'Sealed Bidding',
      description: 'Bids remain encrypted until deadline. Complete transparency and anti-corruption.'
    },
    {
      icon: <IoShieldCheckmark size={28} />,
      title: 'Verified Suppliers',
      description: 'KYC-verified vendors with business registration for trusted partnerships.'
    },
    {
      icon: <IoTime size={28} />,
      title: 'Real-Time Tracking',
      description: 'Monitor tender status, bid submissions, and awards in real-time.'
    },
    {
      icon: <IoTrendingUp size={28} />,
      title: 'Smart Analytics',
      description: 'Comparative statements and audit reports at your fingertips.'
    }
  ];

  const popularCategories = [
    { name: 'IT & Electronics', icon: '💻', count: 45 },
    { name: 'Construction & Raw Materials', icon: '🏗️', count: 32 },
    { name: 'Office Stationery', icon: '📝', count: 28 },
    { name: 'Furniture', icon: '🪑', count: 21 },
    { name: 'Medical Equipment', icon: '🏥', count: 18 },
    { name: 'Vehicles & Spare Parts', icon: '🚗', count: 15 }
  ];

  const trustedBrands = [
    'Ministry of Finance',
    'Ceylon Electricity Board',
    'Sri Lanka Telecom',
    'Bank of Ceylon',
    'Dialog Axiata',
    'John Keells Holdings'
  ];

  const testimonials = [
    {
      quote: "BidSync has transformed our procurement process. The sealed bidding feature ensures complete transparency.",
      author: "Procurement Manager",
      company: "Ministry of Education",
      rating: 5
    },
    {
      quote: "As a vendor, I love the fair bidding system. No more worrying about bid manipulation.",
      author: "Business Owner",
      company: "Tech Solutions Ltd",
      rating: 5
    },
    {
      quote: "The comparative statement feature saves us hours of manual work. Highly recommended!",
      author: "CFO",
      company: "National Bank",
      rating: 5
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transparent Procurement for a
              <span className="hero-highlight"> Better Tomorrow</span>
            </h1>
            <p className="hero-subtitle">
              Discover, bid, and win government and corporate tenders with BidSync's 
              modern sealed bidding platform. Fair, transparent, and corruption-free.
            </p>

            {/* Search Bar */}
            <div className="hero-search-wrapper">
              <form className="hero-search" onSubmit={handleSearch}>
                <div className="search-field search-field-main">
                  <IoSearch className="field-icon" size={20} />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="search-divider"></div>
                <div className="search-field search-field-category">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="field-select"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="search-btn">
                  <IoSearch size={20} />
                  <span>Search</span>
                </button>
              </form>
              <div className="search-tags">
                <span className="search-tags-label">Popular:</span>
                <Link to="/tenders?category=IT & Electronics" className="search-tag">IT & Electronics</Link>
                <Link to="/tenders?category=Construction" className="search-tag">Construction</Link>
                <Link to="/tenders?category=Office Supplies" className="search-tag">Office Supplies</Link>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Active Tenders</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">2,000+</span>
                <span className="stat-label">Verified Vendors</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">LKR 50M+</span>
                <span className="stat-label">Awarded Value</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg"></div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose BidSync</span>
            <h2 className="section-title">Platform Built for Transparency</h2>
            <p className="section-subtitle">
              Our sealed bidding protocol ensures fair competition and eliminates corruption
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Tenders Section */}
      <section className="tenders-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Latest Opportunities</span>
            <h2 className="section-title">Recent Tenders</h2>
            <p className="section-subtitle">
              Explore the newest procurement opportunities from across Sri Lanka
            </p>
          </div>

          {loading ? (
            <div className="tender-list">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="skeleton skeleton-card-list"></div>
              ))}
            </div>
          ) : (
            <div className="tender-list">
              {latestTenders.map((rfq) => (
                <RFQCard key={rfq._id} rfq={rfq} />
              ))}
            </div>
          )}

          <div className="section-action">
            <Link to="/tenders" className="btn btn-primary btn-lg">
              View All Tenders <IoChevronForward />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Browse by Industry</span>
            <h2 className="section-title">Popular Categories</h2>
          </div>

          <div className="categories-grid">
            {popularCategories.map((cat, index) => (
              <Link 
                key={index} 
                to={`/tenders?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <h4 className="category-name">{cat.name}</h4>
                <span className="category-count">{cat.count} tenders</span>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-tag">About BidSync</span>
              <h2 className="section-title">Modernizing Procurement in Sri Lanka</h2>
              <p className="about-text">
                BidSync is a revolutionary micro-procurement platform designed to bring 
                transparency, efficiency, and fairness to the tender management process. 
                Our sealed bidding algorithm ensures that no party can view bid prices 
                until the deadline expires, eliminating corruption and favoritism.
              </p>
              <ul className="about-list">
                <li><IoCheckmarkCircle className="check-icon" /> Anti-corruption sealed bidding</li>
                <li><IoCheckmarkCircle className="check-icon" /> Complete audit trail</li>
                <li><IoCheckmarkCircle className="check-icon" /> Government & corporate compatible</li>
                <li><IoCheckmarkCircle className="check-icon" /> Mobile-responsive platform</li>
              </ul>
              <Link to="/about" className="btn btn-primary">
                Learn More About Us
              </Link>
            </div>
            <div className="about-image">
              <div className="about-img-placeholder">
                <span>📊</span>
                <p>Transparent Procurement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">What People Say</span>
            <h2 className="section-title">Trusted by Thousands</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <IoStar key={i} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.author.charAt(0)}</div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.author}</span>
                    <span className="author-company">{testimonial.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Bidding?</h2>
            <p>Join thousands of vendors and buyers on Sri Lanka's most transparent procurement platform.</p>
            <div className="cta-buttons">
              <Link to="/signup#vendor" className="btn btn-primary btn-lg">
                Register as Vendor
              </Link>
              <Link to="/signup#buyer" className="btn btn-secondary btn-lg">
                Register as Buyer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
