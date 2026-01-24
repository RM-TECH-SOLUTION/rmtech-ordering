import React from 'react';
import '../styles/Legal.scss';

function RefundPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Refund & Cancellation Policy</h1>
        <p className="last-updated">Last Updated: January 24, 2024</p>
        
        <section>
          <h2>1. Order Cancellation</h2>
          <p>You may cancel your order within 5 minutes of placing it, provided the restaurant has not started preparation. To cancel:</p>
          <ul>
            <li>Go to "My Orders" in your account</li>
            <li>Select the order you wish to cancel</li>
            <li>Click "Cancel Order"</li>
            <li>Contact customer support if the option is unavailable</li>
          </ul>
        </section>

        <section>
          <h2>2. Refund Eligibility</h2>
          <p>Refunds are issued in the following cases:</p>
          <ul>
            <li><strong>Order Cancelled Successfully:</strong> Full refund within 5 minutes of order placement</li>
            <li><strong>Restaurant Cancellation:</strong> Full refund if restaurant cannot fulfill the order</li>
            <li><strong>Delivery Issues:</strong> Refund or credit for orders not delivered within 2 hours of estimated time</li>
            <li><strong>Wrong Items Delivered:</strong> Full or partial refund upon verification</li>
            <li><strong>Quality Issues:</strong> Partial refund for verified quality concerns</li>
          </ul>
        </section>

        <section>
          <h2>3. Non-Refundable Situations</h2>
          <p>Refunds will NOT be provided for:</p>
          <ul>
            <li>Orders cancelled after preparation has started</li>
            <li>Change of mind after delivery</li>
            <li>Minor delays in delivery (under 30 minutes)</li>
            <li>Partial consumption of order</li>
          </ul>
        </section>

        <section>
          <h2>4. Refund Process</h2>
          <p>
            <strong>4.1 Timeline:</strong> Refunds are processed within 5-10 business days<br />
            <strong>4.2 Method:</strong> Refunds are issued to the original payment method<br />
            <strong>4.3 Processing:</strong> All refunds are processed through Razorpay<br />
            <strong>4.4 Notifications:</strong> You will receive email notifications at each step
          </p>
        </section>

        <section>
          <h2>5. How to Request a Refund</h2>
          <p>To request a refund:</p>
          <ol>
            <li>Go to "My Orders" in your account</li>
            <li>Select the order requiring refund</li>
            <li>Click "Request Refund"</li>
            <li>Select reason and provide details</li>
            <li>Submit supporting photos if applicable</li>
          </ol>
        </section>

        <section>
          <h2>6. Contact for Refund Issues</h2>
          <p>For refund-related queries:</p>
          <address>
            Email: contact@foodexpress@gmail.com<br />
            Phone: +91 8777370341 / 7013608102<br />
            Hours: 9 AM - 9 PM, 7 days a week
          </address>
          <p>Include your order ID and payment transaction ID for faster resolution.</p>
        </section>
      </div>
    </div>
  );
}

export default RefundPolicy;