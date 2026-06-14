import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearError, login } from "../redux/auth/auth.reducer";
import { useNavigate } from "react-router-dom";
import "../styles/pages/Login.scss";

const getReadableTextColor = (background, dark = "#111827", light = "#ffffff") => {
  if (!background) {
    return dark;
  }

  const value = String(background).trim();
  const hex = value.startsWith("#") ? value.slice(1) : value;

  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) {
    return dark;
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

function Login() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error: apiError } = useSelector((state) => state.auth);
  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});

  const cardsBackgroundColor = themeColors?.cardsBackgroundColor || "#ffffff";
  const primaryButtonBackgroundColor = themeColors?.primaryButtonBackgroundColor || "#ff7a18";
  const cardsTextColor = getReadableTextColor(cardsBackgroundColor, "#111827", "#ffffff");
  const buttonTextColor = getReadableTextColor(primaryButtonBackgroundColor, "#111827", "#ffffff");
  const isCardDark = cardsTextColor === "#ffffff";
  const mutedTextColor = isCardDark ? "rgba(255, 255, 255, 0.8)" : "rgba(17, 24, 39, 0.72)";
  const fieldBackgroundColor = isCardDark ? "rgba(255, 255, 255, 0.08)" : "#f8fafc";
  const fieldBorderColor = isCardDark ? "rgba(255, 255, 255, 0.28)" : "#e2e8f0";

  // Auto-focus input on mount
  useEffect(() => {
    const identityInput = document.getElementById("identity-input");
    if (identityInput) identityInput.focus();
  }, []);

  const handleIdentityChange = (e) => {
    setIdentity(e.target.value);
    setError("");
    if (apiError) {
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
    if (apiError) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identity.trim() || !password.trim()) {
      setError("Please enter email/phone and password");
      return;
    }

    const result = await dispatch(
      login({
        identity: identity.trim(),
        password,
      })
    );

    if (result?.success) {
      navigate("/categories");
    } else {
      setError(result?.message || "Login failed");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ backgroundColor: cardsBackgroundColor, color: cardsTextColor }}>
        {/* Header */}
        <div className="login-header">
          <h1 style={{ color: cardsTextColor }}>Welcome Back</h1>
          <p className="login-subtitle" style={{ color: mutedTextColor }}>Login with email/phone and password</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identity-input" style={{ color: cardsTextColor }}>Email or Phone</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ color: mutedTextColor }}>👤</span>
              <input
                id="identity-input"
                type="text"
                placeholder="Enter email or phone"
                value={identity}
                onChange={handleIdentityChange}
                onKeyPress={handleKeyPress}
                className={error || apiError ? "has-error" : ""}
                style={{
                  color: cardsTextColor,
                  backgroundColor: fieldBackgroundColor,
                  borderColor: error || apiError ? "#e53e3e" : fieldBorderColor,
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-input" style={{ color: cardsTextColor }}>Password</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ color: mutedTextColor }}>🔒</span>
              <input
                id="password-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                className={error || apiError ? "has-error" : ""}
                style={{
                  color: cardsTextColor,
                  backgroundColor: fieldBackgroundColor,
                  borderColor: error || apiError ? "#e53e3e" : fieldBorderColor,
                }}
                disabled={isLoading}
              />
            </div>
            {(error || apiError) && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error || apiError}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            style={{
              backgroundColor: primaryButtonBackgroundColor,
              color: buttonTextColor,
            }}
            disabled={isLoading || !identity.trim() || !password.trim()}
          >
            <div className="button-content">
              {isLoading ? (
                <>
                  <div className="spinner" style={{ borderColor: `${buttonTextColor}44`, borderTopColor: buttonTextColor }}></div>
                  <span style={{ color: buttonTextColor }}>Signing In...</span>
                </>
              ) : (
                <>
                  <span style={{ color: buttonTextColor }}>🔑</span>
                  <span style={{ color: buttonTextColor }}>Sign In</span>
                </>
              )}
            </div>
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don&apos;t have an account? <button type="button" className="link-btn" onClick={() => navigate("/register")}>Register</button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;