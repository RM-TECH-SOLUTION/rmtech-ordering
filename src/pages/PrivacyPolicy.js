import React from 'react';
import '../styles/Legal.scss';

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 24, 2024</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact customer support. This may include:</p>
          <ul>
            <li>Name, email address, and phone number</li>
            <li>Delivery address</li>
            <li>Payment information (processed securely through Razorpay)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about orders, services, and promotions</li>
            <li>Improve our services and develop new features</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>We use Razorpay for payment processing. Their privacy policy can be found at <a href="https://razorpay.com/privacy-policy/" target="_blank" rel="noopener noreferrer">razorpay.com/privacy-policy</a>.</p>
        </section>

        <section>
          <h2>5. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <address>
            Email: contact@foodexpress@gmail.com<br />
            Phone: +91 8777370341 / 7013608102<br />
          </address>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;