import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaGift, FaShoppingBag, FaTruck } from "react-icons/fa";
import apiClient from "../api/apiClient";
import "../styles/pages/OrderHistory.scss";

const NORMAL_STEPS = ["pending", "accepted", "shipped", "delivered"];
const REJECTED_STEPS = ["pending", "rejected", "accepted", "shipped", "delivered"];

const STEP_LABELS = {
 pending: "Order",
 rejected: "Rejected",
 accepted: "Accepted",
 shipped: "Shipped",
 delivered: "Delivered",
};

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

const normalizeOrders = (response) => {
 const source = response?.data || response?.orders || response?.orderHistoryResponse || response;
 return Array.isArray(source) ? source : [];
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

const getStatusMeta = (status) => {
 const normalized = String(status || "pending").toLowerCase();

 if (normalized === "delivered") {
  return { label: "Delivered", tone: "success" };
 }

 if (normalized === "rejected" || normalized === "cancelled" || normalized === "canceled") {
  return { label: "Rejected", tone: "danger" };
 }

 if (normalized === "shipped") {
  return { label: "Shipped", tone: "info" };
 }

 if (normalized === "accepted") {
  return { label: "Accepted", tone: "neutral" };
 }

 return { label: "Pending", tone: "warning" };
};

function OrderHistory() {
 const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [uiConfig, setUiConfig] = useState({});

 useEffect(() => {
  const loadData = async () => {
   setLoading(true);
   try {
    const [ordersResponse, configResponse] = await Promise.all([
     apiClient.get("/order_history.php", apiClient.withContext({})),
     apiClient.get(
      apiClient.Urls.getContentModel,
      apiClient.withContext({ modelSlug: "orderHistoryConfig" })
     ),
    ]);

    setOrders(normalizeOrders(ordersResponse));
    setUiConfig(normalizeConfig(configResponse?.data ?? configResponse));
   } catch (error) {
    setOrders([]);
   } finally {
    setLoading(false);
   }
  };

  loadData();
 }, []);

 const pageBg =
  themeColors?.webBackgroundColor ||
  "var(--app-page-bg, linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%))";
 const cardBg = themeColors?.cardsBackgroundColor || "var(--cart-card-bg, #ffffff)";
 const progressOff = uiConfig?.progressBarColor || "#d1d5db";
 const progressOn = uiConfig?.progressBarFillColor || "#16a34a";
 const titleColor = getReadableTextColor(cardBg, "#111827", "#ffffff");
 const subTitleColor = getReadableTextColor(cardBg, "#475569", "#e2e8f0");
 const sortedOrders = useMemo(() => {
  return [...orders].sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));
 }, [orders]);

 const deliveredCount = useMemo(() => {
  return sortedOrders.filter((order) => String(order?.order_status || "").toLowerCase() === "delivered").length;
 }, [sortedOrders]);

 const totalEarnedPoints = useMemo(() => {
  return sortedOrders.reduce((sum, order) => sum + Number(order?.earned_points || 0), 0);
 }, [sortedOrders]);

 const renderProgress = (status) => {
  const normalizedStatus = String(status || "pending").toLowerCase();
  const isRejected = normalizedStatus === "rejected";
  const steps = isRejected ? REJECTED_STEPS : NORMAL_STEPS;
  const currentStep = steps.indexOf(normalizedStatus);

  return (
   <div className="oh-progress">
    {steps.map((step, index) => {
     const active = index <= currentStep;
     const isRejectedStep = step === "rejected";
     const fillColor = active && isRejectedStep ? "#e53935" : active ? progressOn : progressOff;

     return (
      <div key={`${step}-${index}`} className="oh-progress__step">
       <span className="oh-progress__dot" style={{ backgroundColor: fillColor }} />
       {index !== steps.length - 1 && (
        <span
         className="oh-progress__line"
         style={{ backgroundColor: index < currentStep ? fillColor : progressOff }}
        />
       )}
       <span className="oh-progress__label" style={{ color: fillColor }}>
        {STEP_LABELS[step]}
       </span>
      </div>
     );
    })}
   </div>
  );
 };

 if (loading) {
  return (
   <div className="order-history" style={{ background: pageBg }}>
    <div className="order-history__shell">
     <p className="order-history__state" style={{ color: subTitleColor }}>Loading order history...</p>
    </div>
   </div>
  );
 }

 if (!sortedOrders.length) {
  return (
   <div className="order-history" style={{ background: pageBg }}>
    <div className="order-history__shell">
     <div className="order-history__empty" style={{ color: titleColor }}>
      <FaShoppingBag className="icon" />
      <p>No orders found</p>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div
  className="order-history"
  style={{
   background: pageBg,
   "--oh-card-bg": cardBg,
   "--oh-title": titleColor,
   "--oh-subtitle": subTitleColor,
   "--oh-progress-off": progressOff,
   "--oh-progress-on": progressOn,
  }}
  >
  <div className="order-history__shell">
   <div className="order-history__stats">
    <article className="order-history__stat-card">
    <span className="label">Total Orders</span>
    <strong>{sortedOrders.length}</strong>
    </article>
    <article className="order-history__stat-card order-history__stat-card--success">
    <span className="label">Delivered</span>
    <strong>
     <FaCheckCircle /> {deliveredCount}
    </strong>
    </article>
    <article className="order-history__stat-card order-history__stat-card--accent">
    <span className="label">Earned Points</span>
    <strong>
     <FaGift /> {totalEarnedPoints}
    </strong>
    </article>
   </div>

    <div className="order-history__list">
    {sortedOrders.map((order, index) => {
      const product = Array.isArray(order?.items) ? order.items[0] : null;
      const image = product?.images?.[0] || "https://via.placeholder.com/100";
      const name = product?.item_name || product?.name || "Product";
    const statusMeta = getStatusMeta(order?.order_status);
      const date = order?.created_at
       ? new Date(order.created_at).toLocaleDateString("en-IN", {
         day: "numeric",
         month: "short",
         year: "numeric",
       })
       : "-";

      return (
      <article key={order?.order_id || `${name}-${date}-${index}`} className="oh-card">
        <header className="oh-card__header">
         <div className="oh-card__meta">
          <p className="oh-card__order-id" style={{ color: titleColor }}>Order #{order?.order_id || "-"}</p>
          <p className="oh-card__date" style={{ color: subTitleColor }}>Placed on {date}</p>
         </div>
         <span className={`oh-card__status oh-card__status--${statusMeta.tone}`}>{statusMeta.label}</span>
        </header>

        <div className="oh-card__row">
         <div className="oh-card__media">
          <img src={image} alt={name} />
         </div>

         <div className="oh-card__info">
          <h3 style={{ color: titleColor }}>{name}</h3>
          {product?.variant_name && <p style={{ color: subTitleColor }}>{product.variant_name}</p>}

          <div className="oh-card__metrics">
           <p style={{ color: subTitleColor }}>
            <FaGift /> Points {order?.earned_points || 0}
           </p>
           <p style={{ color: subTitleColor }}>
            <FaTruck /> Discount {order?.discount || 0}
           </p>
           <p className="oh-card__amount" style={{ color: titleColor }}>₹{order?.amount || 0}</p>
          </div>
         </div>
        </div>

        {renderProgress(order?.order_status)}
       </article>
      );
     })}
    </div>
   </div>
  </div>
 );
}

export default OrderHistory;