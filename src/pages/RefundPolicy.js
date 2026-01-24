import React from 'react';
import '../styles/Legal.scss';

function RefundPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Refund & Cancellation Policy</h1>

        <section>
          <h2>1. Order Cancellation</h2>
          <p>Orders can be canceled before preparation begins.</p>
        </section>

        <section>
          <h2>2. Refunds</h2>
          <p>If eligible, refunds will be processed within 5–7 business days.</p>
        </section>

        <section>
          <h2>3. Failed Transactions</h2>
          <p>Failed payments are auto-reversed by Razorpay.</p>
        </section>

        <section>
          <h2>4. Contact</h2>
          <p>Email: contact@foodexpress@gmail.com</p>
        </section>
      </div>
    </div>
  );
}

export default RefundPolicy;
