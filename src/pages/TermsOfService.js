import React from 'react';
import '../styles/Legal.scss';

function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: January 24, 2024</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using our food delivery services, you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our services.</p>
        </section>

        <section>
          <h2>2. Account Registration</h2>
          <p>You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </section>

        <section>
          <h2>3. Ordering and Payment</h2>
          <p>
            <strong>3.1.</strong> All orders are subject to availability and acceptance.<br />
            <strong>3.2.</strong> Prices are subject to change without notice.<br />
            <strong>3.3.</strong> We use Razorpay for secure payment processing.<br />
            <strong>3.4.</strong> Payment must be completed before order processing.
          </p>
        </section>

        <section>
          <h2>4. Delivery</h2>
          <p>Delivery times are estimates. We are not liable for delays due to traffic, weather, or other unforeseen circumstances.</p>
        </section>

        <section>
          <h2>5. Cancellations</h2>
          <p>Cancellations are accepted only before the order has been prepared. Once preparation begins, cancellations may not be possible.</p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>Our liability is limited to the value of the order. We are not liable for any indirect, special, or consequential damages.</p>
        </section>

        <section>
          <h2>7. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in [Your City].</p>
        </section>

        <section>
          <h2>8. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.</p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;