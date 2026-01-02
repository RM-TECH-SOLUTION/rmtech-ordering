import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/auth/auth.reducer";
import { useNavigate } from "react-router-dom";
import "../styles/pages/Login.scss";

function Login() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Auto-focus input on mount
  useEffect(() => {
    const phoneInput = document.getElementById("phone-input");
    if (phoneInput) phoneInput.focus();
  }, []);

  // Validate phone number
  const validatePhone = (number) => {
    const cleaned = number.replace(/\D/g, "");
    return cleaned.length >= 10;
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/\D/g, "");

    if (!cleanedPhone) {
      setError("Please enter a mobile number");
      return;
    }

    if (!validatePhone(cleanedPhone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call with timeout
    setTimeout(() => {
      dispatch(
        login({
          id: Date.now(),
          phone: cleanedPhone,
        })
      );

      setIsLoading(false);
      navigate("/categories");
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon">
            <span>📱</span>
          </div>
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in with your mobile number</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone-input">Mobile Number</label>
            <div className="input-wrapper">
              <span className="input-icon">📞</span>
              <input
                id="phone-input"
                type="tel"
                placeholder="(123) 456-7890"
                value={phone}
                onChange={handlePhoneChange}
                onKeyPress={handleKeyPress}
                maxLength="14"
                className={error ? "has-error" : ""}
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !phone.replace(/\D/g, "")}
          >
            <div className="button-content">
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>🔑</span>
                  <span>Sign In</span>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            By signing in, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
          <div className="demo-note">
            💡 Demo: Enter any 10-digit number to login
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;