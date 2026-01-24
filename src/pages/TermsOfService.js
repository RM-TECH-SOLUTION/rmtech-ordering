import React from 'react';
import '../styles/Legal.scss';

function TermsConditions() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms & Conditions</h1>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By using FoodExpress, you agree to these terms.</p>
        </section>

        <section>
          <h2>2. Orders & Payments</h2>
          <p>Orders are confirmed only after successful payment via Razorpay.</p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>You agree to provide accurate account and delivery information.</p>
        </section>

        <section>
          <h2>4. Limitation of Liability</h2>
          <p>FoodExpress is not liable for indirect or consequential damages.</p>
        </section>

        <section>
          <h2>5. Governing Law</h2>
          <p>These terms are governed under Indian law.</p>
        </section>
      </div>
    </div>
  );
}

export default TermsConditions;
