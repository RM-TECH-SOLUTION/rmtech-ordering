import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/auth.reducer";
import { homeBannerData } from "../redux/Home/home.reducer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/components/Header.scss";

function Header() {

    useEffect(() => {
     dispatch( homeBannerData());
    }, []);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Control body scroll when mobile menu is open
  useEffect(() => {
     dispatch( homeBannerData());
    if (isMenuOpen) {
      document.body.classList.add("mobile-menu-open");
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.classList.remove("mobile-menu-open");
      document.documentElement.style.overflow = "";
    }

    // Close mobile menu on route change
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.documentElement.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close menu on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/categories", label: "Categories", icon: "📁" },
    { path: "/orders", label: "Order History", icon: "📋" },
    { path: "/profile", label: "Profile", icon: "👤" },
    { path: "/privacy-policy", label: "Privacy", icon: "🔒" },
    { path: "/terms", label: "Terms", icon: "📄" },
    { path: "/refund-policy", label: "Refund", icon: "↩️" },
  ];

  return (
    <header className={`header ${isMenuOpen ? "mobile-menu-open" : ""}`}>
      <div className="header__container">
        {/* Logo */}
        <div className="header__logo">
          <Link to="/" className="logo-link" onClick={() => setIsMenuOpen(false)}>
            <span className="logo-icon">🍔</span>
            <span className="logo-text">FoodExpress</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header__nav">
          <ul className="nav__list">
            {navLinks.map((link) => (
              <li key={link.path} className="nav__item">
                <Link 
                  to={link.path} 
                  className={`nav__link ${location.pathname === link.path ? "active" : ""}`}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Actions */}
        <div className="header__actions">
          {user ? (
            <>
              <div className="user-info">
                <span className="user-icon">👤</span>
                <span className="user-name">
                  {user.name || user.email?.split('@')[0] || user.phone || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn--logout"
              >
                <span className="logout-icon">🚪</span>
                <span className="logout-text">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn--login">
              <span className="login-icon">🔑</span>
              <span className="login-text">Login</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="menu-toggle__line"></span>
            <span className="menu-toggle__line"></span>
            <span className="menu-toggle__line"></span>
          </button>
        </div>

        {/* Mobile Menu Overlay - Only shows on mobile */}
        <div 
          className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} 
          onClick={() => setIsMenuOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onKeyDown={(e) => e.key === 'Enter' && setIsMenuOpen(false)}
        ></div>

        {/* Mobile Menu - Only shows on mobile */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu__header">
            <div className="mobile-menu__user">
              {user ? (
                <>
                  <div className="mobile-user-icon">👤</div>
                  <div className="mobile-user-info">
                    <h3 className="mobile-user-name">
                      {user.name || user.email?.split('@')[0] || user.phone || "User"}
                    </h3>
                    <p className="mobile-user-email">{user.email || user.phone || "Welcome!"}</p>
                  </div>
                </>
              ) : (
                <div className="mobile-user-info">
                  <h3 className="mobile-user-name">Guest User</h3>
                  <p className="mobile-user-email">Login to access features</p>
                </div>
              )}
            </div>
            <button
              className="mobile-menu__close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="mobile-menu__nav">
            <ul className="mobile-nav__list">
              {navLinks.map((link) => (
                <li key={link.path} className="mobile-nav__item">
                  <Link 
                    to={link.path} 
                    className={`mobile-nav__link ${location.pathname === link.path ? "active" : ""}`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <span className="mobile-nav__icon">
                      {link.icon}
                    </span>
                    <span className="mobile-nav__text">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-menu__actions">
            {user ? (
              <button
                onClick={handleLogout}
                className="btn btn--mobile-logout"
              >
                <span className="mobile-logout-icon">🚪</span>
                <span className="mobile-logout-text">Logout</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="btn btn--mobile-login"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mobile-login-icon">🔑</span>
                <span className="mobile-login-text">Login / Sign Up</span>
              </Link>
            )}
          </div>

          <div className="mobile-menu__footer">
            <p className="app-version">Version 1.0.0</p>
            <p className="copyright">© 2024 FoodExpress. All rights reserved.</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;