import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import { addToCart, removeFromCart, clearCart, getCart, removeItemCompletely } from "../redux/cart/cart.reducer";
import { placeOrder } from "../redux/orders/orders.reducer";
import { useNavigate } from "react-router-dom";
import "../styles/pages/Cart.scss";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaMapMarkerAlt, FaCreditCard, FaLock, FaTruck, FaWallet, FaPen, FaCheckCircle, FaGift } from "react-icons/fa";
import apiClient from "../api/apiClient";

const EMPTY_ADDRESS = {
    building: "",
    doorNo: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
};

const mapAddressToForm = (address = {}) => ({
    building: address?.building || "",
    doorNo: address?.doorNo || "",
    street: address?.street || address?.addressLine || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    pincode: address?.pincode || "",
});

const getAddressLines = (address, user) => {
    if (!address) {
        return [];
    }

    if (address?.addressLine) {
        return [
            address.addressLine,
            [address.city, address.state, address.pincode].filter(Boolean).join(" - "),
            address.phone || user?.phone || "",
        ].filter(Boolean);
    }

    return [
        [address.building, address.doorNo].filter(Boolean).join(", "),
        [address.street, address.landmark].filter(Boolean).join(", "),
        [address.city, address.state, address.pincode].filter(Boolean).join(" - "),
    ].filter(Boolean);
};

const getReadableTextColor = (background, darkColor = "#111827", lightColor = "#ffffff") => {
    if (!background || background === "transparent") return darkColor;
    const hex = background.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? darkColor : lightColor;
};

const colorToRgba = (color, alpha = 0.1) => {
    if (!color) return `rgba(17, 24, 39, ${alpha})`;

    const normalized = color.trim();

    if (normalized.startsWith("#")) {
        const hex = normalized.slice(1);

        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }

    const rgbMatch = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
        const r = Number(rgbMatch[1]);
        const g = Number(rgbMatch[2]);
        const b = Number(rgbMatch[3]);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return `rgba(17, 24, 39, ${alpha})`;
};

const isEnabled = (value, fallback = false) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    const normalized = String(value).trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;

    return fallback;
};

const getConfigFlag = (config, keys, fallback) => {
    for (const key of keys) {
        if (config && Object.prototype.hasOwnProperty.call(config, key)) {
            return isEnabled(config[key], fallback);
        }
    }

    return fallback;
};

const isOutOfStockItem = (item = {}) => {
    if (Array.isArray(item?.variants) && item.variants.length > 0) {
        return item.variants.every((variant) => Number(variant?.stock ?? 0) <= 0);
    }

    const stockValue = item?.stock ?? item?.available_stock ?? item?.inventory;
    if (stockValue === undefined || stockValue === null || stockValue === "") {
        return false;
    }

    return Number(stockValue) <= 0;
};

const getItemCategoryId = (item = {}) => {
    return (
        item?.catalogue_model_id ??
        item?.catalogueModelId ??
        item?.model_id ??
        item?.category_id ??
        item?.catalogue_id ??
        null
    );
};

