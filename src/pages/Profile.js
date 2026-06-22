import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { logout } from "../redux/auth/auth.reducer";
import apiClient from "../api/apiClient";
import "../styles/pages/Profile.scss";
import {
  FaHistory,
  FaShareAlt,
  FaSignOutAlt,
  FaUser,
  FaStore,
  FaFileContract,
  FaShieldAlt,
} from "react-icons/fa";

const normalizeConfig = (payload) => {
  const fromFieldMap = (source) =>
    Object.values(source || {}).reduce((acc, field) => {
      if (field?.fieldKey) {
        acc[field.fieldKey] = field?.fieldValue;
      }
      return acc;
    }, {});

  if (Array.isArray(payload)) {
    const first = payload[0];
    if (first?.cms && typeof first.cms === "object") {
      return fromFieldMap(first.cms);
    }
    if (first?.fieldKey) {
      return payload.reduce((acc, field) => {
        if (field?.fieldKey) {
          acc[field.fieldKey] = field?.fieldValue;
        }
        return acc;
      }, {});
    }
  }

  if (payload?.cms && typeof payload.cms === "object") {
    return fromFieldMap(payload.cms);
  }

  return payload && typeof payload === "object" ? payload : {};
};

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

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useSelector((state) => state.auth.user);
  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});
  const merchantInfo = useSelector((state) => state.homeReducer?.merchantInfo || {});

  const [profileData, setProfileData] = useState({});
  const [uiConfig, setUiConfig] = useState({});
  const [orders, setOrders] = useState([]);
  const [activeMenu, setActiveMenu] = useState("account");

  const validMenuTabs = new Set(["account", "orders", "merchant", "terms", "policies"]);

  useEffect(() => {
    const tab = String(searchParams.get("tab") || "").toLowerCase();
    const normalizedTab = tab === "policy" ? "policies" : tab;
    setActiveMenu(validMenuTabs.has(normalizedTab) ? normalizedTab : "account");
  }, [searchParams]);

  useEffect(() => {
    const loadAccountContext = async () => {
      try {
        const [profileResponse, accountConfigResponse, ordersResponse] = await Promise.all([
          apiClient.post(apiClient.Urls.getProfile),
          apiClient.get(
            apiClient.Urls.getContentModel,
            apiClient.withContext({ modelSlug: "accountPageConfiguration" })
          ),
          apiClient.get("/order_history.php", apiClient.withContext({})),
        ]);

        setProfileData(profileResponse?.user || profileResponse?.data || {});
        setUiConfig(normalizeConfig(accountConfigResponse?.data ?? accountConfigResponse));
        setOrders(Array.isArray(ordersResponse?.data) ? ordersResponse.data : []);
      } catch {
        setProfileData({});
        setOrders([]);
      }
    };

    loadAccountContext();
  }, []);

  const webBg = themeColors?.webBackgroundColor || "#f8fafc";
  const topbarBg = themeColors?.webTopbarBackgroundColor || "#0b2d5b";
  const topbarTextColor = getReadableTextColor(topbarBg, "#111827", "#ffffff");
  const cardBg = themeColors?.cardsBackgroundColor || "#ffffff";
  const cardTextColor = getReadableTextColor(cardBg, "#111827", "#ffffff");
  const textColor = cardTextColor;
  const mutedColor = textColor === "#ffffff" ? "rgba(255,255,255,0.7)" : "#475569";
  const accentColor = uiConfig?.cardIconColor || themeColors?.primaryButtonBackgroundColor || "#f5872a";
  const borderColor = textColor === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(148, 163, 184, 0.28)";

  const referralCode = profileData?.referral_code || "N/A";
  const totalPoints = Number(profileData?.total_points || user?.total_points || 0);
  const profileName = user?.name || "User";
  const profileEmail = user?.email || "-";
  const profilePhone = user?.phone || "-";
  const loginId = user?.phone || user?.email || profileName;
  const termsAndConditions = merchantInfo?.termsAndConditions || "No terms available";
  const privacyPolicy = merchantInfo?.privacyPolicy || "No policy available";


  const handleCopyReferral = async () => {
    if (!profileData?.referral_code) {
      window.alert("Referral code not available");
      return;
    }

    const storeName = merchantInfo?.merchantName || "Our Store";
    const appLink = merchantInfo?.appLink || "";
    const webLink = merchantInfo?.webLink || "";

    const lines = [
      `Join ${storeName}!`,
      `Use my referral code: ${profileData.referral_code}`,
      appLink ? `App: ${appLink}` : "",
      webLink ? `Website: ${webLink}` : "",
    ].filter(Boolean);

    const message = lines.join("\n");

    try {
      await navigator.clipboard.writeText(message);
      window.alert("Referral copied to clipboard.");
    } catch {
      window.alert(message);
    }
  };

  const menuItems = [
    { key: "account", label: "My Account", icon: <FaUser /> },
    { key: "orders", label: "Order History", icon: <FaHistory /> },
    { key: "merchant", label: "Merchant Info", icon: <FaStore /> },
    { key: "terms", label: "Terms", icon: <FaFileContract /> },
    { key: "policies", label: "Policies", icon: <FaShieldAlt /> },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleMenuChange = (menuKey) => {
    setActiveMenu(menuKey);
    setSearchParams({ tab: menuKey }, { replace: true });
  };

  const normalSteps = ["pending", "accepted", "shipped", "delivered"];
  const rejectedSteps = ["pending", "rejected", "accepted", "shipped", "delivered"];

  const stepLabels = {
    pending: "Order",
    rejected: "Rejected",
    accepted: "Accepted",
    shipped: "Shipped",
    delivered: "Delivered",
  };

  const getProgressSteps = (status) => {
    const normalizedStatus = String(status || "pending").toLowerCase();
    const isRejected = normalizedStatus === "rejected";
    const steps = isRejected ? rejectedSteps : normalSteps;
    const currentStep = steps.indexOf(normalizedStatus);
    return {
      steps,
      currentStep: currentStep >= 0 ? currentStep : 0,
    };
  };

  const renderRightPanel = () => {
    if (activeMenu === "terms") {
      return (
        <div className="profile-main__panel">
          <h3 className="profile-main__panel-title">Terms and Conditions</h3>
          <div className="profile-legal-content">
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
              {termsAndConditions}
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === "policies") {
      return (
        <div className="profile-main__panel">
          <h3 className="profile-main__panel-title">Privacy Policy</h3>
          <div className="profile-legal-content">
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
              {privacyPolicy}
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === "orders") {
      return (
        <div className="profile-main__panel">
          <h3 className="profile-main__panel-title">Order History</h3>
          {orders.length === 0 ? (
            <p className="profile-main__muted">No orders found.</p>
          ) : (
            <div className="profile-orders">
              {orders.map((order, idx) => {
                const fallbackImage = "https://via.placeholder.com/80x80?text=Item";
                const itemImage =
                  order?.items?.[0]?.images?.[0] ||
                  order?.items?.[0]?.image ||
                  order?.items?.[0]?.item_image ||
                  order?.items?.[0]?.product_image ||
                  fallbackImage;
                const normalizedStatus = String(order?.order_status || "pending").toLowerCase();
                const { steps, currentStep } = getProgressSteps(normalizedStatus);
                return (
                  <article className="profile-orders__item" key={order?.order_id || idx}>
                    <img
                      src={itemImage}
                      alt="Order item"
                      className="profile-orders__item-image"
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage;
                      }}
                    />
                    <div className="profile-orders__item-info">
                      <strong>Order #{order?.order_id || "-"}</strong>
                      <p>{order?.items?.[0]?.item_name || order?.items?.[0]?.name || "Item"}</p>
                      {order?.items?.[0]?.variant_name && (
                        <span className="profile-orders__variant">{order.items[0].variant_name}</span>
                      )}
                      <div className="profile-orders__steps" aria-label="Order progress">
                        {steps.map((step, stepIndex) => {
                          const isActive = stepIndex <= currentStep;
                          const isRejectedStep = step === "rejected";
                          return (
                            <div className="profile-orders__step" key={`${order?.order_id || idx}-${step}`}>
                              <span
                                className={`profile-orders__step-dot${isActive ? " is-active" : ""}${isRejectedStep ? " is-rejected" : ""}`}
                              />
                              {stepIndex !== steps.length - 1 && (
                                <span
                                  className={`profile-orders__step-line${stepIndex < currentStep ? " is-active" : ""}${isRejectedStep && isActive ? " is-rejected" : ""}`}
                                />
                              )}
                              <span
                                className={`profile-orders__step-label${isActive ? " is-active" : ""}${isRejectedStep ? " is-rejected" : ""}`}
                              >
                                {stepLabels[step] || step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="profile-orders__item-meta">
                      <span className="status">{order?.order_status || "Pending"}</span>
                      <span className="amount">Rs {order?.amount || 0}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (activeMenu === "merchant") {
      return (
        <div className="profile-main__panel">
          <h3 className="profile-main__panel-title">Merchant Info</h3>
          <div className="merchant-panel">
            <div className="merchant-panel__row">
              <label>Merchant Name</label>
              <div>{merchantInfo?.merchantName || "-"}</div>
            </div>
            <div className="merchant-panel__row">
              <label>Phone</label>
              <div>{merchantInfo?.merchantPhoneNumber || "-"}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-main__panel">
        <h3 className="profile-main__panel-title">Personal Details</h3>
        <div className="profile-main__field">
          <label>Name</label>
          <div>{profileName}</div>
        </div>

        <div className="profile-main__field">
          <label>Mobile Number</label>
          <div>{profilePhone}</div>
        </div>

        <div className="profile-main__field">
          <label>Email</label>
          <div>{profileEmail}</div>
        </div>

        <div className="profile-main__stats-grid">
          <div className="profile-main__stat-card">
            <label>Total Points</label>
            <strong>{totalPoints}</strong>
          </div>
          <div className="profile-main__stat-card profile-main__stat-card--referral">
            <label>Referral Code</label>
            <div className="profile-main__referral-row">
              <span>{referralCode}</span>
              <button type="button" onClick={handleCopyReferral}>
                <FaShareAlt /> Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div
        className="profile-page"
        style={{
          "--profile-web-bg": webBg,
          "--profile-topbar-bg": topbarBg,
          "--profile-topbar-text": topbarTextColor,
          "--profile-card-bg": cardBg,
          "--profile-text": textColor,
          "--profile-muted": mutedColor,
          "--profile-accent": accentColor,
          "--profile-border": borderColor,
        }}
      >
        <div className="profile-page__shell">
          <section className="profile-card profile-card--guest">
            <div className="profile-card__avatar">
              <FaUser />
            </div>
            <h2>Hey Guest</h2>
            <p>Login to personalize your account and rewards.</p>
            <button className="profile-btn" onClick={() => navigate("/login")}>Login</button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className="profile-page"
      style={{
        "--profile-web-bg": webBg,
        "--profile-topbar-bg": topbarBg,
        "--profile-topbar-text": topbarTextColor,
        "--profile-card-bg": cardBg,
        "--profile-text": textColor,
        "--profile-muted": mutedColor,
        "--profile-accent": accentColor,
        "--profile-border": borderColor,
      }}
    >
      <div className="profile-page__shell">
        <aside className="profile-sidebar">
          <div className="profile-sidebar__login-card">
            <small>Logged in as</small>
            <strong>{loginId}</strong>
          </div>

          <nav className="profile-sidebar__menu" aria-label="Account menu">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`profile-sidebar__menu-item${activeMenu === item.key ? " is-active" : ""}`}
                onClick={() => handleMenuChange(item.key)}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="profile-sidebar__footer">
            <button
              className="profile-sidebar__logout-btn"
              onClick={handleLogout}
              type="button"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        <section className="profile-main">
          <div className="profile-main__header-row">
            <h2>
              {activeMenu === "orders"
                ? "Order History"
                : activeMenu === "merchant"
                  ? "Merchant Info"
                  : activeMenu === "terms"
                    ? "Terms of Service"
                    : activeMenu === "policies"
                      ? "Privacy & Policies"
                      : "My Account"}
            </h2>
          </div>
          {renderRightPanel()}
        </section>
      </div>
    </div>
  );
}

export default Profile;