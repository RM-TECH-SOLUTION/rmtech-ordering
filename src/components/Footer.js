import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaPhone, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/components/Footer.scss';

const getReadableTextColor = (background, dark = "#111827", light = "#ffffff") => {
  if (!background) {
    return light;
  }

  const value = String(background).trim();
  const hex = value.startsWith("#") ? value.slice(1) : value;

  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) {
    return light;
  }

  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.56 ? light : dark;
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});
  const merchantInfo = useSelector((state) => state.homeReducer?.merchantInfo || {});
  const merchantName = merchantInfo?.merchantName || "FoodExpress";
  const merchantLogo = merchantInfo?.logo || "";
  const merchantPhoneNumber = merchantInfo?.merchantPhoneNumber;
  const merchantLocation = merchantInfo?.merchantLocation || "";
  const merchantWebLink = merchantInfo?.webLink || "";
  const footerBackgroundColor = themeColors?.webBottombarBackgroundColor || "";
  const footerTextColor = getReadableTextColor(footerBackgroundColor);
  const footerMutedTextColor = footerTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.76)" : "rgba(17, 24, 39, 0.72)";
  const footerSoftLayerColor = footerTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.12)";
  const footerAccentLineColor = footerTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.44)" : "rgba(15, 23, 42, 0.32)";
  
  return (
    <footer
      className="footer"
      style={{
        "--footer-bg": footerBackgroundColor || undefined,
        "--footer-text": footerTextColor,
        "--footer-muted": footerMutedTextColor,
        "--footer-layer-soft": footerSoftLayerColor,
        "--footer-accent-line": footerAccentLineColor,
      }}
    >
      <div className="footer__container">
        
        {/* Top Section */}
        <div className="footer__top">
          <div className="footer__brand">
            <div className="brand-logo">
              {merchantLogo ? (
                <img src={merchantLogo} alt={merchantName} className="logo-image" />
              ) : (
                <span className="logo-icon">🍔</span>
              )}
              <span className="logo-text">{merchantName}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__links">
            <div className="links-column">
              <h3 className="links-title">Quick Links</h3>
              <ul className="links-list">
            <li><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Link></li>
            <li><Link to="/categories" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Categories</Link></li>
              </ul>
            </div>
            
            <div className="links-column">
              <h3 className="links-title">Legal</h3>
              <ul className="links-list">
                <li><Link to="/profile?tab=policies" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Privacy Policy</Link></li>
                <li><Link to="/profile?tab=terms" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Terms and Conditions</Link></li>
                {/* <li><Link to="/refund-policy" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Cancellations and Refunds</Link></li>
                <li><Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Contact Us</Link></li> */}
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
                  <span className="contact-value">{merchantPhoneNumber ? `+91 ${merchantPhoneNumber}` : "Not available"}</span>
                </div>
              </div>
              
              {merchantLocation && (
                <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div className="contact-text">
                  <span className="contact-label">Location</span>
                  <a className="contact-value" href={merchantLocation} target="_blank" rel="noopener noreferrer">
                    Open in Maps
                  </a>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__divider"></div>

        {/* Bottom Section */}
        <div className="footer__bottom">
          <div className="footer__copyright">
            <p>© {currentYear} {merchantName}. All rights reserved. Crafted with ❤️ by RM Tech Solution</p>
          </div>
          
          {/* <div className="footer__social">
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
          </div> */}
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