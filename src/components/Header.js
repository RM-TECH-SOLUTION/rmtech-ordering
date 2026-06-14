import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/auth.reducer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import "../styles/components/Header.scss";

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

function Header() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();

  const user         = useSelector((state) => state.auth.user);
  const themeColors  = useSelector((state) => state.homeReducer?.themeColors || {});
  const merchantInfo = useSelector((state) => state.homeReducer?.merchantInfo || {});
  const cartItems    = useSelector((state) => state.cart.cartItems || []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const topBarBackgroundColor = themeColors?.webTopbarBackgroundColor || "";
  const merchantName          = merchantInfo?.merchantName || "FoodExpress";
  const merchantLogo          = merchantInfo?.logo || "";
  const topBarTextColor       = getReadableTextColor(topBarBackgroundColor);
  const topBarMutedTextColor  = topBarTextColor === "#ffffff" ? "rgba(255,255,255,0.78)" : "rgba(17,24,39,0.72)";
  const topBarSoftLayerColor  = topBarTextColor === "#ffffff" ? "rgba(255,255,255,0.11)" : "rgba(17,24,39,0.08)";
  const topBarStrongLayerColor = topBarTextColor === "#ffffff" ? "rgba(255,255,255,0.20)" : "rgba(17,24,39,0.16)";
  const accentColor           = themeColors?.accentColor || "#d4af37";
  const displayUser           = user?.name || user?.phone || user?.email?.split("@")[0] || "User";
  const cartCount             = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setIsMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: "/",           label: "Home" },
    { path: "/categories", label: "Categories" },
    { path: "/contact",    label: "Contact Us" },
  ];

  return (
    <header
      className={`header${isMenuOpen ? " header--open" : ""}`}
      style={{
        "--header-bg":     topBarBackgroundColor || undefined,
        "--header-text":   topBarTextColor,
        "--header-muted":  topBarMutedTextColor,
        "--header-soft":   topBarSoftLayerColor,
        "--header-strong": topBarStrongLayerColor,
        "--header-accent": accentColor,
      }}
    >
      <div className="header__inner">

        {/* ── Logo ── */}
        <Link to="/" className="header__logo" onClick={() => setIsMenuOpen(false)}>
          {merchantLogo
            ? <img src={merchantLogo} alt={merchantName} className="header__logo-img" />
            : <span className="header__logo-emoji">🛍️</span>
          }
          <span className="header__logo-name">{merchantName}</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="header__nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`header__nav-link${location.pathname === link.path ? " header__nav-link--active" : ""}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="header__actions">

          {/* Cart */}
          <Link to="/cart" className="header__cart" aria-label="Cart">
            <FaShoppingCart className="header__cart-icon" />
            {cartCount > 0 && (
              <span className="header__cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </Link>

          {/* User chip */}
          {user ? (
            <>
              <div className="header__user-chip">
                <span className="header__user-avatar">
                  {(displayUser[0] || "U").toUpperCase()}
                </span>
                <span className="header__user-label">{displayUser}</span>
              </div>
              <button className="header__logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="header__login-btn">Login</Link>
          )}

          {/* Burger */}
          <button
            className="header__burger"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* ── Overlay ── */}
      {isMenuOpen && (
        <div className="header__overlay" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`header__drawer${isMenuOpen ? " header__drawer--open" : ""}`} aria-label="Mobile navigation">
        <div className="header__drawer-top">
          <Link to="/" className="header__drawer-brand" onClick={() => setIsMenuOpen(false)}>
            {merchantLogo
              ? <img src={merchantLogo} alt={merchantName} className="header__drawer-brand-img" />
              : <span className="header__logo-emoji">🛍️</span>
            }
            <span>{merchantName}</span>
          </Link>
          <button className="header__drawer-close" onClick={() => setIsMenuOpen(false)} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {user && (
          <div className="header__drawer-user">
            <span className="header__drawer-user-avatar">
              {(displayUser[0] || "U").toUpperCase()}
            </span>
            <span className="header__drawer-user-name">{displayUser}</span>
          </div>
        )}

        <nav className="header__drawer-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`header__drawer-link${location.pathname === link.path ? " header__drawer-link--active" : ""}`}
              onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/cart"
            className="header__drawer-link header__drawer-link--cart"
            onClick={() => setIsMenuOpen(false)}
          >
            Cart
            {cartCount > 0 && <span className="header__drawer-cart-badge">{cartCount}</span>}
          </Link>
        </nav>

        <div className="header__drawer-footer">
          {user ? (
            <button className="header__drawer-logout" onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login" className="header__drawer-login" onClick={() => setIsMenuOpen(false)}>
              Login / Sign Up
            </Link>
          )}
        </div>
      </aside>
    </header>
  );
}

export default Header;