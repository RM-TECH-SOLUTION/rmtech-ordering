import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearError, register } from "../redux/auth/auth.reducer";
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

function Register() {
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

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode: "",
    gender: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
    if (apiError) {
      dispatch(clearError());
    }
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) {
      return "All required fields must be filled";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return "Please enter a valid email";
    }

    if (!/^\d{7,15}$/.test(form.phone.trim())) {
      return "Enter valid phone (7-15 digits)";
    }

    if (form.password.length < 4) {
      return "Password must be at least 4 characters";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await dispatch(
      register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        referralCode: form.referralCode.trim() || null,
        gender: form.gender.trim() || null,
      })
    );

    if (result?.success) {
      navigate("/categories");
    } else {
      setError(result?.message || "Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ backgroundColor: cardsBackgroundColor, color: cardsTextColor }}>
        <div className="login-header">
          <h1 style={{ color: cardsTextColor }}>Create Account</h1>
          <p className="login-subtitle" style={{ color: mutedTextColor }}>Register your account in just a few simple steps</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name-input" style={{ color: cardsTextColor }}>Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ color: mutedTextColor }}>👤</span>
              <input
                id="name-input"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange("name")}
                style={{
                  color: cardsTextColor,
                  backgroundColor: fieldBackgroundColor,
                  borderColor: fieldBorderColor,
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email-input" style={{ color: cardsTextColor }}>Email</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ color: mutedTextColor }}>✉️</span>
              <input
                id="email-input"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange("email")}
                style={{
                  color: cardsTextColor,
                  backgroundColor: fieldBackgroundColor,
                  borderColor: fieldBorderColor,
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone-input" style={{ color: cardsTextColor }}>Phone</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ color: mutedTextColor }}>📞</span>
              <input
                id="phone-input"
                type="text"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange("phone")}
                style={{
                  color: cardsTextColor,
                  backgroundColor: fieldBackgroundColor,
                  borderColor: fieldBorderColor,
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
                value={form.password}
                onChange={handleChange("password")}
                style={{
                  color: cardsTextColor,
                  backgroundColor: fieldBackgroundColor,
                  borderColor: fieldBorderColor,
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="referral-input" style={{ color: cardsTextColor }}>Referral Code (optional)</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ color: mutedTextColor }}>🏷️</span>
              <input
                id="referral-input"
                type="text"
                placeholder="Enter referral code"
                value={form.referralCode}
                onChange={handleChange("referralCode")}
                style={{
                  color: cardsTextColor,
                  backgroundColor: fieldBackgroundColor,
                  borderColor: fieldBorderColor,
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender-input" style={{ color: cardsTextColor }}>Gender (optional)</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ color: mutedTextColor }}>⚧️</span>
              <input
                id="gender-input"
                type="text"
                placeholder="Male / Female / Other"
                value={form.gender}
                onChange={handleChange("gender")}
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
            disabled={isLoading}
          >
            <div className="button-content">
              {isLoading ? (
                <>
                  <div className="spinner" style={{ borderColor: `${buttonTextColor}44`, borderTopColor: buttonTextColor }}></div>
                  <span style={{ color: buttonTextColor }}>Creating Account...</span>
                </>
              ) : (
                <>
                  <span style={{ color: buttonTextColor }}>✅</span>
                  <span style={{ color: buttonTextColor }}>Register</span>
                </>
              )}
            </div>
          </button>
        </form>

        <div className="login-footer">
          <p style={{ color: cardsTextColor }}>
            Already have an account? <button type="button" className="link-btn" onClick={() => navigate("/login")}>Login</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
