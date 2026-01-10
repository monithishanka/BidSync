import './TermsOfService.css';

const TermsOfService = () => {
  const lastUpdated = 'January 10, 2026';

  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="container">
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-subtitle">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="legal-content">
        <div className="container">
          <div className="legal-document">
            <section className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to BidSync. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, please do not use our services. BidSync reserves the right to modify these Terms 
                at any time, and such modifications will be effective upon posting. Your continued use of the platform after any 
                changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Definitions</h2>
              <ul>
                <li><strong>"Platform"</strong> refers to the BidSync website, mobile applications, and all associated services.</li>
                <li><strong>"User"</strong> refers to any person or entity that accesses or uses the Platform.</li>
                <li><strong>"Buyer"</strong> refers to users who post Request for Quotations (RFQs) or tenders.</li>
                <li><strong>"Vendor"</strong> refers to users who submit bids on RFQs or tenders.</li>
                <li><strong>"RFQ"</strong> refers to a Request for Quotation or tender posted by a Buyer.</li>
                <li><strong>"Bid"</strong> refers to a proposal submitted by a Vendor in response to an RFQ.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. User Accounts</h2>
              <h3>3.1 Registration</h3>
              <p>
                To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, 
                and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              
              <h3>3.2 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur 
                under your account. You agree to immediately notify BidSync of any unauthorized use of your account or any other 
                breach of security.
              </p>

              <h3>3.3 KYC Verification</h3>
              <p>
                Vendors must complete Know Your Customer (KYC) verification by submitting valid business registration documents, 
                tax identification numbers, and proof of identity. BidSync reserves the right to reject or suspend accounts that 
                fail to meet verification requirements.
              </p>

              <h3>3.4 Account Termination</h3>
              <p>
                BidSync may terminate or suspend your account at any time for violation of these Terms, fraudulent activity, or 
                for any other reason at our sole discretion. You may also terminate your account at any time by contacting our 
                support team.
              </p>
            </section>

            <section className="legal-section">
              <h2>4. Bidding Rules and Conduct</h2>
              <h3>4.1 Sealed Bidding</h3>
              <p>
                All bids submitted through the Platform are encrypted and sealed until the RFQ deadline expires. No party, including 
                Buyers, Vendors, or BidSync administrators, can view bid prices before the deadline. Any attempt to circumvent the 
                sealed bidding system is strictly prohibited and may result in immediate account termination and legal action.
              </p>

              <h3>4.2 Bid Accuracy</h3>
              <p>
                Vendors are responsible for ensuring the accuracy of their bids. Once the deadline expires, bids are binding. 
                Vendors who submit winning bids are obligated to fulfill the terms of their proposals.
              </p>

              <h3>4.3 Buyer Responsibilities</h3>
              <p>
                Buyers must provide clear, accurate, and complete RFQ specifications. Buyers agree to evaluate bids fairly based 
                on the criteria stated in the RFQ. BidSync is not responsible for disputes arising from unclear or inaccurate RFQ 
                specifications.
              </p>

              <h3>4.4 Prohibited Conduct</h3>
              <p>Users must not:</p>
              <ul>
                <li>Engage in bid rigging, collusion, or any form of anti-competitive behavior</li>
                <li>Submit false or misleading information in bids or RFQs</li>
                <li>Attempt to contact other users outside the Platform to manipulate bids</li>
                <li>Use automated bots or scripts to submit bids or scrape data</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>5. Fees and Payments</h2>
              <h3>5.1 Service Fees</h3>
              <p>
                BidSync may charge service fees for certain features, including posting RFQs or winning bids. All fees will be 
                clearly disclosed before you incur them. Fees are non-refundable except as required by law.
              </p>

              <h3>5.2 Payment Between Users</h3>
              <p>
                BidSync does not process payments between Buyers and Vendors. Payment terms, methods, and schedules are negotiated 
                directly between the parties. BidSync is not responsible for payment disputes.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Intellectual Property</h2>
              <h3>6.1 Platform Content</h3>
              <p>
                All content on the Platform, including text, graphics, logos, software, and design elements, is the property of 
                BidSync or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3>6.2 User Content</h3>
              <p>
                Users retain ownership of content they submit to the Platform (including RFQs, bids, and supporting documents). 
                By submitting content, you grant BidSync a worldwide, non-exclusive, royalty-free license to use, display, and 
                distribute such content for the purpose of operating and improving the Platform.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Disclaimers and Limitation of Liability</h2>
              <h3>7.1 Platform "As Is"</h3>
              <p>
                The Platform is provided on an "as is" and "as available" basis. BidSync makes no warranties, express or implied, 
                regarding the Platform's operation, availability, or reliability. We do not guarantee that the Platform will be 
                error-free, uninterrupted, or secure.
              </p>

              <h3>7.2 No Responsibility for User Conduct</h3>
              <p>
                BidSync is not responsible for the conduct of users or the accuracy of information provided by users. We do not 
                guarantee that Vendors will fulfill their bid commitments or that Buyers will award contracts fairly.
              </p>

              <h3>7.3 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, BidSync shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Platform. Our total liability for any claims 
                arising from these Terms shall not exceed the amount you paid to BidSync in the 12 months preceding the claim.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless BidSync, its officers, directors, employees, and agents from 
                any claims, liabilities, damages, losses, or expenses (including legal fees) arising from your use of the Platform, 
                your violation of these Terms, or your violation of any rights of third parties.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Dispute Resolution</h2>
              <h3>9.1 Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Sri Lanka, without regard to its 
                conflict of law provisions.
              </p>

              <h3>9.2 Arbitration</h3>
              <p>
                Any dispute arising from these Terms or your use of the Platform shall be resolved through binding arbitration 
                in accordance with the Arbitration Act of Sri Lanka. The arbitration shall take place in Colombo, Sri Lanka.
              </p>

              <h3>9.3 Class Action Waiver</h3>
              <p>
                You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a 
                class, consolidated, or representative action.
              </p>
            </section>

            <section className="legal-section">
              <h2>10. General Provisions</h2>
              <h3>10.1 Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or 
                eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>

              <h3>10.2 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and BidSync regarding 
                the use of the Platform and supersede all prior agreements.
              </p>

              <h3>10.3 Waiver</h3>
              <p>
                The failure of BidSync to enforce any right or provision of these Terms shall not constitute a waiver of such 
                right or provision.
              </p>
            </section>

            <section className="legal-section">
              <h2>11. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="contact-list">
                <li><strong>Email:</strong> legal@bidsync.online</li>
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

export default TermsOfService;
