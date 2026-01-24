import React from 'react';
import '../styles/Legal.scss';

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 24, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <ul>
            <li>Name, email address, and phone number</li>
            <li>Delivery address</li>
            <li>Order details and preferences</li>
            <li>Payment information (securely processed via Razorpay)</li>
            <li>Device and usage analytics</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Process orders and deliver services</li>
            <li>Customer support and communication</li>
            <li>Fraud prevention and security</li>
            <li>Legal compliance</li>
            <li>Improve platform experience</li>
          </ul>
        </section>

        <section>
          <h2>3. Payment Processing</h2>
          <p>Payments are securely handled by Razorpay. We do not store card or UPI details.</p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We use encryption, access controls, and secure servers to protect your data.</p>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>Razorpay Privacy Policy: 
            <a href="https://razorpay.com/privacy-policy/" target="_blank" rel="noopener noreferrer">
              razorpay.com/privacy-policy
            </a>
          </p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <address>
            Email: contact@foodexpress@gmail.com<br />
            Phone: +91 8777370341 / 7013608102
          </address>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
