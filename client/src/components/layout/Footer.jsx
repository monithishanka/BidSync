import { Link } from 'react-router-dom';
import { IoLogoFacebook, IoLogoTwitter, IoLogoLinkedin, IoLogoInstagram, IoMail, IoCall, IoLocation } from 'react-icons/io5';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-text">BidSync.</span>
            </Link>
            <p className="footer-tagline">
              Modern procurement platform for transparent and efficient tender management.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <IoLogoFacebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <IoLogoTwitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <IoLogoLinkedin size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <IoLogoInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/tenders">Browse Tenders</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div className="footer-column">
            <h4 className="footer-heading">For Vendors</h4>
            <ul className="footer-links">
              <li><Link to="/signup#vendor">Register as Vendor</Link></li>
              <li><Link to="/login#vendor">Vendor Login</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <IoLocation size={18} />
                <span>123 Business Park, Colombo, Sri Lanka</span>
              </li>
              <li>
                <IoCall size={18} />
                <span>+94 11 234 5678</span>
              </li>
              <li>
                <IoMail size={18} />
                <span>support@bidsync.online</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} BidSync. All rights reserved.
          </p>
          <div className="footer-legal">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
