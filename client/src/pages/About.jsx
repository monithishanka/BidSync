import { Link } from 'react-router-dom';
import { 
  IoRocket, 
  IoShieldCheckmark, 
  IoEye,
  IoHeart,
  IoGlobeOutline,
  IoLogoGithub,
  IoPeople,
  IoCodeSlash,
  IoSchool,
  IoCheckmarkCircle
} from 'react-icons/io5';
import './About.css';

const About = () => {
  const coreValues = [
    {
      icon: <IoShieldCheckmark size={32} />,
      title: 'Transparency',
      description: 'Our sealed bidding system ensures complete fairness and eliminates any possibility of bid manipulation or favoritism.'
    },
    {
      icon: <IoEye size={32} />,
      title: 'Integrity',
      description: 'We uphold the highest ethical standards in all our operations, ensuring trust between buyers and vendors.'
    },
    {
      icon: <IoRocket size={32} />,
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to streamline procurement processes and deliver exceptional user experiences.'
    },
    {
      icon: <IoHeart size={32} />,
      title: 'User-Centric',
      description: 'Every feature we build is designed with our users in mind, making procurement accessible and efficient for all.'
    }
  ];

  const teamMembers = [
    {
      name: 'Group 26',
      role: 'Development Team',
      description: 'A dedicated team of developers committed to revolutionizing the procurement industry through innovative technology solutions.'
    }
  ];

  const projectHighlights = [
    'Secure sealed bidding with end-to-end encryption',
    'Real-time notifications and updates',
    'Comprehensive vendor verification (KYC)',
    'Intuitive user interface for all stakeholders',
    'Transparent evaluation and award process',
    'Full audit trail for compliance'
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1 className="about-title">About BidSync</h1>
          <p className="about-subtitle">
            Revolutionizing procurement through transparency, security, and innovation
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Mission</span>
            <h2 className="section-title">Transforming Procurement for a Fairer Future</h2>
          </div>
          
          <div className="mission-content">
            <div className="mission-text">
              <p className="lead-text">
                BidSync is a modern micro-procurement and tender management platform designed to bring 
                transparency, efficiency, and fairness to the bidding process.
              </p>
              <p>
                We believe that every organization deserves access to fair and competitive procurement. 
                Traditional tender processes are often plagued by opacity, inefficiency, and potential 
                for corruption. BidSync addresses these challenges head-on with our innovative sealed 
                bidding technology.
              </p>
              <p>
                Our platform empowers both buyers seeking quality goods and services, and vendors looking 
                for fair opportunities to showcase their offerings. By ensuring that all bids remain 
                confidential until the deadline, we create a level playing field where merit and value 
                determine the outcome.
              </p>
            </div>
            <div className="mission-visual">
              <div className="mission-card">
                <IoGlobeOutline size={64} className="mission-icon" />
                <h3>Our Vision</h3>
                <p>To become the global standard for transparent and efficient procurement, fostering trust and fair competition in every transaction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Values</span>
            <h2 className="section-title">What Drives Us</h2>
            <p className="section-subtitle">The principles that guide every decision we make</p>
          </div>

          <div className="values-grid">
            {coreValues.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Highlights */}
      <section className="highlights-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Platform Features</span>
            <h2 className="section-title">What Makes BidSync Special</h2>
          </div>

          <div className="highlights-content">
            <ul className="highlights-list">
              {projectHighlights.map((highlight, index) => (
                <li key={index}>
                  <IoCheckmarkCircle className="check-icon" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">The Team</span>
            <h2 className="section-title">Built by Group 26</h2>
            <p className="section-subtitle">
              This project was developed as part of an academic initiative
            </p>
          </div>

          <div className="team-content">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">
                  <IoPeople size={64} />
                </div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>

          <div className="academic-note">
            <IoSchool size={24} />
            <p>
              BidSync was developed as a comprehensive project to demonstrate modern web development 
              practices, secure system design, and user-centered software engineering principles.
            </p>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="opensource-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Open Source</span>
            <h2 className="section-title">View Our Project</h2>
            <p className="section-subtitle">
              Explore the codebase and contribute to the project
            </p>
          </div>

          <div className="github-card">
            <div className="github-icon">
              <IoLogoGithub size={64} />
            </div>
            <div className="github-content">
              <h3>BidSync Repository</h3>
              <p>
                Check out our project on GitHub to explore the source code, documentation, 
                and technical architecture behind BidSync.
              </p>
              {/* TODO: Replace the href below with your actual GitHub repository URL */}
              <a 
                href="https://github.com/YOUR_USERNAME/BidSync" 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
              >
                <IoCodeSlash size={20} />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Experience Transparent Procurement?</h2>
          <p>Join the revolution in fair and efficient bidding</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/how-it-works" className="btn btn-outline btn-lg">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
