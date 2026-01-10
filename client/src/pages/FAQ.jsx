import { useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      category: 'General Questions',
      questions: [
        {
          question: 'What is BidSync?',
          answer: 'BidSync is a modern micro-procurement and tender management platform designed to bring transparency, efficiency, and fairness to the bidding process. We use sealed bidding technology to ensure that all bids remain confidential until the deadline expires, eliminating corruption and favoritism.'
        },
        {
          question: 'How does sealed bidding work?',
          answer: 'Our sealed bidding system encrypts all bid submissions and ensures that no party—including buyers, vendors, or even administrators—can view the bid prices until the tender deadline has passed. Once the deadline expires, all bids are automatically unsealed simultaneously, ensuring a fair and transparent evaluation process.'
        },
        {
          question: 'Is BidSync free to use?',
          answer: 'Creating an account and browsing tenders is completely free. We charge a small service fee only when a vendor wins a tender or when buyers post RFQs. Our pricing is transparent and competitive, designed to make procurement accessible to organizations of all sizes.'
        },
        {
          question: 'Who can use BidSync?',
          answer: 'BidSync is designed for government agencies, corporations, SMEs, and individual vendors in Sri Lanka. Both buyers (organizations looking to procure goods/services) and vendors (suppliers bidding on tenders) can use our platform.'
        }
      ]
    },
    {
      category: 'For Vendors',
      questions: [
        {
          question: 'How do I register as a vendor?',
          answer: 'Click on "Register as Vendor" in the header or footer. You\'ll need to provide your company details, business registration number, contact information, and complete KYC verification. Once verified, you can start browsing and bidding on tenders immediately.'
        },
        {
          question: 'What documents do I need for KYC verification?',
          answer: 'You\'ll need to upload: (1) Business Registration Certificate, (2) Tax Identification Number (TIN), (3) Valid ID of company director/owner, and (4) Proof of company address. Our team typically verifies documents within 24-48 hours.'
        },
        {
          question: 'How do I submit a bid?',
          answer: 'Browse available tenders, select one that matches your expertise, and click "Submit Bid". Fill in your pricing, delivery timeline, technical specifications, and any required documents. You can edit your bid anytime before the deadline. Once submitted, your bid is encrypted and sealed.'
        },
        {
          question: 'Can I modify my bid after submission?',
          answer: 'Yes! You can modify your bid as many times as you want before the tender deadline. Each modification is encrypted and replaces your previous bid. Once the deadline passes, no modifications are allowed.'
        },
        {
          question: 'When will I know if I won a tender?',
          answer: 'After the tender deadline, buyers evaluate all bids using our comparative statement tool. You\'ll receive a notification once the buyer makes an award decision. The entire process is transparent, and you can view the comparative statement showing all bid prices after the deadline.'
        },
        {
          question: 'What happens if I win?',
          answer: 'Congratulations! The buyer will contact you directly through our platform messaging system to finalize the purchase order, delivery schedule, and payment terms. You\'ll also receive a formal award notification via email.'
        }
      ]
    },
    {
      category: 'For Buyers',
      questions: [
        {
          question: 'How do I post a tender (RFQ)?',
          answer: 'After registering as a buyer, navigate to your dashboard and click "Create New RFQ". Provide details about what you need to procure, specifications, quantity, deadline, and evaluation criteria. Once published, vendors can start submitting bids.'
        },
        {
          question: 'How long should I keep a tender open?',
          answer: 'We recommend keeping tenders open for at least 7-14 days to give vendors adequate time to prepare quality bids. For complex procurements, consider 21-30 days. You set the deadline when creating the RFQ.'
        },
        {
          question: 'Can I see bids before the deadline?',
          answer: 'No. Our sealed bidding protocol prevents anyone—including buyers, admins, and other vendors—from viewing bid prices until the deadline expires. This ensures complete fairness and prevents bid manipulation. You can only see the number of bids submitted.'
        },
        {
          question: 'How do I evaluate bids?',
          answer: 'After the deadline, all bids are automatically unsealed. You can view our auto-generated comparative statement showing all bids side-by-side with pricing, delivery times, and technical specifications. You can then award the tender to the most suitable vendor.'
        },
        {
          question: 'Can I cancel a tender after posting?',
          answer: 'Yes, you can cancel a tender at any time before awarding it. However, we encourage responsible posting to maintain vendor trust. If you need to modify specifications, you can edit the RFQ before the deadline or cancel and repost with updated requirements.'
        },
        {
          question: 'What payment methods are supported?',
          answer: 'Payment arrangements are made directly between buyers and vendors. BidSync facilitates the tender process but does not handle payments. You negotiate payment terms (bank transfer, cheque, installments, etc.) with the winning vendor.'
        }
      ]
    },
    {
      category: 'Account & Security',
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Absolutely. We use industry-standard encryption (AES-256) for all sensitive data, including bid submissions. Our platform is hosted on secure servers with regular security audits. We comply with data protection regulations and never share your information with third parties without consent.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your registered email, and we\'ll send you a password reset link. You can also change your password anytime from your profile settings.'
        },
        {
          question: 'Can I have multiple users from my organization?',
          answer: 'Yes! You can add team members to your account. Each user can have different roles (admin, procurement officer, viewer) with customized permissions. Manage team members from your account settings.'
        },
        {
          question: 'What should I do if I suspect fraudulent activity?',
          answer: 'Report any suspicious activity immediately to our admin team at admin@bidsync.online or use the "Report Issue" feature in your dashboard. We take fraud very seriously and investigate all reports promptly.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'Which browsers are supported?',
          answer: 'BidSync works best on modern browsers including Google Chrome (recommended), Firefox, Safari, and Microsoft Edge. Make sure your browser is updated to the latest version for optimal performance.'
        },
        {
          question: 'Is there a mobile app?',
          answer: 'Our platform is fully responsive and works seamlessly on mobile browsers. A dedicated mobile app is coming soon. For now, you can access all features through your mobile browser.'
        },
        {
          question: 'I\'m having technical issues. How do I get help?',
          answer: 'Contact our support team at support@bidsync.online or use the live chat feature (bottom right corner). We respond to support requests within 24 hours on business days. For urgent issues, call us at +94 11 234 5678.'
        },
        {
          question: 'Can I export tender data?',
          answer: 'Yes! You can export tender details, bid summaries, and comparative statements as PDF or Excel files. This is useful for record-keeping, audit purposes, and sharing with stakeholders.'
        }
      ]
    }
  ];

  let globalIndex = 0;

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <div className="container">
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            Find answers to common questions about BidSync's procurement platform
          </p>
        </div>
      </div>

      <div className="faq-content">
        <div className="container">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2 className="category-title">{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((faq) => {
                  const currentIndex = globalIndex++;
                  const isOpen = openIndex === currentIndex;
                  
                  return (
                    <div 
                      key={currentIndex} 
                      className={`faq-item ${isOpen ? 'active' : ''}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggleQuestion(currentIndex)}
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                      </button>
                      <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="faq-cta">
        <div className="container">
          <h2>Still have questions?</h2>
          <p>Can't find what you're looking for? Our support team is here to help.</p>
          <a href="mailto:support@bidsync.online" className="btn btn-primary">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