function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);

    // Checkout state variables
    const [profile, setProfile] = useState(null);
    const [loyaltySettings, setLoyaltySettings] = useState(null);
    const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
    const [loadingCheckoutData, setLoadingCheckoutData] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [pointsInput, setPointsInput] = useState("");
    const [appliedPoints, setAppliedPoints] = useState(null);
    const [pointsDiscount, setPointsDiscount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [merchantPaymentInfo, setMerchantPaymentInfo] = useState({});
    const [checkoutPageConfig, setCheckoutPageConfig] = useState({});

    const { addresses, selectedAddressId } = useSelector(
        (state) => state.address
    );

    const cartItems = useSelector((state) => state.cart.cartItems);
    const user = useSelector((state) => state.auth.user);
    const homeUiConfiguration = useSelector((state) => state.homeReducer?.homeUiConfiguration || {});
    const paymentConfigSource = Object.keys(checkoutPageConfig || {}).length
        ? checkoutPageConfig
        : homeUiConfiguration;


    // Extract theme colors from Redux
    const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});
    const cardsBackgroundColor = themeColors?.cardsBackgroundColor || "#ffffff";
    const primaryButtonBackgroundColor = themeColors?.primaryButtonBackgroundColor || "#0f172a";
    const cardTextColor = getReadableTextColor(cardsBackgroundColor, "#111827", "#ffffff");
    const primaryButtonTextColor = getReadableTextColor(primaryButtonBackgroundColor, "#111827", "#ffffff");
    const isDarkCardBackground = cardTextColor === "#ffffff";
    const mutedTextColor = cardTextColor === "#ffffff" ? "rgba(255,255,255,0.74)" : "#64748b";
    const emptyAddressTextColor = getReadableTextColor(cardsBackgroundColor, "#111827", "#ffffff");
    const emptyAddressSubTextColor = getReadableTextColor(cardsBackgroundColor, "#374151", "#e5e7eb");

    const merchantInfo = useSelector((state) => state.homeReducer?.merchantInfo || {});

    const normalizeConfigPayload = (payload) => {
        if (Array.isArray(payload)) {
            const first = payload[0];
            if (first?.cms && typeof first.cms === "object") {
                return Object.values(first.cms).reduce((acc, field) => {
                    if (field?.fieldKey) {
                        acc[field.fieldKey] = field?.fieldValue;
                    }
                    return acc;
                }, {});
            }
            return payload.reduce((acc, field) => {
                if (field?.fieldKey) {
                    acc[field.fieldKey] = field?.fieldValue;
                }
                return acc;
            }, {});
        }

        if (payload?.cms && typeof payload.cms === "object") {
            return Object.values(payload.cms).reduce((acc, field) => {
                if (field?.fieldKey) {
                    acc[field.fieldKey] = field?.fieldValue;
                }
                return acc;
            }, {});
        }

        return payload && typeof payload === "object" ? payload : {};
    };

    const normalizedAddresses = Array.isArray(addresses) ? addresses : [];
    const selectedAddress = useMemo(() => {
        if (normalizedAddresses.length === 0) {
            return null;
        }

        return (
            normalizedAddresses.find(
                (address) => String(address?.id ?? address?.address_id ?? "") === String(selectedAddressId ?? "")
            ) || normalizedAddresses[0]
        );
    }, [normalizedAddresses, selectedAddressId]);

    const subtotal = useMemo(
        () =>
            cartItems.reduce((sum, item) => {
                const qty = Number(item?.quantity ?? item?.qty ?? 1);
                const price = Number(item?.price ?? 0);
                return sum + price * qty;
            }, 0),
        [cartItems]
    );

    const deliveryFeeBase = Number(
        paymentConfigSource?.deliveryFee ??
        paymentConfigSource?.delivery_fee ??
        paymentConfigSource?.deliveryCharge ??
        paymentConfigSource?.delivery_charge ??
        0
    );
    const freeDeliveryMin = Number(
        paymentConfigSource?.freeDeliveryMin ??
        paymentConfigSource?.free_delivery_min ??
        paymentConfigSource?.freeDeliveryThreshold ??
        paymentConfigSource?.free_delivery_threshold ??
        0
    );
    const deliveryFee = freeDeliveryMin > 0 && subtotal >= freeDeliveryMin ? 0 : deliveryFeeBase;
    const taxRate = Number(
        paymentConfigSource?.taxRate ??
        paymentConfigSource?.tax_rate ??
        paymentConfigSource?.taxPercentage ??
        paymentConfigSource?.tax_percentage ??
        5
    );
    const tax = (subtotal * taxRate) / 100;
    const grandTotal = Math.max(subtotal + deliveryFee + tax - Number(discount || 0) - Number(pointsDiscount || 0), 0);

    const canUseCOD = getConfigFlag(
        paymentConfigSource,
        ["enableCod", "enableCOD", "codEnabled", "codPaymentEnabled", "codPayment"],
        true
    );
    const canUseOnline = getConfigFlag(
        paymentConfigSource,
        ["enableOnline", "enableONLINE", "onlineEnabled", "onlinePaymentEnabled", "onlinePayment"],
        true
    );

    const availablePoints = Number(profile?.total_points ?? user?.total_points ?? 0);
    const canRedeemPoints = getConfigFlag(
        loyaltySettings || paymentConfigSource,
        ["enableRedeem", "enableRedeemPoints", "redeemEnabled", "allowPointsRedeem", "pointsRedeemEnabled"],
        true
    );
    const configuredMaxRedeemablePoints = Number(
        loyaltySettings?.maxRedeemablePoints ??
        loyaltySettings?.max_redeemable_points ??
        paymentConfigSource?.maxRedeemablePoints ??
        paymentConfigSource?.max_redeemable_points ??
        availablePoints
    );
    const maxRedeemablePoints = Math.max(0, Math.min(availablePoints, configuredMaxRedeemablePoints || availablePoints));
    const pointValue = Number(
        loyaltySettings?.pointValue ??
        loyaltySettings?.point_value ??
        loyaltySettings?.points_value ??
        1
    ) || 1;

    const clearAllTextColor = cardTextColor;
    const clearAllBg = colorToRgba(primaryButtonBackgroundColor, isDarkCardBackground ? 0.28 : 0.08);
    const clearAllBorder = colorToRgba(primaryButtonBackgroundColor, 0.22);
    const clearAllHoverBg = colorToRgba(primaryButtonBackgroundColor, isDarkCardBackground ? 0.4 : 0.14);
    const cartItemBg = cardsBackgroundColor;
    const cartItemBorder = colorToRgba(cardsBackgroundColor, isDarkCardBackground ? 0.38 : 0.18);
    const qtyControlBg = colorToRgba(primaryButtonBackgroundColor, isDarkCardBackground ? 0.22 : 0.08);
    const qtyButtonBg = primaryButtonBackgroundColor;
    const qtyValueColor = cardTextColor;
    const qtyMinusColor = primaryButtonTextColor;
    const qtyPlusColor = primaryButtonTextColor;
    const emptyAddressBg = colorToRgba(primaryButtonBackgroundColor, isDarkCardBackground ? 0.16 : 0.06);
    const emptyAddressBorder = colorToRgba(primaryButtonBackgroundColor, 0.22);

    const openPdpForItem = (item) => {
        const categoryId = getItemCategoryId(item);
        const itemId = item?.item_id ?? item?.id;

        if (categoryId && itemId) {
            navigate(`/menu/${categoryId}/item/${itemId}`, { state: { item, fromPath: "/cart" } });
            return;
        }

        if (categoryId) {
            navigate(`/menu/${categoryId}`);
            return;
        }

        navigate("/categories");
    };

    const loadCheckoutContext = async () => {
        setLoadingCheckoutData(true);
        try {
            const [profileResponse, loyaltyResponse, checkoutConfigResponse, merchantResponse] = await Promise.all([
                apiClient.post(apiClient.Urls.getProfile),
                apiClient.get(apiClient.Urls.getLoyaltySettings),
                apiClient.get(
                    apiClient.Urls.getContentModel,
                    apiClient.withContext({ modelSlug: "checkoutPageConfiguration" })
                ),
                apiClient.get(apiClient.Urls.getMerchant, apiClient.withContext({})),
            ]);

            setProfile(profileResponse?.user || profileResponse?.data || null);
            setLoyaltySettings(loyaltyResponse?.data || loyaltyResponse || null);
            setCheckoutPageConfig(normalizeConfigPayload(checkoutConfigResponse?.data ?? checkoutConfigResponse));
            setMerchantPaymentInfo(merchantResponse?.data || merchantResponse || {});
        } catch (error) {
            setErrorMessage(error?.message || "Unable to load checkout details.");
        } finally {
            setLoadingCheckoutData(false);
        }
    };

    useEffect(() => {
        loadCheckoutContext();
    }, []);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => setRazorpayLoaded(false);
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (paymentMethod === "COD" && !canUseCOD && canUseOnline) {
            setPaymentMethod("ONLINE");
            return;
        }

        if (paymentMethod === "ONLINE" && !canUseOnline && canUseCOD) {
            setPaymentMethod("COD");
        }
    }, [paymentMethod, canUseCOD, canUseOnline]);

    const removeCouponCode = () => {
        setCouponCode("");
        setDiscount(0);
        setAppliedCoupon(null);
        setErrorMessage("");
    };

    const applyCouponCode = async () => {
        const code = couponCode.trim();
        if (!code) {
            const msg = "Enter a coupon code.";
            setErrorMessage(msg);
            alert(msg);
            return;
        }

        setCouponLoading(true);
        setErrorMessage("");
        try {
            const response = await apiClient.post(apiClient.Urls.applyCoupon, {
                coupon: code,
                amount: subtotal,
            });

            if (response?.success === false) {
                const msg = response?.message || "Unable to apply coupon.";
                setErrorMessage(msg);
                alert(msg);
                return;
            }

            const nextDiscount = Number(response?.discount ?? response?.discount_amount ?? response?.amount ?? 0);
            setDiscount(nextDiscount);
            setAppliedCoupon(code);
            alert("Coupon applied successfully!");
        } catch (error) {
            const msg = error?.message || "Unable to apply coupon.";
            setErrorMessage(msg);
            alert(msg);
        } finally {
            setCouponLoading(false);
        }
    };

    const removePoints = () => {
        setPointsInput("");
        setAppliedPoints(null);
        setPointsDiscount(0);
        setErrorMessage("");
    };

    const applyPoints = () => {
        if (!canRedeemPoints) {
            const msg = "Points redemption is disabled.";
            setErrorMessage(msg);
            alert(msg);
            return;
        }

        const pts = Number(pointsInput || 0);

        if (!pts || pts <= 0) {
            const msg = "Enter valid points to redeem.";
            setErrorMessage(msg);
            alert(msg);
            return;
        }

        if (pts > availablePoints) {
            const msg = `Insufficient Points. You only have ${availablePoints} points`;
            setErrorMessage(msg);
            alert(msg);
            return;
        }

        const minRedeemPoints = Number(
            loyaltySettings?.minRedeemPoints ??
            loyaltySettings?.min_redeem_points ??
            paymentConfigSource?.minRedeemPoints ??
            paymentConfigSource?.min_redeem_points ??
            0
        );

        if (pts < minRedeemPoints) {
            const msg = `Minimum redeem is ${minRedeemPoints} points`;
            setErrorMessage(msg);
            alert(msg);
            return;
        }

        if (pts > maxRedeemablePoints) {
            const msg = `You can redeem maximum ${maxRedeemablePoints} points`;
            setErrorMessage(msg);
            alert(msg);
            return;
        }

        const discountValue = pts * pointValue;
        setAppliedPoints(pts);
        setPointsDiscount(discountValue);
        setErrorMessage("");
        alert(`${pts} points redeemed for ₹${discountValue.toFixed(2)}!`);
    };

    const handleApplyCoupon = async (code) => {
        setCouponLoading(true);
        try {
            const response = await apiClient.post(apiClient.Urls.applyCoupon, {
                coupon: code,
                amount: subtotal,
            });
        } catch (error) {
            setErrorMessage(error?.message || "Unable to apply coupon.");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSaveAddress = async () => {
        setSavingAddress(true);
        try {
            const nextAddress = {
                building: addressForm.building.trim(),
                doorNo: addressForm.doorNo.trim(),
                street: addressForm.street.trim(),
                landmark: addressForm.landmark.trim(),
                city: addressForm.city.trim(),
                state: addressForm.state.trim(),
                pincode: addressForm.pincode.trim(),
            };
            const response = await apiClient.post(apiClient.Urls.saveUserAddress, {
                address: nextAddress,
            });
            if (!response?.success) {
                setErrorMessage(response?.message || "Unable to save address.");
                return;
            }
            setAddressForm(EMPTY_ADDRESS);
            setErrorMessage("");
            await loadCheckoutContext();
        } catch (error) {
            setErrorMessage(error?.message || "Unable to save address.");
        } finally {
            setSavingAddress(false);
        }
    };

    const createOrder = async (type) => {
        if (!selectedAddress) {
            setErrorMessage("Please add a delivery address.");
            return;
        }

        if (!user?.id) {
            setErrorMessage("Please login to place your order.");
            return;
        }

        setPlacingOrder(true);
        setErrorMessage("");

        const resetOrderState = () => {
            setAppliedCoupon(null);
            setDiscount(0);
            setCouponCode("");
            setAppliedPoints(null);
            setPointsDiscount(0);
            setPointsInput("");
            setPaymentMethod("COD");
        };

        const createOrderPayload = {
            amount: Number(grandTotal),
            merchant_id: merchantPaymentInfo?.merchantId || merchantInfo?.merchantId,
            keyId: merchantPaymentInfo?.keyId || merchantInfo?.keyId || "",
            keySecret: merchantPaymentInfo?.keySecret || merchantInfo?.keySecret || "",
            user_id: user?.id,
            phone: user?.phone,
            items: cartItems,
            orderType: type,
            couponDiscount: Number(discount || 0),
            pointsDiscount: Number(pointsDiscount || 0),
            address: JSON.stringify(selectedAddress || {}),
        };

        try {
            const order = await apiClient.post(apiClient.Urls.createOrder, apiClient.withContext(createOrderPayload));

            if (!order?.success) {
                setErrorMessage(order?.message || "Order failed");
                return;
            }

            if (type === "COD") {
                dispatch(
                    placeOrder({
                        items: cartItems,
                        address: selectedAddress,
                        paymentMethod: "COD",
                        total: grandTotal,
                        discount,
                        pointsDiscount,
                    })
                );
                await dispatch(clearCart());
                await dispatch(getCart());
                resetOrderState();
                navigate("/order-success");
                return;
            }

            if (!razorpayLoaded || !window.Razorpay) {
                setErrorMessage("Payment gateway is not ready yet. Please try again in a moment.");
                return;
            }

            const commonFailurePayload = {
                order_id: order.id,
                merchant_id: merchantPaymentInfo?.merchantId || merchantInfo?.merchantId,
                user_id: user?.id,
                phone: user?.phone,
                items: cartItems,
                address: JSON.stringify(selectedAddress || {}),
                amount: Number(grandTotal),
                orderType: "online",
                couponDiscount: Number(discount || 0),
                pointsDiscount: Number(pointsDiscount || 0),
                status: "failure",
            };

            const options = {
                key: order.key || merchantPaymentInfo?.keyId || merchantInfo?.keyId,
                amount: order.amount,
                currency: order.currency || "INR",
                name: merchantPaymentInfo?.name || merchantInfo?.name || "Store",
                description: "Order Payment",
                order_id: order.id,
                handler: async function (response) {
                    await apiClient.post(
                        apiClient.Urls.createOrder,
                        apiClient.withContext({
                            razorpay_order_id: order.id,
                            razorpay_payment_id: response?.razorpay_payment_id,
                            razorpay_signature: response?.razorpay_signature,
                            user_id: user?.id,
                            merchant_id: merchantPaymentInfo?.merchantId || merchantInfo?.merchantId,
                            items: cartItems,
                            address: JSON.stringify(selectedAddress || {}),
                            amount: Number(grandTotal),
                            couponDiscount: Number(discount || 0),
                            pointsDiscount: Number(pointsDiscount || 0),
                            orderType: "online",
                            status: "success",
                        })
                    );

                    dispatch(
                        placeOrder({
                            items: cartItems,
                            address: selectedAddress,
                            paymentMethod: "ONLINE",
                            total: grandTotal,
                            discount,
                            pointsDiscount,
                        })
                    );
                    await dispatch(clearCart());
                    await dispatch(getCart());
                    resetOrderState();
                    navigate("/order-success");
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone,
                },
                theme: { color: "#E50914" },
                modal: {
                    ondismiss: async function () {
                        await apiClient.post(apiClient.Urls.createOrder, apiClient.withContext(commonFailurePayload));
                        setErrorMessage("Payment was cancelled.");
                    },
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", async function () {
                await apiClient.post(apiClient.Urls.createOrder, apiClient.withContext(commonFailurePayload));
                setErrorMessage("Payment failed. Please try again.");
            });

            rzp.open();
        } catch (err) {
            console.log(err);
            setErrorMessage(err?.message || "Payment error");
        } finally {
            setPlacingOrder(false);
        }
    };

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <div className="empty-icon">
                    <FaShoppingBag />
                </div>
                <h2 className="empty-title">Your Cart is Empty</h2>
                <p className="empty-description">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <button
                    className="btn btn--primary"
                    onClick={() => navigate("/categories")}
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div
            className="cart"
            style={{
                "--cart-card-bg": cardsBackgroundColor,
                "--cart-card-text": cardTextColor,
                "--cart-primary-btn-bg": primaryButtonBackgroundColor,
                "--cart-primary-btn-text": primaryButtonTextColor,
                "--cart-input-border": `${primaryButtonBackgroundColor}20`,
                "--cart-clear-btn-text": clearAllTextColor,
                "--cart-clear-btn-bg": clearAllBg,
                "--cart-clear-btn-border": clearAllBorder,
                "--cart-clear-btn-hover-bg": clearAllHoverBg,
                "--cart-item-bg": cartItemBg,
                "--cart-item-border": cartItemBorder,
                "--cart-qty-bg": qtyControlBg,
                "--cart-qty-btn-bg": qtyButtonBg,
                "--cart-qty-value": qtyValueColor,
                "--cart-qty-minus": qtyMinusColor,
                "--cart-qty-plus": qtyPlusColor,
            }}
        >
            <div className="cart__container">
                {/* Header */}
                <div className="cart__header">
                    <h3 className="cart__title">Shopping Cart</h3>
                    <div className="cart__item-count">
                        <FaShoppingBag className="icon" />
                        <span>{cartItems.reduce((sum, item) => sum + item.qty, 0)} items</span>
                    </div>
                </div>

                <div className="cart__content">
                    {/* Left Column - Cart Items */}
                    <div className="cart__items-section">
                        <div className="summary-card">
                            <div className="summary-card__header">
                                <FaMapMarkerAlt className="icon" />
                                <h3 className="section-title">Delivery Address</h3>
                            </div>

                            {selectedAddress ? (
                                <div className="address-selected">
                                    <div className="address-details">
                                        {getAddressLines(selectedAddress, user).map((line) => (
                                            <p key={line} className="address-text">{line}</p>
                                        ))}
                                    </div>
                                    <button
                                        className="btn btn--outline btn--small"
                                        onClick={() => {
                                            setAddressForm(mapAddressToForm(selectedAddress));
                                            setErrorMessage("");
                                            navigate("/address?from=cart");
                                        }}
                                    >
                                        <FaPen className="icon" />
                                        Change Address
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="address-empty"
                                    style={{
                                        background: emptyAddressBg,
                                        borderColor: emptyAddressBorder,
                                    }}
                                >
                                    <div className="address-empty__content">
                                        <FaMapMarkerAlt className="icon" style={{ color: emptyAddressTextColor }} />
                                        <div>
                                            <p style={{ color: emptyAddressTextColor }}>No address selected</p>
                                            <small style={{ color: emptyAddressSubTextColor }}>Add a delivery address to continue</small>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn--primary btn--small"
                                        onClick={() => {
                                            setAddressForm(EMPTY_ADDRESS);
                                            setErrorMessage("");
                                            navigate("/address?from=cart");
                                        }}
                                    >
                                        Add Address
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="cart__items-header">
                            <h3 className="section-title">Order Items</h3>
                            <button
                                className="btn btn--text"
                                style={{
                                    color: clearAllTextColor,
                                    background: clearAllBg,
                                    borderColor: clearAllBorder,
                                }}
                                onClick={() => dispatch(clearCart())}
                            >
                                <FaTrash className="icon" />
                                Clear All
                            </button>
                        </div>

                        <div className="cart__items-list">
                            {cartItems.map((item) => {
                                const isOutOfStock = isOutOfStockItem(item);
                                return (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item__media">
                                            <div className="cart-item__image">
                                                <img
                                                    src={item.images?.[0] || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"}
                                                    alt={item.name}
                                                />
                                            </div>
                                            <span className={`cart-item__status ${isOutOfStock ? "cart-item__status--out" : ""}`}>
                                                {isOutOfStock ? "Out of stock" : "In Cart"}
                                            </span>
                                        </div>

                                        <div className="cart-item__details">
                                            <div className="cart-item__header">
                                                <div className="cart-item__title-group">
                                                    <h4 className="cart-item__name">{item.name}</h4>
                                                    {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                                        <span className="cart-item__saving">
                                                            Save ₹{Math.max(Number(item.originalPrice) - Number(item.price), 0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className="cart-item__remove"
                                                    onClick={() => dispatch(removeItemCompletely(item))}
                                                >
                                                    <FaTrash className="icon" />
                                                </button>
                                            </div>

                                            <div className="cart-item__footer">
                                                <div className="cart-item__price-block">
                                                    <span className="cart-item__price-label">Price</span>
                                                    <div className="cart-item__price">
                                                        <span className="current-price">₹{item.price}</span>
                                                        {item.originalPrice && (
                                                            <span className="original-price">₹{item.originalPrice}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="cart-item__controls">
                                                    <button
                                                        className="qty-btn qty-btn--minus"
                                                        onClick={() => dispatch(removeFromCart(item))}
                                                    >
                                                        <FaMinus className="icon" />
                                                    </button>
                                                    <span className="qty-display">{item.qty}</span>
                                                    <button
                                                        className="qty-btn qty-btn--plus"
                                                        disabled={isOutOfStock}
                                                        onClick={() => {
                                                            if (isOutOfStock) {
                                                                setErrorMessage("This item is out of stock.");
                                                                return;
                                                            }
                                                            openPdpForItem(item);
                                                        }}
                                                    >
                                                        <FaPlus className="icon" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="cart-item__total">
                                                <span className="cart-item__total-label">Item total</span>
                                                <span>₹{Number(item.price) * item.qty}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="cart__summary-section">
                        {/* Coupon Code */}
                        <div className="summary-card">
                            <div className="summary-card__header">
                                <h3 className="section-title">Apply Coupon</h3>
                            </div>

                            <div className="coupon-section">
                                <div className="coupon-input-group">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="coupon-input"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={appliedCoupon !== null}
                                    />
                                    {appliedCoupon ? (
                                        <button
                                            className="btn btn--danger btn--small"
                                            onClick={removeCouponCode}
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn--primary btn--small"
                                            onClick={applyCouponCode}
                                            disabled={couponLoading}
                                        >
                                            {couponLoading ? "Applying..." : "Apply"}
                                        </button>
                                    )}
                                </div>

                                {appliedCoupon && (
                                    <div className="coupon-applied">
                                        <span className="coupon-success">✓ {appliedCoupon} applied!</span>
                                        <span className="coupon-savings">You saved ₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(canRedeemPoints || availablePoints > 0) && (
                            <div className="summary-card">
                                <div className="summary-card__header">
                                    <FaGift className="icon" />
                                    <h3 className="section-title">Redeem Points</h3>
                                </div>

                                <div className="coupon-section coupon-section--redeem">
                                    <p className="coupon-meta" style={{ color: mutedTextColor }}>
                                        Available: {availablePoints} points
                                        {maxRedeemablePoints > 0 ? ` • Max redeem: ${maxRedeemablePoints}` : ""}
                                    </p>
                                    {!canRedeemPoints && (
                                        <p className="coupon-disabled-note" style={{ color: mutedTextColor }}>
                                            Points redemption is currently disabled for this merchant.
                                        </p>
                                    )}
                                    <div className="coupon-input-group">
                                        <input
                                            type="number"
                                            placeholder="Enter points to redeem"
                                            className="coupon-input"
                                            value={pointsInput}
                                            onChange={(e) => setPointsInput(e.target.value)}
                                            disabled={appliedPoints !== null || !canRedeemPoints}
                                        />
                                        {appliedPoints ? (
                                            <button
                                                className="btn btn--danger btn--small"
                                                onClick={removePoints}
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn--primary btn--small"
                                                onClick={() => applyPoints()}
                                                disabled={!canRedeemPoints || loadingCheckoutData}
                                            >
                                                Redeem
                                            </button>
                                        )}
                                    </div>

                                    {appliedPoints && (
                                        <p className="coupon-redeemed-note">
                                            Redeemed {appliedPoints} points for ₹{pointsDiscount.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="summary-card">
                            <div className="summary-card__header">
                                <FaCreditCard className="icon" />
                                <h3 className="section-title">Payment Method</h3>
                            </div>

                            <div className="payment-methods">
                                {canUseCOD && (
                                    <div
                                        className={`payment-method ${paymentMethod === "COD" ? "active" : ""}`}
                                        onClick={() => setPaymentMethod("COD")}
                                    >
                                        <div className="payment-method__content">
                                            <div className="payment-method__icon">
                                                <FaWallet className="icon" />
                                            </div>
                                            <div className="payment-method__info">
                                                <h4>Cash on Delivery</h4>
                                                <p>Pay when you receive your order</p>
                                            </div>
                                        </div>
                                        <div className="payment-method__radio">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === "COD"}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                )}

                                {canUseOnline && (
                                    <div
                                        className={`payment-method ${paymentMethod === "ONLINE" ? "active" : ""}`}
                                        onClick={() => setPaymentMethod("ONLINE")}
                                    >
                                        <div className="payment-method__content">
                                            <div className="payment-method__icon">
                                                <FaLock className="icon" />
                                            </div>
                                            <div className="payment-method__info">
                                                <h4>Online Payment</h4>
                                                <p>Pay securely with card/UPI</p>
                                            </div>
                                        </div>
                                        <div className="payment-method__radio">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === "ONLINE"}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                )}

                                {!canUseCOD && !canUseOnline && (
                                    <p style={{ fontSize: "0.9rem", color: mutedTextColor }}>
                                        No payment method is available right now.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="summary-card">
                            <h3 className="section-title">Order Summary</h3>

                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? "free" : ""}>
                                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                    </span>
                                </div>

                                <div className="summary-row">
                                    <span>Tax (5%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Coupon Discount</span>
                                        <span className="discount-amount">-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}

                                {pointsDiscount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Points Discount</span>
                                        <span className="discount-amount">-₹{pointsDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="summary-row total">
                                    <span>Total Amount</span>
                                    <span className="total-amount">₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="cart-error-message" style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", fontSize: "0.9rem", marginBottom: "8px" }}>
                                {errorMessage}
                            </div>
                        )}

                        {/* Checkout Button */}
                        <button
                            className={`btn btn--order ${placingOrder || !selectedAddress || (!canUseCOD && !canUseOnline) ? "disabled" : ""}`}
                            onClick={() => createOrder(paymentMethod)}
                            disabled={placingOrder || !selectedAddress || (!canUseCOD && !canUseOnline)}
                            style={{ opacity: placingOrder ? 0.7 : 1 }}
                        >
                            <div className="order-btn__content">
                                <div className="order-btn__text">
                                    <span className="order-btn__title">{placingOrder ? "Placing Order..." : "Place Order"}</span>
                                    <span className="order-btn__subtitle">₹{grandTotal.toFixed(2)} • {paymentMethod === "COD" ? "Cash on Delivery" : "Pay Online"}</span>
                                </div>
                                <div className="order-btn__icon">
                                    <FaCheckCircle className="icon" />
                                </div>
                            </div>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;