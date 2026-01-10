import { useState } from 'react';
import { IoMail, IoCall, IoLocation, IoSend, IoPerson, IoDocument } from 'react-icons/io5';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p className="contact-description">
                Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
              </p>

              <div className="contact-cards">
                <div className="contact-card">
                  <div className="contact-card-icon">
                    <IoMail size={24} />
                  </div>
                  <div className="contact-card-content">
                    <h4>Email</h4>
                    <a href="mailto:support@bidsync.lk">support@bidsync.lk</a>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon">
                    <IoCall size={24} />
                  </div>
                  <div className="contact-card-content">
                    <h4>Phone</h4>
                    <a href="tel:+94112345678">+94 11 234 5678</a>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon">
                    <IoLocation size={24} />
                  </div>
                  <div className="contact-card-content">
                    <h4>Address</h4>
                    <p>123 Business Center,<br />Colombo 03, Sri Lanka</p>
                  </div>
                </div>
              </div>

              <div className="business-hours">
                <h4>Business Hours</h4>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Send a Message</h2>
                
                <div className="form-group">
                  <label className="form-label">
                    <IoPerson size={16} />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <IoMail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <IoDocument size={16} />
                    Subject
                  </label>
                  <select
                    name="subject"
                    className="form-input"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    className="form-input form-textarea"
                    placeholder="Write your message here..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  <IoSend size={18} />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
