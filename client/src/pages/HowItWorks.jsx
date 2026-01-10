import { Link } from 'react-router-dom';
import { 
  IoPersonAdd, 
  IoDocumentText, 
  IoLockClosed, 
  IoCheckmarkCircle,
  IoSearch,
  IoTime,
  IoPricetag,
  IoShieldCheckmark,
  IoRocket,
  IoTrophy
} from 'react-icons/io5';
import './HowItWorks.css';

const HowItWorks = () => {
  const forVendors = [
    {
      icon: <IoPersonAdd size={32} />,
      title: 'Register & Get Verified',
      description: 'Sign up as a vendor and complete KYC verification with your business registration documents. Our team verifies your credentials within 24-48 hours.',
      step: '01'
    },
    {
      icon: <IoSearch size={32} />,
      title: 'Browse Tenders',
      description: 'Explore available tenders matching your expertise. Filter by category, location, budget range, and deadline to find opportunities that fit your business.',
      step: '02'
    },
    {
      icon: <IoDocumentText size={32} />,
      title: 'Prepare Your Bid',
      description: 'Review tender requirements carefully. Prepare your pricing, technical specifications, delivery timeline, and supporting documents.',
      step: '03'
    },
    {
      icon: <IoLockClosed size={32} />,
      title: 'Submit Sealed Bid',
      description: 'Submit your bid through our platform. Your bid is encrypted and sealed—no one can view it until the deadline. You can modify it anytime before the deadline.',
      step: '04'
    },
    {
      icon: <IoTime size={32} />,
      title: 'Wait for Deadline',
      description: 'After submission, your bid remains sealed until the tender deadline expires. All bids are opened simultaneously for fair evaluation.',
      step: '05'
    },
    {
      icon: <IoTrophy size={32} />,
      title: 'Award Notification',
      description: 'If you win, you\'ll receive an award notification. The buyer will contact you to finalize the purchase order, delivery, and payment terms.',
      step: '06'
    }
  ];

  const forBuyers = [
    {
      icon: <IoPersonAdd size={32} />,
      title: 'Create Buyer Account',
      description: 'Register as a buyer with your organization details. Provide company registration and contact information to get started.',
      step: '01'
    },
    {
      icon: <IoDocumentText size={32} />,
      title: 'Post Your RFQ',
      description: 'Create a Request for Quotation (RFQ) with detailed specifications, quantity, quality standards, delivery requirements, and evaluation criteria.',
      step: '02'
    },
    {
      icon: <IoPricetag size={32} />,
      title: 'Set Deadline',
      description: 'Choose an appropriate deadline (recommended 7-30 days) to give vendors sufficient time to prepare quality bids.',
      step: '03'
    },
    {
      icon: <IoLockClosed size={32} />,
      title: 'Receive Sealed Bids',
      description: 'Vendors submit their bids, which remain encrypted and invisible to everyone—including you—until the deadline expires.',
      step: '04'
    },
    {
      icon: <IoCheckmarkCircle size={32} />,
      title: 'Evaluate Bids',
      description: 'After the deadline, all bids are automatically unsealed. Review the comparative statement showing all bids side-by-side with pricing and specifications.',
      step: '05'
    },
    {
      icon: <IoRocket size={32} />,
      title: 'Award Contract',
      description: 'Select the best vendor based on price, quality, and delivery terms. Award the contract and proceed with procurement.',
      step: '06'
    }
  ];

  const keyFeatures = [
    {
      icon: <IoLockClosed size={28} />,
      title: 'Sealed Bidding',
      description: 'Military-grade encryption ensures bids remain confidential until the deadline'
    },
    {
      icon: <IoShieldCheckmark size={28} />,
      title: 'KYC Verified',
      description: 'All vendors undergo thorough verification for trusted partnerships'
    },
    {
      icon: <IoTime size={28} />,
      title: 'Real-Time Updates',
      description: 'Get instant notifications on bid submissions, awards, and deadlines'
    },
    {
      icon: <IoDocumentText size={28} />,
      title: 'Comparative Analysis',
      description: 'Auto-generated reports help buyers make informed decisions'
    }
  ];

  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="hiw-hero">
        <div className="container">
          <h1 className="hiw-title">How BidSync Works</h1>
          <p className="hiw-subtitle">
            Discover how our transparent sealed bidding platform revolutionizes procurement
          </p>
        </div>
      </section>

      {/* Sealed Bidding Explanation */}
      <section className="sealed-bidding-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Core Technology</span>
            <h2 className="section-title">Understanding Sealed Bidding</h2>
          </div>
          
          <div className="sealed-content">
            <div className="sealed-text">
              <p className="lead-text">
                Sealed bidding is the cornerstone of fair and transparent procurement. Here's why it matters:
              </p>
              <ul className="feature-list">
                <li>
                  <IoCheckmarkCircle className="check-icon" />
                  <span><strong>Complete Confidentiality:</strong> Bid prices are encrypted using AES-256 encryption and remain invisible until the deadline</span>
                </li>
                <li>
                  <IoCheckmarkCircle className="check-icon" />
                  <span><strong>Anti-Corruption:</strong> No party can view or manipulate bids, eliminating favoritism and collusion</span>
                </li>
                <li>
                  <IoCheckmarkCircle className="check-icon" />
                  <span><strong>Simultaneous Opening:</strong> All bids are unsealed at the exact same moment when the deadline expires</span>
                </li>
                <li>
                  <IoCheckmarkCircle className="check-icon" />
                  <span><strong>Audit Trail:</strong> Complete history of all actions is recorded for compliance and accountability</span>
                </li>
                <li>
                  <IoCheckmarkCircle className="check-icon" />
                  <span><strong>Fair Competition:</strong> Every vendor has an equal chance to win based on merit alone</span>
                </li>
              </ul>
            </div>
            <div className="sealed-visual">
              <div className="sealed-card">
                <IoLockClosed size={64} className="sealed-icon" />
                <h3>Bids are Sealed</h3>
                <p>Before Deadline</p>
              </div>
              <div className="arrow">→</div>
              <div className="sealed-card unlocked">
                <IoCheckmarkCircle size={64} className="sealed-icon" />
                <h3>Bids Unsealed</h3>
                <p>After Deadline</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Vendors */}
      <section className="process-section vendor-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">For Vendors</span>
            <h2 className="section-title">How to Participate in Tenders</h2>
            <p className="section-subtitle">Follow these simple steps to start bidding on procurement opportunities</p>
          </div>

          <div className="steps-grid">
            {forVendors.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="cta-box">
            <Link to="/signup#vendor" className="btn btn-primary btn-lg">
              Register as Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section className="process-section buyer-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">For Buyers</span>
            <h2 className="section-title">How to Post Tenders</h2>
            <p className="section-subtitle">Streamline your procurement process with our transparent platform</p>
          </div>

          <div className="steps-grid">
            {forBuyers.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="cta-box">
            <Link to="/signup#buyer" className="btn btn-secondary btn-lg">
              Register as Buyer
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="features-highlight">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose BidSync</span>
            <h2 className="section-title">Platform Features</h2>
          </div>

          <div className="features-grid">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="feature-box">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of organizations using BidSync for transparent procurement</p>
          <div className="cta-buttons">
            <Link to="/tenders" className="btn btn-primary btn-lg">
              Browse Tenders
            </Link>
            <Link to="/signup" className="btn btn-outline btn-lg">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
