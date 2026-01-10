import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const lastUpdated = 'January 10, 2026';

  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="container">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="legal-content">
        <div className="container">
          <div className="legal-document">
            <section className="legal-section">
              <h2>1. Introduction</h2>
              <p>
                BidSync ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your information when you use our platform. By using BidSync, you consent 
                to the data practices described in this policy.
              </p>
              <p>
                We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) and 
                Sri Lanka's data protection regulations. If you have questions about this policy, please contact us at 
                privacy@bidsync.online.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Information You Provide</h3>
              <p>We collect information that you voluntarily provide when you:</p>
              <ul>
                <li><strong>Register an account:</strong> Name, email address, phone number, company name, business registration number, tax ID, address</li>
                <li><strong>Complete KYC verification:</strong> Business registration documents, director/owner ID, proof of address</li>
                <li><strong>Post RFQs:</strong> Product/service specifications, quantities, budgets, delivery requirements</li>
                <li><strong>Submit bids:</strong> Pricing information, technical specifications, delivery timelines, supporting documents</li>
                <li><strong>Communicate with us:</strong> Messages, feedback, support requests</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <p>When you use our Platform, we automatically collect:</p>
              <ul>
                <li><strong>Device information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage data:</strong> Pages viewed, time spent on pages, links clicked, search queries</li>
                <li><strong>Log data:</strong> Access times, error logs, referral URLs</li>
                <li><strong>Cookies and tracking technologies:</strong> See Section 8 for details</li>
              </ul>

              <h3>2.3 Information from Third Parties</h3>
              <p>We may receive information from:</p>
              <ul>
                <li>Business verification services to validate company registration</li>
                <li>Payment processors (if applicable)</li>
                <li>Analytics providers to understand platform usage</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li><strong>Provide and operate the Platform:</strong> Process registrations, facilitate bidding, manage accounts</li>
                <li><strong>Verify identities:</strong> Conduct KYC checks to prevent fraud and ensure trusted partnerships</li>
                <li><strong>Process transactions:</strong> Enable RFQ creation, bid submission, and award notifications</li>
                <li><strong>Communicate with you:</strong> Send notifications, updates, marketing communications (with your consent)</li>
                <li><strong>Improve our services:</strong> Analyze usage patterns, conduct research, develop new features</li>
                <li><strong>Ensure security:</strong> Detect fraud, prevent abuse, protect user data</li>
                <li><strong>Comply with legal obligations:</strong> Respond to legal requests, enforce our Terms of Service</li>
                <li><strong>Generate analytics:</strong> Create aggregated, anonymized reports about platform usage</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. Legal Basis for Processing (GDPR)</h2>
              <p>If you are in the European Economic Area (EEA), we process your data based on:</p>
              <ul>
                <li><strong>Contract performance:</strong> To provide services you requested (e.g., bidding, posting RFQs)</li>
                <li><strong>Legitimate interests:</strong> To improve our platform, prevent fraud, and ensure security</li>
                <li><strong>Legal compliance:</strong> To comply with legal obligations (e.g., KYC requirements)</li>
                <li><strong>Consent:</strong> For marketing communications and optional features (you may withdraw consent anytime)</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>5. How We Share Your Information</h2>
              
              <h3>5.1 With Other Users</h3>
              <ul>
                <li><strong>Vendors:</strong> Your company name and bid details are visible to Buyers after the RFQ deadline expires</li>
                <li><strong>Buyers:</strong> Your organization name and RFQ details are visible to Vendors browsing tenders</li>
                <li><strong>Sealed bids:</strong> Bid prices remain encrypted and invisible until the deadline (even to us)</li>
              </ul>

              <h3>5.2 With Service Providers</h3>
              <p>We share data with trusted third parties who help us operate the Platform:</p>
              <ul>
                <li>Cloud hosting providers (e.g., AWS, Google Cloud)</li>
                <li>Email service providers (for notifications)</li>
                <li>Analytics providers (e.g., Google Analytics)</li>
                <li>Customer support tools</li>
                <li>Business verification services</li>
              </ul>
              <p>These providers are contractually obligated to protect your data and use it only for specified purposes.</p>

              <h3>5.3 For Legal Reasons</h3>
              <p>We may disclose your information if required by law, court order, or government request, or to:</p>
              <ul>
                <li>Enforce our Terms of Service</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate fraud or security issues</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h3>5.4 Business Transfers</h3>
              <p>
                If BidSync is acquired, merged, or sells assets, your information may be transferred to the new entity. 
                You will be notified of any such change.
              </p>

              <h3>5.5 With Your Consent</h3>
              <p>We may share your information with third parties when you explicitly consent.</p>
            </section>

            <section className="legal-section">
              <h2>6. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul>
                <li><strong>Encryption:</strong> All sensitive data (including bids) is encrypted using AES-256 encryption</li>
                <li><strong>Secure transmission:</strong> Data is transmitted over HTTPS/TLS</li>
                <li><strong>Access controls:</strong> Only authorized personnel can access user data</li>
                <li><strong>Regular audits:</strong> We conduct security audits and vulnerability assessments</li>
                <li><strong>Secure servers:</strong> Data is stored on secure, monitored servers</li>
              </ul>
              <p>
                However, no method of transmission or storage is 100% secure. While we strive to protect your data, we cannot 
                guarantee absolute security.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Your Data Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              
              <h3>7.1 Access and Portability</h3>
              <p>You can request a copy of your personal data in a structured, machine-readable format.</p>

              <h3>7.2 Correction</h3>
              <p>You can update or correct your information through your account settings or by contacting us.</p>

              <h3>7.3 Deletion</h3>
              <p>
                You can request deletion of your account and personal data. Note that we may retain certain data for legal 
                or legitimate business purposes (e.g., audit trails, fraud prevention).
              </p>

              <h3>7.4 Objection and Restriction</h3>
              <p>You can object to or request restriction of certain data processing activities.</p>

              <h3>7.5 Withdraw Consent</h3>
              <p>If processing is based on consent, you can withdraw it at any time.</p>

              <h3>7.6 Right to Complain</h3>
              <p>
                You have the right to lodge a complaint with a data protection authority if you believe we have violated 
                your privacy rights.
              </p>

              <p className="rights-contact">
                To exercise your rights, contact us at <strong>privacy@bidsync.online</strong>. We will respond within 30 days.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Cookies and Tracking Technologies</h2>
              
              <h3>8.1 What We Use</h3>
              <p>We use cookies, web beacons, and similar technologies to:</p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Authenticate your login session</li>
                <li>Analyze platform usage and traffic</li>
                <li>Provide personalized content and features</li>
              </ul>

              <h3>8.2 Types of Cookies</h3>
              <ul>
                <li><strong>Essential cookies:</strong> Required for platform functionality (e.g., login sessions)</li>
                <li><strong>Analytics cookies:</strong> Help us understand how users interact with the Platform (e.g., Google Analytics)</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              </ul>

              <h3>8.3 Managing Cookies</h3>
              <p>
                You can control cookies through your browser settings. Note that disabling essential cookies may affect 
                platform functionality.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Data Retention</h2>
              <p>We retain your information for as long as necessary to:</p>
              <ul>
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal obligations (e.g., tax records, audit trails)</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Prevent fraud and abuse</li>
              </ul>
              <p>
                After account deletion, we may retain certain data in anonymized or aggregated form for analytics. 
                Some data may be retained for legal compliance (typically 7 years for financial records).
              </p>
            </section>

            <section className="legal-section">
              <h2>10. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries outside Sri Lanka, including countries that may 
                have different data protection laws. We ensure appropriate safeguards are in place, such as:
              </p>
              <ul>
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Data Processing Agreements with service providers</li>
                <li>Compliance with applicable data transfer regulations</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>11. Children's Privacy</h2>
              <p>
                BidSync is not intended for individuals under the age of 18. We do not knowingly collect personal information 
                from children. If we become aware that we have collected data from a child, we will delete it promptly.
              </p>
            </section>

            <section className="legal-section">
              <h2>12. Marketing Communications</h2>
              <p>
                With your consent, we may send you promotional emails about new features, special offers, and platform updates. 
                You can opt out of marketing communications at any time by:
              </p>
              <ul>
                <li>Clicking "Unsubscribe" in any marketing email</li>
                <li>Updating your preferences in account settings</li>
                <li>Contacting us at privacy@bidsync.online</li>
              </ul>
              <p>Note: You cannot opt out of essential service communications (e.g., bid notifications, security alerts).</p>
            </section>

            <section className="legal-section">
              <h2>13. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you via 
                email or a prominent notice on the Platform. Your continued use after such changes constitutes acceptance 
                of the updated policy.
              </p>
            </section>

            <section className="legal-section">
              <h2>14. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:
              </p>
              <ul className="contact-list">
                <li><strong>Email:</strong> privacy@bidsync.online</li>
                <li><strong>Data Protection Officer:</strong> dpo@bidsync.online</li>
                <li><strong>Phone:</strong> +94 11 234 5678</li>
                <li><strong>Address:</strong> 123 Business Park, Colombo, Sri Lanka</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
