import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaApple, FaGooglePlay, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/components/Footer.scss';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer__container">
        
        {/* Top Section */}
        <div className="footer__top">
          <div className="footer__brand">
            <div className="brand-logo">
              <span className="logo-icon">🍔</span>
              <span className="logo-text">FoodExpress</span>
            </div>
            <p className="brand-tagline">
              Delivering happiness to your doorstep, one meal at a time.
            </p>
            <div className="app-download">
              <button className="app-btn app-btn--apple">
                <FaApple className="icon" />
                <div className="app-btn__text">
                  <span className="app-btn__subtitle">Download on the</span>
                  <span className="app-btn__title">App Store</span>
                </div>
              </button>
              <button className="app-btn app-btn--google">
                <FaGooglePlay className="icon" />
                <div className="app-btn__text">
                  <span className="app-btn__subtitle">Get it on</span>
                  <span className="app-btn__title">Google Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__links">
            <div className="links-column">
              <h3 className="links-title">Quick Links</h3>
              <ul className="links-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/categories">Categories</Link></li>
                <li><Link to="/menu">Menu</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="links-column">
              <h3 className="links-title">Legal</h3>
              <ul className="links-list">
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/refund-policy">Refund Policy</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
                <li><Link to="/safety">Safety Standards</Link></li>
              </ul>
            </div>
            
            <div className="links-column">
              <h3 className="links-title">Support</h3>
              <ul className="links-list">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/community">Community</Link></li>
                <li><Link to="/partner">Partner with Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer__contact">
            <h3 className="contact-title">Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <div className="contact-text">
                  <span className="contact-label">Call Us</span>
                  <span className="contact-value">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div className="contact-text">
                  <span className="contact-label">Email Us</span>
                  <span className="contact-value">support@foodexpress.com</span>
                </div>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div className="contact-text">
                  <span className="contact-label">Visit Us</span>
                  <span className="contact-value">123 Food Street, New York</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__divider"></div>

        {/* Bottom Section */}
        <div className="footer__bottom">
          <div className="footer__copyright">
            <p>© {currentYear} FoodExpress. All rights reserved. Crafted with ❤️ by RM Tech Solutions</p>
          </div>
          
          <div className="footer__social">
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaLinkedin />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaYoutube />
              </a>
            </div>
            
            <div className="payment-methods">
              <span className="payment-icon">💳</span>
              <span className="payment-icon">💰</span>
              <span className="payment-icon">💲</span>
              <span className="payment-icon">🏦</span>
              <span className="payment-icon">📱</span>
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <button 
          className="footer__back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑ Back to Top
        </button>
      </div>
    </footer>
  );
}